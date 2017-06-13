# instagram-tag-image  
----  
  
search media using tag name, and cache that using redis

## initial  

```javascript
var InstagarmTagImage = require('instagram-tag-image')

var instagarmTagImage = new InstagarmTagImage({
  instagram: {
    //required
    clientId: '9e30c220028c47d8925572c64d0874ad',
    clientSecret: 'f9aba174aa374763ae79dae310da0fa2',
    redirectUri: 'http://127.0.0.1:3000/instagram/callback'
  },
  redis: {
    //redis options
    port: 6379,
    host: '127.0.0.1'
  },
  config: {
    //optional, defaults
    force: false,
    cacheTime: 60*30,//30mins
    count: 20//search limits
  }
})
```

### CONFIGS  

#### instagram

| instagram    | required  | etc     |
|:-------------|:----------|:--------|
| clientId     | true      |         |
| clientSecret | true      |         |
| redirectUri  | true      | same at develop site |

#### redis 

* [node-redis site](https://github.com/NodeRedis/node_redis)

#### config  

| config    | required  | etc     |
|:----------|:----------|:--------|
| force     | false     | force update, ignore cache|
| cacheTime | false     | cached time |
| count     | false     | search limits(media search) |


## authorization
```javascript
router.get('/', instagarmTagImage.authorize())

//callback uri
router.get('/callback', instagarmTagImage.callback())
```

## useage  

### search media by tags

```javascript
instagarmTagImage.getMedia(tag_name, function (err, result) {
// result.thumbnails()
// result.rows()
// result.standard()
//result
})
```

### search tags
```javascript
instagarmTagImage.searchTags(query, function (err, list) {

})
```

# warning  

In case of first time in search by tag, return empty array,
authorization is required, 
sometimes and suddenly, access key can be exfired 
