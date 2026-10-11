import express from 'express'
import {engine} from 'express-handlebars'
import expresssession from 'express-session'
import passport from 'passport'
import {Strategy} from 'passport-discord'
import createError from 'http-errors'
import {logger} from './logger.js'

const ensureAuthenticated = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next()
  }
  res.redirect('/login')
}

export const setupWeb = (client) => {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET must be set to start the web server')
  }
  if (!process.env.DISCORD_CLIENT || !process.env.DISCORD_CLIENT_SECRET || !process.env.WEB_URL) {
    throw new Error('DISCORD_CLIENT, DISCORD_CLIENT_SECRET and WEB_URL must be set for Discord login')
  }

  passport.use('Discord', new Strategy(
      {
        clientID: process.env.DISCORD_CLIENT,
        clientSecret: process.env.DISCORD_CLIENT_SECRET,
        callbackURL: new URL('/callback', process.env.WEB_URL).toString(),
        scope: ['identify'],
      },
      (accessToken, refreshToken, profile, done) => done(null, profile)),
  )
  passport.serializeUser((user, done) => done(null, user))
  passport.deserializeUser((user, done) => done(null, user))

  const app = express()
  app.engine('handlebars', engine())
  app.set('view engine', 'handlebars')
  app.set('views', './views')
  app.use(expresssession({
    secret: process.env.SESSION_SECRET,
    cookie: {sameSite: 'lax'},
    resave: false,
    saveUninitialized: false,
  }))
  app.use(passport.initialize({}))
  app.use(passport.session({}))

  app.get('/login', passport.authenticate('Discord'))
  app.get('/callback',
      passport.authenticate('Discord', {failureRedirect: '/'}),
      (req, res) => res.redirect('/'),
  )
  app.get('/logout', (req, res) => {
    req.logout(() => res.redirect('/'))
  })

  app.get('/', ensureAuthenticated, (req, res) => {
    res.render('home', {servers: Array.from(client.guilds.cache.values())})
  })
  app.get('/server/:serverID', ensureAuthenticated, async (req, res, next) => {
    client.guilds.fetch(req.params['serverID'])
        .then(guild => res.render('server', {server: guild}))
        .catch(next)
  })
  app.use(express.static('public/'))

  app.use((req, res, next) => next(createError(404)))
  app.use((error, req, res, next) => {
    logger.error(error)
    res.status(error.status ?? 500).send(error.message)
  })

  app.listen(process.env.WEB_PORT, () => logger.info(`Web server listening at http://localhost:${process.env.WEB_PORT}`))
}
