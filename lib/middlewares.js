'use strict'
const querystring = require('querystring')

var Middlewares = function () {}

Middlewares.prototype.authorize = function () {
  var self = this
  return function (req, res, next) {
    var authUri = 'https://api.instagram.com/oauth/authorize/?'
    var qs = querystring.stringify({
      client_id: self._instagramConfig.clientId,
      redirect_uri: self._instagramConfig.redirectUri,
      response_type: 'code',
      scope: 'public_content'
    })
    // public_content
    res.redirect(authUri + qs)
  }
}

Middlewares.prototype.callback = function () {
  var self = this
  return function (req, res, next) {
    var code = req.query.code
    var path = '/oauth/access_token'
    var data = {
      client_id: self._instagramConfig.clientId,
      client_secret: self._instagramConfig.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: self._instagramConfig.redirectUri,
      code: code
    }
    self._request.post(path, data, function (err, result) {
      if (err) {
        return res.json({success: false})
      }else {
        self._redisClient.saveAccessToken(result.access_token, function () {
          self._auth.access_token = result.access_token
          res.json({success: true})
        })
      }
    })
  }
// https://api.instagram.com/oauth/authorize/?client_id=CLIENT-ID&redirect_uri=REDIRECT-URI&response_type=code
}

module.exports = Middlewares
