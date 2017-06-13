'use strict'
const request = require('./request')
const middlewares = require('./middlewares')
const RedisClient = require('./redisClient')
const images = require('./images')

const debug = true

var Instagram = function (opts) {
  var self = this

  this._instagramConfig = {
    clientId: null,
    clientSecret: null,
    redirectUri: null
  }
  this._config = {
    cacheTime: 60 * 30,
    force: false,
    enableFirstTime: false,
    count: 20
  }

  // redis default config
  this._redisConfig = {}

  this._auth = {
    accessToken: null
  }

  this._redisClient = null
  this._request = null
  const requiredInstagramOpt = ['clientId', 'clientSecret', 'redirectUri']
  for (let key of requiredInstagramOpt) {
    if (opts.instagram[key] == undefined) {
      throw new Error(key + ' is required')
    }

    this._instagramConfig[key] = opts.instagram[key]
  }

  if (opts.config) {
    const configOpt = ['cacheTime', 'force', 'count', 'enableFirstTime']
    for (let key of configOpt) {
      if (opts.config[key] !== undefined) {
        this._config[key] = opts.config[key]
      }
    }
  }

  this._redisConfig = opts.redis
  this._redisClient = new RedisClient(this.redisConfig, function () {
    if (debug) {
    }
    self._redisClient.retieveAccessToken(function (access_token) {
      self._auth.accessToken = access_token
      self._redisClient.setLoadState(false, function () {
        self.loadQueue()
      })
    })
  })

  this._request = request
}

Instagram.prototype = new middlewares()

Instagram.prototype.searchMediaByTag = function (tag, cb) {
  if (!this._auth.accessToken) {
    return cb(new Error('OAuthAccessTokenException'))
  }

  var self = this
  var path = '/v1/tags/' + encodeURIComponent(tag) + '/media/recent'
  var data = {
    access_token: self._auth.accessToken,
    count: self._config.count
  }
  self._request.get(path, data, function (err, result) {
    if (!err && result.meta.code == 200) {
      return cb(err, result)
    }
    if (!err && result.meta.code == 400) {
      err = new Error('OAuthAccessTokenException')

      if (self._auth.accessToken) {
        self._auth.accessToken = null
        self._redisClient.deleteAccessToken()
      }
    }

    cb(err, result)
  })
}

Instagram.prototype.searchTags = function (q, cb) {
  if (!this._auth.accessToken) {
    return cb(new Error('OAuthAccessTokenException'))
  }

  var self = this
  var path = '/v1/tags/search'
  var data = {
    access_token: self._auth.accessToken,
    q: q
  }

  self._request.get(path, data, function (err, result) {
    if (!err && result.meta.code == 200) {
      return cb(err, result)
    }
    if (!err && result.meta.code == 400) {
      err = new Error('OAuthAccessTokenException')
      if (self._auth.accessToken) {
        self._auth.accessToken = null
        self._redisClient.deleteAccessToken()
      }
    }

    cb(err, result)
  })
}

Instagram.prototype.getMedia = function (tag, cb) {
  if (!this._auth.accessToken) {
    return cb(new Error('OAuthAccessTokenException'))
  }

  var self = this

  self._redisClient.getMediaByTags(tag, function (err, result, exist) {
    if (err) {
      return cb(err)
    }
    if (exist || !self._config.enableFirstTime) {
      result = new images(result)
      cb(err, result)
    } else {
      self.searchMediaByTag(tag, function (err, result) {
        result = new images(result)
        cb(err, result)
      })
    }
  })

  self.insertQueue(tag)
}

Instagram.prototype.updateTag = function (tag, cb) {
  var self = this
  self._redisClient.updateTag(tag, self._config.cacheTime, false, function (needUpdate) {
    if (self._config.force || needUpdate) {
      self.searchMediaByTag(tag, function (err, result) {
        if (err) {
          return cb(err)
        }
        var list = result.data
        self._redisClient.setMediaByTags(tag, list, cb)
      })
    }else {
      cb()
    }
  })
}

Instagram.prototype.loadQueue = function (cb) {
  var self = this
  self._redisClient.getLoadState(function (err, loading) {
    if (loading) {
      cb && cb()
    } else {
      self._redisClient.setLoadState(true, function () {
        self.loadQueueTask()
      })
    }
  })
}

Instagram.prototype.loadQueueTask = function () {
  var self = this
  self._redisClient.popTag(function (tag) {
    if (tag) {
      self.updateTag(tag, function () {
        self.loadQueueTask()
      })
    }else {
      self._redisClient.setLoadState(false)
    }
  })
}

Instagram.prototype.insertQueue = function (tag, cb) {
  var self = this
  self._redisClient.updateTag(tag, self._config.cacheTime, true, function (needUpdate) {
    if (needUpdate) {
      self._redisClient.pushTag(tag, function () {
        self.loadQueue()
      })
    }

    cb && cb()
  })
}

module.exports = Instagram
