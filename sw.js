/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-7e5eb42b'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "402b66900e731ca748771b6fc5e7a068"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "baa800c9ec20b53cc74b7ca69fd4b313"
  }, {
    "url": "pwa-512x512.png",
    "revision": "2fd93be8008ba571a2d30467eabc9a70"
  }, {
    "url": "pwa-192x192.png",
    "revision": "ddc3a0ea6f4fb8a6d3f43ff0c8d56b4f"
  }, {
    "url": "index.html",
    "revision": "c646e51f32d9ba54a9affb748fc023aa"
  }, {
    "url": "icon.svg",
    "revision": "903564c038cf0949140279ab10afbcde"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a9fa3eb0ca88ef3142b65b1cffabbf95"
  }, {
    "url": "404.html",
    "revision": "58ef27bd450d3baf0a0a6e6c4e82abf5"
  }, {
    "url": "assets/app.js",
    "revision": null
  }, {
    "url": "assets/app.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "a9fa3eb0ca88ef3142b65b1cffabbf95"
  }, {
    "url": "icon.svg",
    "revision": "903564c038cf0949140279ab10afbcde"
  }, {
    "url": "pwa-192x192.png",
    "revision": "ddc3a0ea6f4fb8a6d3f43ff0c8d56b4f"
  }, {
    "url": "pwa-512x512.png",
    "revision": "2fd93be8008ba571a2d30467eabc9a70"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "baa800c9ec20b53cc74b7ca69fd4b313"
  }, {
    "url": "manifest.webmanifest",
    "revision": "2a499d6e92d073a459c35ea39ea4bcd9"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
