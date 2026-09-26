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
    "revision": "e72dc7a0ca9803a24f3a916cf1fc8585"
  }, {
    "url": "pwa-512x512.png",
    "revision": "e72dc7a0ca9803a24f3a916cf1fc8585"
  }, {
    "url": "pwa-192x192.png",
    "revision": "c8efb56fad8ca57f70eead4575d0a3ab"
  }, {
    "url": "index.html",
    "revision": "5184335b716e204ce52587f5813db028"
  }, {
    "url": "icon.svg",
    "revision": "903564c038cf0949140279ab10afbcde"
  }, {
    "url": "favicon-32x32.png",
    "revision": "187c3c40e83d28a14aae37455d5abd43"
  }, {
    "url": "favicon-16x16.png",
    "revision": "e69944bc3b2f4591b8a2d827a8fad218"
  }, {
    "url": "apple-touch-icon.png",
    "revision": "985a052d9a180f187ae3c1461f228976"
  }, {
    "url": "404.html",
    "revision": "58ef27bd450d3baf0a0a6e6c4e82abf5"
  }, {
    "url": "assets/pwa-512x512.png",
    "revision": null
  }, {
    "url": "assets/pwa-192x192.png",
    "revision": null
  }, {
    "url": "assets/icon.svg",
    "revision": null
  }, {
    "url": "assets/apple-touch-icon.png",
    "revision": null
  }, {
    "url": "assets/app.js",
    "revision": null
  }, {
    "url": "assets/app.css",
    "revision": null
  }, {
    "url": "apple-touch-icon.png",
    "revision": "985a052d9a180f187ae3c1461f228976"
  }, {
    "url": "icon.svg",
    "revision": "903564c038cf0949140279ab10afbcde"
  }, {
    "url": "pwa-192x192.png",
    "revision": "c8efb56fad8ca57f70eead4575d0a3ab"
  }, {
    "url": "pwa-512x512.png",
    "revision": "e72dc7a0ca9803a24f3a916cf1fc8585"
  }, {
    "url": "pwa-maskable-512x512.png",
    "revision": "e72dc7a0ca9803a24f3a916cf1fc8585"
  }, {
    "url": "manifest.webmanifest",
    "revision": "a741d40f7c88d1f579c804e39ff1866f"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));

}));
