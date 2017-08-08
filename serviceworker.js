/**
 * serviceworker.js
 * 
 * Designed, built, and released under MIT license by @myanbin. Learn more at
 * https://github.com/myanbin
 */


const CACHE_VERSION = 'v4';
const CACHE_FILES = [
  '/',
  '/index.html',
  '/about.html',
  '/link.html',
  '/offline.html',
  '/public/css/styles.css',
  '/public/fonts/icomoon.ttf',
  '/public/img/cat.jpg',
  '/public/img/redflag.jpg',
  '/public/img/sierra.jpg',
  '/public/img/skyline.jpg',
  '/public/img/buckow.jpg',
  '/public/js/drawer.js'
];
const IGNORE_LISTS = [
  'www.google-analytics.com',
  'dn-lbstatics.qbox.me'
];


this.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_VERSION).then(function (cache) {
      return cache.addAll(CACHE_FILES);
    })
  );
});

this.addEventListener('fetch', function (event) {
  // 在离线状态下跳过对统计代码的 Fetch
  if (shouldAlwaysFetch(event.request)) {
    event.respondWith(
      fetch(event.request).then(function (response) {
        return response;
      })
      .catch(function () {
        return new Response('');
      })
    );
    return;
  }
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response !== undefined) {
        return response;
      }
      let requestClone = event.request.clone();
      return fetch(requestClone).then(function (response) {
        if (response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        let responseClone = response.clone();
        caches.open(CACHE_VERSION).then(function (cache) {
          cache.put(event.request, responseClone);
        });
        return response;
      }).catch(function () {
        return offlineResponse(event.request);
      });
    })
  );
});

/**
 * 用于清空旧的 Cache
 */
this.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function (keyList) {
      return Promise.all(keyList.map(function (key) {
        if (CACHE_VERSION !== key) {
          return caches.delete(key);
        }
      }));
    })
  );
});

let shouldAlwaysFetch = function (request) {
  return request.method !== 'GET' || IGNORE_LISTS.some(function (domain) {
    return request.url.match(domain);
  })
};

let offlineResponse = function (request) {
  return caches.match('/offline.html');
};