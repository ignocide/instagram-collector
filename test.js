var instaCollector = require('./')

instaCollector.init({
  instagram: {
    clientId: '9e30c220028c47d8925572c64d0874ad',
    clientSecret: 'f9aba174aa374763ae79dae310da0fa2',
    redirectUri: 'http://dev.hicharis.net/callback',
    username: 'morse+instagram@madsq.net',
    password: 'madsq0116'
  },
  redis: {
    port: 6379,
    host: '127.0.0.1'
  }

})

instaCollector.callback({
  query: {
    code: '01af3bb3651949cd872b66cafa6861dc'
  }
}, {}, {})

setTimeout(function () {
  instaCollector.getTag()
}, 1000)

setTimeout(function () {
  instaCollector.searchMediaByTag()
}, 1000)
