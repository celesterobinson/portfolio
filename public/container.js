(function() {
  window._satellite = window._satellite || {};
  window._satellite.container = {
  "dataElements": {},
  "rules": [],
  "extensions": {
    "hotjar": {
      "displayName": "Hotjar",
      "settings": {
        "siteId": "930763"
      },
      "hostedLibFilesBaseUrl": "/hostedLibFiles/hotjar/1.0.0/",
      "modules": {
        "hotjar/src/lib/helpers/trackingCode.js": {
          "script": function(module, exports, require, turbine) {
'use strict';

var siteId = turbine.getExtensionSettings().siteId;

(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:siteId,hjsv:6};
    a=o.getElementsByTagName('head')[0];
    r=o.createElement('script');r.async=1;
    r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
    a.appendChild(r);
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
}

        }
      }
    },
    "sandbox": {
      "displayName": "Extension Sandbox",
      "modules": {
        "sandbox/click.js": {
          "displayName": "Click",
          "name": "click",
          "script": function(module) {
            module.exports = function(settings, trigger) {
              document.addEventListener('click', function(event) {
                trigger({
                  nativeEvent: event
                });
              });
            };
          }
        },
        "sandbox/pageTop.js": {
          "displayName": "Page Top",
          "name": "page-top",
          "script": function(module) {
            module.exports = function(settings, trigger) {
              trigger();
            };
          }
        },
        "sandbox/localStorage.js": {
          "script": function(module) {
            module.exports = function(settings) {
              // When local storage is disabled on Safari, the mere act of referencing
              // window.localStorage throws an error. For this reason, referencing
              // window.localStorage without being inside a try-catch should be avoided.
              try {
                return window.localStorage.getItem(settings.name);
              } catch (e) {
                return null;
              }
            };
          }
        }
      }
    }
  },
  "property": {
    "settings": {}
  },
  "buildInfo": {
    "turbineVersion": "25.1.0",
    "turbineBuildDate": "2018-07-11T14:53:45.537Z",
    "buildDate": "2018-07-11T14:53:45.537Z",
    "environment": "development"
  }
}
})();