// Service Worker for My Shop PWA
var CACHE_NAME = 'myshop-v0.9';
var urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(urlsToCache);
    }).catch(function(err){console.log('SW install error:',err);})
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(name){return name !== CACHE_NAME;}).map(function(name){return caches.delete(name);})
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  // Only cache GET requests, skip Firebase API calls
  if (event.request.method !== 'GET') return;
  if (event.request.url.indexOf('firebase') > -1) return;
  if (event.request.url.indexOf('gstatic') > -1) return;
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request).then(function(resp){
        if(!resp || resp.status !== 200 || resp.type !== 'basic') return resp;
        var respClone = resp.clone();
        caches.open(CACHE_NAME).then(function(cache){cache.put(event.request, respClone);});
        return resp;
      });
    }).catch(function(){
      return caches.match('./index.html');
    })
  );
});
