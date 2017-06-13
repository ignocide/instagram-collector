'use strict'

const request = require('request')

var REQUEST = function () {
  this.baseUrl = 'https://api.instagram.com'
}

REQUEST.prototype.get = function (url, data, callback) {
  var self = this
  var opt = {
    url: self.baseUrl + url,
    qs: data
  }

  request.get(opt, function (err, res, body) {
    try {
      if (res.statusCode == 404) {
        err = 'Not Found'
        body = null
      }
      else if (!err && res.statueCode !== 302) body = JSON.parse(body)
    } catch (e) {
      err = err ? err : e
      body = null
    }
    callback(err, body)
  })
}

REQUEST.prototype.post = function (url, data, callback) {
  var self = this
  var opt = {
    url: self.baseUrl + url,
    form: data
  }
  request.post(opt, function (err, res, body) {
    try {
      if (res.statusCode == 404) {
        err = 'Not Found'
        body = null
      }
      body = JSON.parse(body)
    } catch (e) {
      err = err ? err : e
      body = null
    }
    callback(err, body)
  })
}

REQUEST.prototype.request = function () {
  return request
}
module.exports = new REQUEST()
