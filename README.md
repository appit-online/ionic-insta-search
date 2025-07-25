# [ionic-insta-search: Node.js](https://github.com/appit-online/ionic-insta-search)

Search reels, posts,... on Instagram without API key in ionic apps

**Table of contents:**


* [Quickstart](#quickstart)

  * [Installing the library](#installing-the-library)
  * [Using the library](#using-the-library)
* [License](#license)

## Quickstart

### Installing the library

```bash
ionic cordova plugin add cordova-plugin-advanced-http
npm install ionic-insta-search --save
```


### Using the library

```javascript
import * as insta from 'ionic-insta-search';

/**
 * Given a search query, searching on insta
 * @param {string} search value (videoId).
 */
const videos = await insta.search('XYZ');
const videos = await insta.search('https://www.instagram.com/p/XYZ');
console.log(videos);

{
  "resultsCount": 7,
   "urls": [
    "https://scontent-muc2-1.cdninstagram.com/v...",
    ....
  ],
  "postInfo": {
    "ownerUsername": "appit-online",
            "ownerName": "AppIT",
            "isVerified": false,
            "isPrivate": false,
            "commentsDisabled": false,
            "likeCounterDisabled": false,
            "location": "Mountains Spot",
            "followers": 15962,
            "likes": 4120,
            "isAd": false,
            "caption": "#sudtirol #dolomiti....",
            "createdAt": "1738502812"
  },
  "media": [
    {
      "type": "image",
      "dimensions": {
        "height": 1350,
        "width": 1080
      },
      "url": "https://scontent-muc2-1.cdninstagram.com/v..."
    },...
  ]
}

```

## Supported Node.js Versions

Our client libraries follow the [Node.js release schedule](https://nodejs.org/en/about/releases/).
Libraries are compatible with all current _active_ and _maintenance_ versions of
Node.js.

## License

Apache Version 2.0

See [LICENSE](https://github.com/appit-online/ionic-insta-search/blob/master/LICENSE)
