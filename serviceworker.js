/*
  Copyright 2016 Google Inc. All Rights Reserved.
  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
      http://www.apache.org/licenses/LICENSE-2.0
  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

'use strict';

importScripts('/public/js/sw-toolbox.min.js');

self.toolbox.options.cache.name = 'static-cache';

self.toolbox.router.get('/public/css/styles.css', self.toolbox.cacheFirst);
self.toolbox.router.get('/public/fonts/icomoon.ttf', self.toolbox.cacheFirst);
self.toolbox.router.get('/public/images/(.*)', self.toolbox.cacheFirst);
self.toolbox.router.get('/public/js/(.*)', self.toolbox.cacheFirst);

// Cache images and css/js in third website
self.toolbox.router.get("/(.*)", self.toolbox.fastest, {
  origin: /(infp\.github\.io)/
});

self.toolbox.router.get("/(.*)", self.toolbox.cacheFirst, {
  origin: /(cdn\.bootcss\.com)/
});

// Network Only for Analytics Code
self.toolbox.router.get("/(.*)", self.toolbox.networkOnly, {
  origin: /(www\.google-analytics\.com|ssl\.google-analytics\.com)/
});

self.toolbox.router.get("/(.*)", self.toolbox.networkOnly, {
  origin: /(dn-lbstatics\.qbox\.me)/
});

// For Posts Page
self.toolbox.router.get('/post/(.*)', self.toolbox.fastest);


self.toolbox.precache([
  '/',
  '/index.html',
  '/link.html',
  '/about.html',
  '/public/css/styles.css',
  '/public/images/logo@white.png'
]);
