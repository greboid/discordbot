import express from 'express'
import {engine} from 'express-handlebars'
import expresssession from 'express-session'
import passport from 'passport'
import {Strategy} from 'passport-discord'
import createError from 'http-errors'

export const setupWeb = (client) => {
  const session = {
    secret:            process.env.SESSION_SECRET,
    cookie:            {},
    resave:            false,
    saveUninitialized: false,
  }
  passport.use('Discord', new Strategy(
      {
        clientID:     'id',
        clientSecret: 'secret',
        callbackURL:  'callbackURL',
        scope:        ['identify'],
      },
      (accessToken, refreshToken, extraParams, profile, done) => done(null, profile)),
  )
  const app = express()
  app.engine('handlebars', engine())
  app.set('view engine', 'handlebars')
  app.set('views', './views')
  app.use(expresssession(session))
  app.use(passport.initialize({}))
  app.use(passport.session({}))

  app.get('/', (req, res) => {
    res.render('home', {servers: client.guilds.cache.values()})
  })
  app.get('/server/:serverID', async (req, res, next) => {
    client.guilds.fetch(req.params['serverID'])
          .then(guild => res.render('server', {server: guild}))
        .catch(next)
  })
  app.use(express.static('public/'));
  app.listen(process.env.WEB_PORT, () => console.log(`App listening at http://localhost:${process.env.WEB_PORT}`))
}
