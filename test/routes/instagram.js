var express = require('express')
// instagram
var InstaCollector = require('../../index')

var instaCollector = new InstaCollector({
  instagram: {
    clientId: '9e30c220028c47d8925572c64d0874ad',
    clientSecret: 'f9aba174aa374763ae79dae310da0fa2',
    redirectUri: 'http://127.0.0.1:3000/instagram/callback'
  },
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }
})
var router = express.Router()

/* GET home page. */
router.get('/', instaCollector.authorize())

router.get('/callback', instaCollector.callback())

router.get('/tag/:tag_name', function (req, res, next) {
  instaCollector.getMedia(req.params.tag_name, function (err, result) {
    // filter thumbnails
    // result.thumbnails()
    // filter lows
    // result.rows()
    res.json(result.standards())
  })
})

router.get('/tags/:q', function (req, res, next) {
  instaCollector.searchTags(req.params.q, function (err, list) {
    res.json(list)
  })
})

module.exports = router
