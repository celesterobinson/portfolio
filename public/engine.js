var _satellite = (function () {
'use strict';

if (!window.atob) { console.warn('Adobe Launch is unsupported in IE 9 and below.'); return; }

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Log levels.
 * @readonly
 * @enum {string}
 * @private
 */
var levels = {
  LOG: 'log',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

/**
 * Rocket unicode surrogate pair.
 * @type {string}
 */
var ROCKET = '\uD83D\uDE80';

/**
 * The user's internet explorer version. If they're not running internet explorer, then it should
 * be NaN.
 * @type {Number}
 */
var ieVersion = parseInt((/msie (\d+)/.exec(navigator.userAgent.toLowerCase()) || [])[1]);

/**
 * Prefix to use on all messages. The rocket unicode doesn't work on IE 10.
 * @type {string}
 */
var launchPrefix = ieVersion === 10 ? '[Launch]' : ROCKET;

/**
 * Whether logged messages should be output to the console.
 * @type {boolean}
 */
var outputEnabled = false;

/**
 * Processes a log message.
 * @param {string} level The level of message to log.
 * @param {...*} arg Any argument to be logged.
 * @private
 */
var process = function(level) {
  if (outputEnabled && window.console) {
    var logArguments = Array.prototype.slice.call(arguments, 1);
    logArguments.unshift(launchPrefix);
    window.console[level].apply(window.console, logArguments);
  }
};

/**
 * Outputs a message to the web console.
 * @param {...*} arg Any argument to be logged.
 */
var log = process.bind(null, levels.LOG);

/**
 * Outputs informational message to the web console. In some browsers a small "i" icon is
 * displayed next to these items in the web console's log.
 * @param {...*} arg Any argument to be logged.
 */
var info = process.bind(null, levels.INFO);

/**
 * Outputs a warning message to the web console.
 * @param {...*} arg Any argument to be logged.
 */
var warn = process.bind(null, levels.WARN);

/**
 * Outputs an error message to the web console.
 * @param {...*} arg Any argument to be logged.
 */
var error = process.bind(null, levels.ERROR);

var logger = {
  log: log,
  info: info,
  warn: warn,
  error: error,
  /**
   * Whether logged messages should be output to the console.
   * @type {boolean}
   */
  get outputEnabled() {
    return outputEnabled;
  },
  set outputEnabled(value) {
    outputEnabled = value;
  },
  /**
   * Creates a logging utility that only exposes logging functionality and prefixes all messages
   * with an identifier.
   */
  createPrefixedLogger: function(identifier) {
    var loggerSpecificPrefix = '[' + identifier + ']';

    return {
      log: log.bind(null, loggerSpecificPrefix),
      info: info.bind(null, loggerSpecificPrefix),
      warn: warn.bind(null, loggerSpecificPrefix),
      error: error.bind(null, loggerSpecificPrefix)
    };
  }
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/



/**
 * Replacing any variable tokens (%myDataElement%, %this.foo%, etc.) with their associated values.
 * A new string, object, or array will be created; the thing being processed will never be
 * modified.
 * @param {*} thing Thing potentially containing variable tokens. Objects and arrays will be
 * deeply processed.
 * @param {HTMLElement} [element] Associated HTML element. Used for special tokens
 * (%this.something%).
 * @param {Object} [event] Associated event. Used for special tokens (%event.something%,
 * %target.something%)
 * @returns {*} A processed value.
 */
var createReplaceTokens = function(isVar, getVar, undefinedVarsReturnEmpty) {
  var replaceTokensInString;
  var replaceTokensInObject;
  var replaceTokensInArray;
  var replaceTokens;
  var variablesBeingRetrieved = [];

  var getVarValue = function(token, variableName, syntheticEvent) {
    if (!isVar(variableName)) {
      return token;
    }

    variablesBeingRetrieved.push(variableName);
    var val = getVar(variableName, syntheticEvent);
    variablesBeingRetrieved.pop();
    return val == null && undefinedVarsReturnEmpty ? '' : val;
  };

  /**
   * Perform variable substitutions to a string where tokens are specified in the form %foo%.
   * If the only content of the string is a single data element token, then the raw data element
   * value will be returned instead.
   *
   * @param str {string} The string potentially containing data element tokens.
   * @param element {HTMLElement} The element to use for tokens in the form of %this.property%.
   * @param event {Object} The event object to use for tokens in the form of %target.property%.
   * @returns {*}
   */
  replaceTokensInString = function(str, syntheticEvent) {
    // Is the string a single data element token and nothing else?
    var result = /^%([^%]+)%$/.exec(str);

    if (result) {
      return getVarValue(str, result[1], syntheticEvent);
    } else {
      return str.replace(/%(.+?)%/g, function(token, variableName) {
        return getVarValue(token, variableName, syntheticEvent);
      });
    }
  };

  replaceTokensInObject = function(obj, syntheticEvent) {
    var ret = {};
    var keys = Object.keys(obj);
    for (var i = 0; i < keys.length; i++) {
      var key = keys[i];
      var value = obj[key];
      ret[key] = replaceTokens(value, syntheticEvent);
    }
    return ret;
  };

  replaceTokensInArray = function(arr, syntheticEvent) {
    var ret = [];
    for (var i = 0, len = arr.length; i < len; i++) {
      ret.push(replaceTokens(arr[i], syntheticEvent));
    }
    return ret;
  };

  replaceTokens = function(thing, syntheticEvent) {
    if (typeof thing === 'string') {
      return replaceTokensInString(thing, syntheticEvent);
    } else if (Array.isArray(thing)) {
      return replaceTokensInArray(thing, syntheticEvent);
    } else if (typeof thing === 'object' && thing !== null) {
      return replaceTokensInObject(thing, syntheticEvent);
    }

    return thing;
  };

  return function(thing, syntheticEvent) {
    // It's possible for a data element to reference another data element. Because of this,
    // we need to prevent circular dependencies from causing an infinite loop.
    if (variablesBeingRetrieved.length > 10) {
      logger.error('Data element circular reference detected: ' +
        variablesBeingRetrieved.join(' -> '));
      return thing;
    }

    return replaceTokens(thing, syntheticEvent);
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

var createSetCustomVar = function(customVars) {
  return function() {
    if (typeof arguments[0] === 'string') {
      customVars[arguments[0]] = arguments[1];
    } else if (arguments[0]) { // assume an object literal
      var mapping = arguments[0];
      for (var key in mapping) {
        customVars[key] = mapping[key];
      }
    }
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * "Cleans" text by trimming the string and removing spaces and newlines.
 * @param {string} str The string to clean.
 * @returns {string}
 */
var cleanText = function(str) {
  return typeof str === 'string' ? str.replace(/\s+/g, ' ').trim() : str;
};

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};





function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var js_cookie = createCommonjsModule(function (module, exports) {
/*!
 * JavaScript Cookie v2.1.4
 * https://github.com/js-cookie/js-cookie
 *
 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
 * Released under the MIT license
 */
(function (factory) {
	var registeredInModuleLoader = false;
	if (typeof undefined === 'function' && undefined.amd) {
		undefined(factory);
		registeredInModuleLoader = true;
	}
	{
		module.exports = factory();
		registeredInModuleLoader = true;
	}
	if (!registeredInModuleLoader) {
		var OldCookies = window.Cookies;
		var api = window.Cookies = factory();
		api.noConflict = function () {
			window.Cookies = OldCookies;
			return api;
		};
	}
}(function () {
	function extend () {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[ i ];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	}

	function init (converter) {
		function api (key, value, attributes) {
			var result;
			if (typeof document === 'undefined') {
				return;
			}

			// Write

			if (arguments.length > 1) {
				attributes = extend({
					path: '/'
				}, api.defaults, attributes);

				if (typeof attributes.expires === 'number') {
					var expires = new Date();
					expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
					attributes.expires = expires;
				}

				// We're using "expires" because "max-age" is not supported by IE
				attributes.expires = attributes.expires ? attributes.expires.toUTCString() : '';

				try {
					result = JSON.stringify(value);
					if (/^[\{\[]/.test(result)) {
						value = result;
					}
				} catch (e) {}

				if (!converter.write) {
					value = encodeURIComponent(String(value))
						.replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
				} else {
					value = converter.write(value, key);
				}

				key = encodeURIComponent(String(key));
				key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
				key = key.replace(/[\(\)]/g, escape);

				var stringifiedAttributes = '';

				for (var attributeName in attributes) {
					if (!attributes[attributeName]) {
						continue;
					}
					stringifiedAttributes += '; ' + attributeName;
					if (attributes[attributeName] === true) {
						continue;
					}
					stringifiedAttributes += '=' + attributes[attributeName];
				}
				return (document.cookie = key + '=' + value + stringifiedAttributes);
			}

			// Read

			if (!key) {
				result = {};
			}

			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling "get()"
			var cookies = document.cookie ? document.cookie.split('; ') : [];
			var rdecode = /(%[0-9A-Z]{2})+/g;
			var i = 0;

			for (; i < cookies.length; i++) {
				var parts = cookies[i].split('=');
				var cookie = parts.slice(1).join('=');

				if (cookie.charAt(0) === '"') {
					cookie = cookie.slice(1, -1);
				}

				try {
					var name = parts[0].replace(rdecode, decodeURIComponent);
					cookie = converter.read ?
						converter.read(cookie, name) : converter(cookie, name) ||
						cookie.replace(rdecode, decodeURIComponent);

					if (this.json) {
						try {
							cookie = JSON.parse(cookie);
						} catch (e) {}
					}

					if (key === name) {
						result = cookie;
						break;
					}

					if (!key) {
						result[name] = cookie;
					}
				} catch (e) {}
			}

			return result;
		}

		api.set = api;
		api.get = function (key) {
			return api.call(api, key);
		};
		api.getJSON = function () {
			return api.apply({
				json: true
			}, [].slice.call(arguments));
		};
		api.defaults = {};

		api.remove = function (key, attributes) {
			api(key, '', extend(attributes, {
				expires: -1
			}));
		};

		api.withConverter = init;

		return api;
	}

	return init(function () {});
}));
});

'use strict';



// js-cookie has other methods that we haven't exposed here. By limiting the exposed API,
// we have a little more flexibility to change the underlying implementation later. If clear
// use cases come up for needing the other methods js-cookie exposes, we can re-evaluate whether
// we want to expose them here.
var reactorCookie = {
  get: js_cookie.get,
  set: js_cookie.set,
  remove: js_cookie.remove
};

'use strict';

var reactorWindow = window;

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/


var NAMESPACE = 'com.adobe.reactor.';

var getNamespacedStorage = function(storageType, additionalNamespace) {
  var finalNamespace = NAMESPACE + (additionalNamespace || '');

  // When storage is disabled on Safari, the mere act of referencing window.localStorage
  // or window.sessionStorage throws an error. For this reason, we wrap in a try-catch.
  return {
    /**
     * Reads a value from storage.
     * @param {string} name The name of the item to be read.
     * @returns {string}
     */
    getItem: function(name) {
      try {
        return reactorWindow[storageType].getItem(finalNamespace + name);
      } catch (e) {
        return null;
      }
    },
    /**
     * Saves a value to storage.
     * @param {string} name The name of the item to be saved.
     * @param {string} value The value of the item to be saved.
     * @returns {boolean} Whether the item was successfully saved to storage.
     */
    setItem: function(name, value) {
      try {
        reactorWindow[storageType].setItem(finalNamespace + name, value);
        return true;
      } catch (e) {
        return false;
      }
    }
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/




var COOKIE_PREFIX = '_sdsat_';

var DATA_ELEMENTS_NAMESPACE = 'dataElements.';
var MIGRATED_KEY = 'dataElementCookiesMigrated';

var reactorLocalStorage = getNamespacedStorage('localStorage');
var dataElementSessionStorage = getNamespacedStorage('sessionStorage', DATA_ELEMENTS_NAMESPACE);
var dataElementLocalStorage = getNamespacedStorage('localStorage', DATA_ELEMENTS_NAMESPACE);

var storageDurations = {
  PAGEVIEW: 'pageview',
  SESSION: 'session',
  VISITOR: 'visitor'
};

var pageviewCache = {};

var serialize = function(value) {
  var serialized;

  try {
    // On some browsers, with some objects, errors will be thrown during serialization. For example,
    // in Chrome with the window object, it will throw "TypeError: Converting circular structure
    // to JSON"
    serialized = JSON.stringify(value);
  } catch (e) {}

  return serialized;
};

var setValue = function(key, storageDuration, value) {
  var serializedValue;

  switch (storageDuration) {
    case storageDurations.PAGEVIEW:
      pageviewCache[key] = value;
      return;
    case storageDurations.SESSION:
      serializedValue = serialize(value);
      if (serializedValue) {
        dataElementSessionStorage.setItem(key, serializedValue);
      }
      return;
    case storageDurations.VISITOR:
      serializedValue = serialize(value);
      if (serializedValue) {
        dataElementLocalStorage.setItem(key, serializedValue);
      }
      return;
  }
};

var getValue = function(key, storageDuration) {
  var value;

  // It should consistently return the same value if no stored item was found. We chose null,
  // though undefined could be a reasonable value as well.
  switch (storageDuration) {
    case storageDurations.PAGEVIEW:
      return pageviewCache.hasOwnProperty(key) ? pageviewCache[key] : null;
    case storageDurations.SESSION:
      value = dataElementSessionStorage.getItem(key);
      return value === null ? value : JSON.parse(value);
    case storageDurations.VISITOR:
      value = dataElementLocalStorage.getItem(key);
      return value === null ? value : JSON.parse(value);
  }
};

// Remove when migration period has ended. We intentionally leave cookies as they are so that if
// DTM is running on the same domain it can still use the persisted values. Our migration strategy
// is essentially copying data from cookies and then diverging the storage mechanism between
// DTM and Launch (DTM uses cookies and Launch uses session and local storage).
var migrateDataElement = function(dataElementName, storageDuration) {
  var storedValue = reactorCookie.get(COOKIE_PREFIX + dataElementName);

  if (storedValue !== undefined) {
    setValue(dataElementName, storageDuration, storedValue);
  }
};

var migrateCookieData = function(dataElements) {
  if (!reactorLocalStorage.getItem(MIGRATED_KEY)) {
    Object.keys(dataElements).forEach(function(dataElementName) {
      migrateDataElement(dataElementName, dataElements[dataElementName].storageDuration);
    });

    reactorLocalStorage.setItem(MIGRATED_KEY, true);
  }
};

var dataElementSafe = {
  setValue: setValue,
  getValue: getValue,
  migrateCookieData: migrateCookieData
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/





var getErrorMessage = function(dataDef, dataElementName, errorMessage, errorStack) {
  return 'Failed to execute data element module ' + dataDef.modulePath + ' for data element ' +
    dataElementName + '. ' + errorMessage + (errorStack ? '\n' + errorStack : '');
};

var isDataElementValuePresent = function(value) {
  return value !== undefined && value !== null;
};

var createGetDataElementValue = function(
  moduleProvider,
  getDataElementDefinition,
  replaceTokens,
  undefinedVarsReturnEmpty
) {
  return function(name) {
    var dataDef = getDataElementDefinition(name);

    if (!dataDef) {
      return undefinedVarsReturnEmpty ? '' : null;
    }

    var storageDuration = dataDef.storageDuration;
    var moduleExports;

    try {
      moduleExports = moduleProvider.getModuleExports(dataDef.modulePath);
    } catch (e) {
      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
      return;
    }

    if (typeof moduleExports !== 'function') {
      logger.error(getErrorMessage(dataDef, name, 'Module did not export a function.'));
      return;
    }

    var value;

    try {
      value = moduleExports(replaceTokens(dataDef.settings));
    } catch (e) {
      logger.error(getErrorMessage(dataDef, name, e.message, e.stack));
      return;
    }

    if (storageDuration) {
      if (isDataElementValuePresent(value)) {
        dataElementSafe.setValue(name, storageDuration, value);
      } else {
        value = dataElementSafe.getValue(name, storageDuration);
      }
    }

    if (!isDataElementValuePresent(value)) {
      value = dataDef.defaultValue || '';
    }

    if (typeof value === 'string') {
      if (dataDef.cleanText) {
        value = cleanText(value);
      }

      if (dataDef.forceLowerCase) {
        value = value.toLowerCase();
      }
    }

    return value;
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

var extractModuleExports = function(script, require, turbine) {
  var module = {
    exports: {}
  };

  script.call(module.exports, module, module.exports, require, turbine);

  return module.exports;
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/




var createModuleProvider = function() {
  var moduleByReferencePath = {};

  var getModule = function(referencePath) {
    var module = moduleByReferencePath[referencePath];

    if (!module) {
      throw new Error('Module ' + referencePath + ' not found.');
    }

    return module;
  };

  var registerModule = function(referencePath, moduleDefinition, extensionName, require, turbine) {
    var module = {
      definition: moduleDefinition,
      extensionName: extensionName,
      require: require,
      turbine: turbine
    };
    module.require = require;
    moduleByReferencePath[referencePath] = module;
  };

  var hydrateCache = function() {
    Object.keys(moduleByReferencePath).forEach(function(referencePath) {
      try {
        getModuleExports(referencePath);
      } catch (e) {
        var errorMessage = 'Error initializing module ' + referencePath + '. ' +
          e.message + (e.stack ? '\n' + e.stack : '');
        logger.error(errorMessage);
      }
    });
  };

  var getModuleExports = function(referencePath) {
    var module = getModule(referencePath);

    // Using hasOwnProperty instead of a falsey check because the module could export undefined
    // in which case we don't want to execute the module each time the exports is requested.
    if (!module.hasOwnProperty('exports')) {
      module.exports = extractModuleExports(module.definition.script, module.require,
        module.turbine);
    }

    return module.exports;
  };

  var getModuleDefinition = function(referencePath) {
    return getModule(referencePath).definition;
  };

  var getModuleExtensionName = function(referencePath) {
    return getModule(referencePath).extensionName;
  };

  return {
    registerModule: registerModule,
    hydrateCache: hydrateCache,
    getModuleExports: getModuleExports,
    getModuleDefinition: getModuleDefinition,
    getModuleExtensionName: getModuleExtensionName
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Determines if the provided name is a valid variable, where the variable
 * can be a data element, element, event, target, or custom var.
 * @param variableName
 * @returns {boolean}
 */
var createIsVar = function(customVars, getDataElementDefinition) {
  return function(variableName) {
    var nameBeforeDot = variableName.split('.')[0];

    return Boolean(
      getDataElementDefinition(variableName) ||
      nameBeforeDot === 'this' ||
      nameBeforeDot === 'event' ||
      nameBeforeDot === 'target' ||
      customVars.hasOwnProperty(nameBeforeDot)
    );
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/



var specialPropertyAccessors = {
  text: function(obj) {
    return obj.textContent;
  },
  cleanText: function(obj) {
    return cleanText(obj.textContent);
  }
};

/**
 * This returns the value of a property at a given path. For example, a <code>path<code> of
 * <code>foo.bar</code> will return the value of <code>obj.foo.bar</code>.
 *
 * In addition, if <code>path</code> is <code>foo.bar.getAttribute(unicorn)</code> and
 * <code>obj.foo.bar</code> has a method named <code>getAttribute</code>, the method will be
 * called with a value of <code>"unicorn"</code> and the value will be returned.
 *
 * Also, if <code>path</code> is <code>foo.bar.@text</code> or other supported properties
 * beginning with <code>@</code>, a special accessor will be used.
 *
 * @param host
 * @param path
 * @param supportSpecial
 * @returns {*}
 */
var getObjectProperty = function(host, propChain, supportSpecial) {
  var value = host;
  var attrMatch;
  for (var i = 0, len = propChain.length; i < len; i++) {
    if (value == null) {
      return undefined;
    }
    var prop = propChain[i];
    if (supportSpecial && prop.charAt(0) === '@') {
      var specialProp = prop.slice(1);
      value = specialPropertyAccessors[specialProp](value);
      continue;
    }
    if (value.getAttribute &&
      (attrMatch = prop.match(/^getAttribute\((.+)\)$/))) {
      var attr = attrMatch[1];
      value = value.getAttribute(attr);
      continue;
    }
    value = value[prop];
  }
  return value;
};

/**
 * Returns the value of a variable.
 * @param {string} variable
 * @param {Object} [syntheticEvent] A synthetic event. Only required when using %event... %this...
 * or %target...
 * @returns {*}
 */
var createGetVar = function(customVars, getDataElementDefinition, getDataElementValue) {
  return function(variable, syntheticEvent) {
    var value;

    if (getDataElementDefinition(variable)) {
      // Accessing nested properties of a data element using dot-notation is unsupported because
      // users can currently create data elements with periods in the name.
      value = getDataElementValue(variable);
    } else {
      var propChain = variable.split('.');
      var variableHostName = propChain.shift();

      if (variableHostName === 'this') {
        if (syntheticEvent) {
          // I don't know why this is the only one that supports special properties, but that's the
          // way it was in Satellite.
          value = getObjectProperty(syntheticEvent.element, propChain, true);
        }
      } else if (variableHostName === 'event') {
        if (syntheticEvent) {
          value = getObjectProperty(syntheticEvent, propChain);
        }
      } else if (variableHostName === 'target') {
        if (syntheticEvent) {
          value = getObjectProperty(syntheticEvent.target, propChain);
        }
      } else {
        value = getObjectProperty(customVars[variableHostName], propChain);
      }
    }

    return value;
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Creates a function that, when called with an extension name and module name, will return the
 * exports of the respective shared module.
 *
 * @param {Object} extensions
 * @param {Object} moduleProvider
 * @returns {Function}
 */
var createGetSharedModuleExports = function(extensions, moduleProvider) {
  return function(extensionName, moduleName) {
    var extension = extensions[extensionName];

    if (extension) {
      var modules = extension.modules;
      if (modules) {
        var referencePaths = Object.keys(modules);
        for (var i = 0; i < referencePaths.length; i++) {
          var referencePath = referencePaths[i];
          var module = modules[referencePath];
          if (module.shared && module.name === moduleName) {
            return moduleProvider.getModuleExports(referencePath);
          }
        }
      }
    }
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Creates a function that, when called, will return a configuration object with data element
 * tokens replaced.
 *
 * @param {Object} settings
 * @returns {Function}
 */
var createGetExtensionSettings = function(replaceTokens, settings) {
  return function() {
    return settings ? replaceTokens(settings) : {};
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Creates a function that, when called, will return the full hosted lib file URL.
 *
 * @param {string} hostedLibFilesBaseUrl
 * @returns {Function}
 */

var createGetHostedLibFileUrl = function(hostedLibFilesBaseUrl, minified) {
  return function(file) {
    if (minified) {
      var fileParts = file.split('.');
      fileParts.splice(fileParts.length - 1 || 1, 0, 'min');
      file = fileParts.join('.');
    }

    return hostedLibFilesBaseUrl + file;
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

var JS_EXTENSION = '.js';

/**
 * @private
 * Returns the directory of a path. A limited version of path.dirname in nodejs.
 *
 * To keep it simple, it makes the following assumptions:
 * path has a least one slash
 * path does not end with a slash
 * path does not have empty segments (e.g., /src/lib//foo.bar)
 *
 * @param {string} path
 * @returns {string}
 */
var dirname = function(path) {
  return path.substr(0, path.lastIndexOf('/'));
};

/**
 * Determines if a string ends with a certain string.
 * @param {string} str The string to test.
 * @param {string} suffix The suffix to look for at the end of str.
 * @returns {boolean} Whether str ends in suffix.
 */
var endsWith = function(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1;
};

/**
 * Given a starting path and a path relative to the starting path, returns the final path. A
 * limited version of path.resolve in nodejs.
 *
 * To keep it simple, it makes the following assumptions:
 * fromPath has at least one slash
 * fromPath does not end with a slash.
 * fromPath does not have empty segments (e.g., /src/lib//foo.bar)
 * relativePath starts with ./ or ../
 *
 * @param {string} fromPath
 * @param {string} relativePath
 * @returns {string}
 */
var resolveRelativePath = function(fromPath, relativePath) {
  // Handle the case where the relative path does not end in the .js extension. We auto-append it.
  if (!endsWith(relativePath, JS_EXTENSION)) {
    relativePath = relativePath + JS_EXTENSION;
  }

  var relativePathSegments = relativePath.split('/');
  var resolvedPathSegments = dirname(fromPath).split('/');

  relativePathSegments.forEach(function(relativePathSegment) {
    if (!relativePathSegment || relativePathSegment === '.') {
      return;
    } else if (relativePathSegment === '..') {
      if (resolvedPathSegments.length) {
        resolvedPathSegments.pop();
      }
    } else {
      resolvedPathSegments.push(relativePathSegment);
    }
  });

  return resolvedPathSegments.join('/');
};

'use strict';

var reactorDocument = document;

var promise = createCommonjsModule(function (module) {
(function (root) {

  // Store setTimeout reference so promise-polyfill will be unaffected by
  // other code modifying setTimeout (like sinon.useFakeTimers())
  var setTimeoutFunc = setTimeout;

  function noop() {}
  
  // Polyfill for Function.prototype.bind
  function bind(fn, thisArg) {
    return function () {
      fn.apply(thisArg, arguments);
    };
  }

  function Promise(fn) {
    if (typeof this !== 'object') throw new TypeError('Promises must be constructed via new');
    if (typeof fn !== 'function') throw new TypeError('not a function');
    this._state = 0;
    this._handled = false;
    this._value = undefined;
    this._deferreds = [];

    doResolve(fn, this);
  }

  function handle(self, deferred) {
    while (self._state === 3) {
      self = self._value;
    }
    if (self._state === 0) {
      self._deferreds.push(deferred);
      return;
    }
    self._handled = true;
    Promise._immediateFn(function () {
      var cb = self._state === 1 ? deferred.onFulfilled : deferred.onRejected;
      if (cb === null) {
        (self._state === 1 ? resolve : reject)(deferred.promise, self._value);
        return;
      }
      var ret;
      try {
        ret = cb(self._value);
      } catch (e) {
        reject(deferred.promise, e);
        return;
      }
      resolve(deferred.promise, ret);
    });
  }

  function resolve(self, newValue) {
    try {
      // Promise Resolution Procedure: https://github.com/promises-aplus/promises-spec#the-promise-resolution-procedure
      if (newValue === self) throw new TypeError('A promise cannot be resolved with itself.');
      if (newValue && (typeof newValue === 'object' || typeof newValue === 'function')) {
        var then = newValue.then;
        if (newValue instanceof Promise) {
          self._state = 3;
          self._value = newValue;
          finale(self);
          return;
        } else if (typeof then === 'function') {
          doResolve(bind(then, newValue), self);
          return;
        }
      }
      self._state = 1;
      self._value = newValue;
      finale(self);
    } catch (e) {
      reject(self, e);
    }
  }

  function reject(self, newValue) {
    self._state = 2;
    self._value = newValue;
    finale(self);
  }

  function finale(self) {
    if (self._state === 2 && self._deferreds.length === 0) {
      Promise._immediateFn(function() {
        if (!self._handled) {
          Promise._unhandledRejectionFn(self._value);
        }
      });
    }

    for (var i = 0, len = self._deferreds.length; i < len; i++) {
      handle(self, self._deferreds[i]);
    }
    self._deferreds = null;
  }

  function Handler(onFulfilled, onRejected, promise) {
    this.onFulfilled = typeof onFulfilled === 'function' ? onFulfilled : null;
    this.onRejected = typeof onRejected === 'function' ? onRejected : null;
    this.promise = promise;
  }

  /**
   * Take a potentially misbehaving resolver function and make sure
   * onFulfilled and onRejected are only called once.
   *
   * Makes no guarantees about asynchrony.
   */
  function doResolve(fn, self) {
    var done = false;
    try {
      fn(function (value) {
        if (done) return;
        done = true;
        resolve(self, value);
      }, function (reason) {
        if (done) return;
        done = true;
        reject(self, reason);
      });
    } catch (ex) {
      if (done) return;
      done = true;
      reject(self, ex);
    }
  }

  Promise.prototype['catch'] = function (onRejected) {
    return this.then(null, onRejected);
  };

  Promise.prototype.then = function (onFulfilled, onRejected) {
    var prom = new (this.constructor)(noop);

    handle(this, new Handler(onFulfilled, onRejected, prom));
    return prom;
  };

  Promise.all = function (arr) {
    var args = Array.prototype.slice.call(arr);

    return new Promise(function (resolve, reject) {
      if (args.length === 0) return resolve([]);
      var remaining = args.length;

      function res(i, val) {
        try {
          if (val && (typeof val === 'object' || typeof val === 'function')) {
            var then = val.then;
            if (typeof then === 'function') {
              then.call(val, function (val) {
                res(i, val);
              }, reject);
              return;
            }
          }
          args[i] = val;
          if (--remaining === 0) {
            resolve(args);
          }
        } catch (ex) {
          reject(ex);
        }
      }

      for (var i = 0; i < args.length; i++) {
        res(i, args[i]);
      }
    });
  };

  Promise.resolve = function (value) {
    if (value && typeof value === 'object' && value.constructor === Promise) {
      return value;
    }

    return new Promise(function (resolve) {
      resolve(value);
    });
  };

  Promise.reject = function (value) {
    return new Promise(function (resolve, reject) {
      reject(value);
    });
  };

  Promise.race = function (values) {
    return new Promise(function (resolve, reject) {
      for (var i = 0, len = values.length; i < len; i++) {
        values[i].then(resolve, reject);
      }
    });
  };

  // Use polyfill for setImmediate for performance gains
  Promise._immediateFn = (typeof setImmediate === 'function' && function (fn) { setImmediate(fn); }) ||
    function (fn) {
      setTimeoutFunc(fn, 0);
    };

  Promise._unhandledRejectionFn = function _unhandledRejectionFn(err) {
    if (typeof console !== 'undefined' && console) {
      console.warn('Possible Unhandled Promise Rejection:', err); // eslint-disable-line no-console
    }
  };

  /**
   * Set the immediate function to execute callbacks
   * @param fn {function} Function to execute
   * @deprecated
   */
  Promise._setImmediateFn = function _setImmediateFn(fn) {
    Promise._immediateFn = fn;
  };

  /**
   * Change the function to execute on unhandled rejection
   * @param {function} fn Function to execute on unhandled rejection
   * @deprecated
   */
  Promise._setUnhandledRejectionFn = function _setUnhandledRejectionFn(fn) {
    Promise._unhandledRejectionFn = fn;
  };
  
  if ('object' !== 'undefined' && module.exports) {
    module.exports = Promise;
  } else if (!root.Promise) {
    root.Promise = Promise;
  }

})(commonjsGlobal);
});

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/
'use strict';

var reactorPromise = window.Promise || promise;

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/
'use strict';



var getPromise = function(url, script) {
  return new reactorPromise(function(resolve, reject) {
    if ('onload' in script) {
      script.onload = function() {
        resolve(script);
      };

      script.onerror = function() {
        reject(new Error('Failed to load script ' + url));
      };
    } else if ('readyState' in script) {
      script.onreadystatechange = function() {
        var rs = script.readyState;
        if (rs === 'loaded' || rs === 'complete') {
          script.onreadystatechange = null;
          resolve(script);
        }
      };
    }
  });
};

var reactorLoadScript = function(url) {
  var script = document.createElement('script');
  script.src = url;
  script.async = true;

  var promise = getPromise(url, script);

  document.getElementsByTagName('head')[0].appendChild(script);
  return promise;
};

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

'use strict';

var reactorObjectAssign = objectAssign;

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

// If obj.hasOwnProperty has been overridden, then calling
// obj.hasOwnProperty(prop) will break.
// See: https://github.com/joyent/node/issues/1707
function hasOwnProperty$1(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

var decode = function(qs, sep, eq, options) {
  sep = sep || '&';
  eq = eq || '=';
  var obj = {};

  if (typeof qs !== 'string' || qs.length === 0) {
    return obj;
  }

  var regexp = /\+/g;
  qs = qs.split(sep);

  var maxKeys = 1000;
  if (options && typeof options.maxKeys === 'number') {
    maxKeys = options.maxKeys;
  }

  var len = qs.length;
  // maxKeys <= 0 means that we should not limit keys count
  if (maxKeys > 0 && len > maxKeys) {
    len = maxKeys;
  }

  for (var i = 0; i < len; ++i) {
    var x = qs[i].replace(regexp, '%20'),
        idx = x.indexOf(eq),
        kstr, vstr, k, v;

    if (idx >= 0) {
      kstr = x.substr(0, idx);
      vstr = x.substr(idx + 1);
    } else {
      kstr = x;
      vstr = '';
    }

    k = decodeURIComponent(kstr);
    v = decodeURIComponent(vstr);

    if (!hasOwnProperty$1(obj, k)) {
      obj[k] = v;
    } else if (Array.isArray(obj[k])) {
      obj[k].push(v);
    } else {
      obj[k] = [obj[k], v];
    }
  }

  return obj;
};

// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

'use strict';

var stringifyPrimitive = function(v) {
  switch (typeof v) {
    case 'string':
      return v;

    case 'boolean':
      return v ? 'true' : 'false';

    case 'number':
      return isFinite(v) ? v : '';

    default:
      return '';
  }
};

var encode = function(obj, sep, eq, name) {
  sep = sep || '&';
  eq = eq || '=';
  if (obj === null) {
    obj = undefined;
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).map(function(k) {
      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
      if (Array.isArray(obj[k])) {
        return obj[k].map(function(v) {
          return ks + encodeURIComponent(stringifyPrimitive(v));
        }).join(sep);
      } else {
        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
      }
    }).join(sep);

  }

  if (!name) return '';
  return encodeURIComponent(stringifyPrimitive(name)) + eq +
         encodeURIComponent(stringifyPrimitive(obj));
};

var querystring = createCommonjsModule(function (module, exports) {
'use strict';

exports.decode = exports.parse = decode;
exports.encode = exports.stringify = encode;
});

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/
'use strict';



// We proxy the underlying querystring module so we can limit the API we expose.
// This allows us to more easily make changes to the underlying implementation later without
// having to worry about breaking extensions. If extensions demand additional functionality, we
// can make adjustments as needed.
var reactorQueryString = {
  parse: function(string) {
    //
    if (typeof string === 'string') {
      // Remove leading ?, #, & for some leniency so you can pass in location.search or
      // location.hash directly.
      string = string.trim().replace(/^[?#&]/, '');
    }
    return querystring.parse(string);
  },
  stringify: function(object) {
    return querystring.stringify(object);
  }
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

var CORE_MODULE_PREFIX = '@adobe/reactor-';

var modules = {
  'cookie': reactorCookie,
  'document': reactorDocument,
  'load-script': reactorLoadScript,
  'object-assign': reactorObjectAssign,
  'promise': reactorPromise,
  'query-string': reactorQueryString,
  'window': reactorWindow
};

/**
 * Creates a function which can be passed as a "require" function to extension modules.
 *
 * @param {Function} getModuleExportsByRelativePath
 * @returns {Function}
 */
var createPublicRequire = function(getModuleExportsByRelativePath) {
  return function(key) {
    if (key.indexOf(CORE_MODULE_PREFIX) === 0) {
      var keyWithoutScope = key.substr(CORE_MODULE_PREFIX.length);
      var module = modules[keyWithoutScope];

      if (module) {
        return module;
      }
    }

    if (key.indexOf('./') === 0 || key.indexOf('../') === 0) {
      return getModuleExportsByRelativePath(key);
    }

    throw new Error('Cannot resolve module "' + key + '".');
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/








var hydrateModuleProvider = function(container, moduleProvider, replaceTokens, getDataElementValue) {
  var extensions = container.extensions;
  var buildInfo = container.buildInfo;
  var propertySettings = container.property.settings;

  if (extensions) {
    var getSharedModuleExports = createGetSharedModuleExports(extensions, moduleProvider);

    Object.keys(extensions).forEach(function(extensionName) {
      var extension = extensions[extensionName];
      var getExtensionSettings = createGetExtensionSettings(replaceTokens, extension.settings);

      if (extension.modules) {
        var prefixedLogger = logger.createPrefixedLogger(extension.displayName);
        var getHostedLibFileUrl = createGetHostedLibFileUrl(
          extension.hostedLibFilesBaseUrl,
          buildInfo.minified
        );
        var turbine = {
          buildInfo: buildInfo,
          getDataElementValue: getDataElementValue,
          getExtensionSettings: getExtensionSettings,
          getHostedLibFileUrl: getHostedLibFileUrl,
          getSharedModule: getSharedModuleExports,
          logger: prefixedLogger,
          propertySettings: propertySettings,
          replaceTokens: replaceTokens
        };

        Object.keys(extension.modules).forEach(function(referencePath) {
          var module = extension.modules[referencePath];
          var getModuleExportsByRelativePath = function(relativePath) {
            var resolvedReferencePath = resolveRelativePath(referencePath, relativePath);
            return moduleProvider.getModuleExports(resolvedReferencePath);
          };
          var publicRequire = createPublicRequire(getModuleExportsByRelativePath);

          moduleProvider.registerModule(
            referencePath,
            module,
            extensionName,
            publicRequire,
            turbine
          );
        });
      }
    });

    // We want to extract the module exports immediately to allow the modules
    // to run some logic immediately.
    // We need to do the extraction here in order for the moduleProvider to
    // have all the modules previously registered. (eg. when moduleA needs moduleB, both modules
    // must exist inside moduleProvider).
    moduleProvider.hydrateCache();
  }
  return moduleProvider;
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/




var hydrateSatelliteObject = function(_satellite, container, setDebugOutputEnabled, getVar, setCustomVar) {
  var prefixedLogger = logger.createPrefixedLogger('Custom Script');

  // Will get replaced by the directCall event delegate from the Core extension. Exists here in
  // case there are no direct call rules (and therefore the directCall event delegate won't get
  // included) and our customers are still calling the method. In this case, we don't want an error
  // to be thrown. This method existed before Reactor.
  _satellite.track = function() {};

  // Will get replaced by the Marketing Cloud ID extension if installed. Exists here in case
  // the extension is not installed and our customers are still calling the method. In this case,
  // we don't want an error to be thrown. This method existed before Reactor.
  _satellite.getVisitorId = function() { return null; };

  // container.property also has property settings, but it shouldn't concern the user.
  // By limiting our API exposure to necessities, we provide more flexibility in the future.
  _satellite.property = {
    name: container.property.name
  };

  _satellite.buildInfo = container.buildInfo;

  _satellite.logger = prefixedLogger;

  /**
   * Log a message. We keep this due to legacy baggage.
   * @param {string} message The message to log.
   * @param {number} [level] A number that represents the level of logging.
   * 3=info, 4=warn, 5=error, anything else=log
   */
  _satellite.notify = function(message, level) {
    logger.warn('_satellite.notify is deprecated. Please use the `_satellite.logger` API.');

    switch (level) {
      case 3:
        prefixedLogger.info(message);
        break;
      case 4:
        prefixedLogger.warn(message);
        break;
      case 5:
        prefixedLogger.error(message);
        break;
      default:
        prefixedLogger.log(message);
    }
  };

  _satellite.getVar = getVar;
  _satellite.setVar = setCustomVar;

  /**
   * Writes a cookie.
   * @param {string} name The name of the cookie to save.
   * @param {string} value The value of the cookie to save.
   * @param {number} [days] The number of days to store the cookie. If not specified, the cookie
   * will be stored for the session only.
   */
  _satellite.setCookie = function(name, value, days) {
    var optionsStr = '';
    var options = {};

    if (days) {
      optionsStr = ', { expires: ' + days + ' }';
      options.expires = days;
    }

    var msg = '_satellite.setCookie is deprecated. Please use ' +
      '_satellite.cookie.set("' + name + '", "' + value + '"' + optionsStr + ').';

    logger.warn(msg);
    reactorCookie.set(name, value, options);
  };

  /**
   * Reads a cookie value.
   * @param {string} name The name of the cookie to read.
   * @returns {string}
   */
  _satellite.readCookie = function(name) {
    logger.warn('_satellite.readCookie is deprecated. ' +
      'Please use _satellite.cookie.get("' + name + '").');
    return reactorCookie.get(name);
  };

  /**
   * Removes a cookie value.
   * @param name
   */
  _satellite.removeCookie = function(name) {
    logger.warn('_satellite.removeCookie is deprecated. ' +
      'Please use _satellite.cookie.remove("' + name + '").');
    reactorCookie.remove(name);
  };

  _satellite.cookie = reactorCookie;

  // Will get replaced by the pageBottom event delegate from the Core extension. Exists here in
  // case the customers are not using core (and therefore the pageBottom event delegate won't get
  // included) and they are still calling the method. In this case, we don't want an error
  // to be thrown. This method existed before Reactor.
  _satellite.pageBottom = function() {};

  _satellite.setDebug = setDebugOutputEnabled;

  var warningLogged = false;

  Object.defineProperty(_satellite, '_container', {
    get: function() {
      if (!warningLogged) {
        logger.warn('_satellite._container may change at any time and should only ' +
          'be used for debugging.');
        warningLogged = true;
      }

      return container;
    }
  });
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/




/**
 * Normalizes a synthetic event so that it exists and has at least meta.
 * @param {Object} syntheticEventMeta
 * @param {Object} [syntheticEvent]
 * @returns {Object}
 */
var normalizeSyntheticEvent = function(syntheticEventMeta, syntheticEvent) {
  syntheticEvent = syntheticEvent || {};
  reactorObjectAssign(syntheticEvent, syntheticEventMeta);

  // Remove after some arbitrary time period when we think users have had sufficient chance
  // to move away from event.type
  if (!syntheticEvent.hasOwnProperty('type')) {
    Object.defineProperty(syntheticEvent, 'type', {
      get: function() {
        logger.warn('Accessing event.type in Adobe Launch has been deprecated and will be ' +
          'removed soon. Please use event.$type instead.');
        return syntheticEvent.$type;
      }
    });
  }

  return syntheticEvent;
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/

/**
 * Rules can be ordered by users at the event type level. For example, assume both Rule A and Rule B
 * use the Library Loaded and Window Loaded event types. Rule A can be ordered to come before Rule B
 * on Library Loaded but after Rule B on Window Loaded.
 *
 * Order values are integers and act more as a priority. In other words, multiple rules can have the
 * same order value. If they have the same order value, their order of execution should be
 * considered nondetermistic.
 *
 * @param {Array} rules
 * @returns {Array} An ordered array of rule-event pair objects.
 */
var buildRuleExecutionOrder = function(rules) {
  var ruleEventPairs = [];

  rules.forEach(function(rule) {
    if (rule.events) {
      rule.events.forEach(function(event) {
        ruleEventPairs.push({
          rule: rule,
          event: event
        });
      });
    }
  });

  return ruleEventPairs.sort(function(ruleEventPairA, ruleEventPairB) {
    return ruleEventPairA.event.ruleOrder - ruleEventPairB.event.ruleOrder;
  });
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/


var warningLogged = false;

var createNotifyMonitors = function(_satellite) {
  return function(type, event) {
    var monitors = _satellite._monitors;

    if (monitors) {
      if (!warningLogged) {
        logger.warn('The _satellite._monitors API may change at any time and should only ' +
          'be used for debugging.');
        warningLogged = true;
      }

      monitors.forEach(function(monitor) {
        if (monitor[type]) {
          monitor[type](event);
        }
      });
    }
  };
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/






var MODULE_NOT_FUNCTION_ERROR = 'Module did not export a function.';

var initRules = function(
  _satellite,
  rules,
  moduleProvider,
  replaceTokens,
  getShouldExecuteActions
) {
  var notifyMonitors = createNotifyMonitors(_satellite);

  var getModuleDisplayNameByRuleComponent = function(ruleComponent) {
    var moduleDefinition = moduleProvider.getModuleDefinition(ruleComponent.modulePath);
    return (moduleDefinition && moduleDefinition.displayName) || ruleComponent.modulePath;
  };

  var getErrorMessage = function(ruleComponent, rule, errorMessage, errorStack) {
    var moduleDisplayName = getModuleDisplayNameByRuleComponent(ruleComponent);
    return 'Failed to execute ' + moduleDisplayName + ' for ' + rule.name + ' rule. ' +
      errorMessage + (errorStack ? '\n' + errorStack : '');
  };

  var runActions = function(rule, syntheticEvent) {
    if (getShouldExecuteActions() && rule.actions) {
      rule.actions.forEach(function(action) {
        action.settings = action.settings || {};

        var moduleExports;

        try {
          moduleExports = moduleProvider.getModuleExports(action.modulePath);
        } catch (e) {
          logger.error(getErrorMessage(action, rule, e.message, e.stack));
          return;
        }

        if (typeof moduleExports !== 'function') {
          logger.error(getErrorMessage(action, rule, MODULE_NOT_FUNCTION_ERROR));
          return;
        }

        var settings = replaceTokens(action.settings, syntheticEvent);

        try {
          moduleExports(settings, syntheticEvent);
        } catch (e) {
          logger.error(getErrorMessage(action, rule, e.message, e.stack));
          return;
        }
      });
    }

    logger.log('Rule "' + rule.name + '" fired.');
    notifyMonitors('ruleCompleted', {
      rule: rule
    });
  };

  var checkConditions = function(rule, syntheticEvent) {
    if (rule.conditions) {
      for (var i = 0; i < rule.conditions.length; i++) {
        var condition = rule.conditions[i];
        condition.settings = condition.settings || {};

        var moduleExports;

        try {
          moduleExports = moduleProvider.getModuleExports(condition.modulePath);
        } catch (e) {
          logger.error(getErrorMessage(condition, rule, e.message, e.stack));
          return;
        }

        if (typeof moduleExports !== 'function') {
          logger.error(getErrorMessage(condition, rule, MODULE_NOT_FUNCTION_ERROR));
          return;
        }

        var settings = replaceTokens(condition.settings, syntheticEvent);

        var result;

        try {
          result = moduleExports(settings, syntheticEvent);
        } catch (e) {
          logger.error(getErrorMessage(condition, rule, e.message, e.stack));
          notifyMonitors('ruleConditionFailed', {
            rule: rule,
            condition: condition
          });
          // We return because we want to assume the condition would have failed and therefore
          // we don't want to run the following conditions or the rule's actions.
          return;
        }

        if ((!result && !condition.negate) || (result && condition.negate)) {
          var conditionDisplayName = getModuleDisplayNameByRuleComponent(condition);
          logger.log('Condition ' + conditionDisplayName + ' for rule ' + rule.name + ' not met.');
          notifyMonitors('ruleConditionFailed', {
            rule: rule,
            condition: condition
          });
          return;
        }
      }
    }

    runActions(rule, syntheticEvent);
  };

  var initEventModule = function(ruleEventPair) {
    var rule = ruleEventPair.rule;
    var event = ruleEventPair.event;
    event.settings = event.settings || {};

    var moduleExports;
    var moduleName;
    var extensionName;

    try {
      moduleExports = moduleProvider.getModuleExports(event.modulePath);
      moduleName = moduleProvider.getModuleDefinition(event.modulePath).name;
      extensionName = moduleProvider.getModuleExtensionName(event.modulePath);
    } catch (e) {
      logger.error(getErrorMessage(event, rule, e.message, e.stack));
      return;
    }

    if (typeof moduleExports !== 'function') {
      logger.error(getErrorMessage(event, rule, MODULE_NOT_FUNCTION_ERROR));
      return;
    }

    var settings = replaceTokens(event.settings);

    var syntheticEventMeta = {
      $type: extensionName + '.' + moduleName,
      $rule: {
        id: rule.id,
        name: rule.name
      }
    };

    /**
     * This is the callback that executes a particular rule when an event has occurred.
     * @callback ruleTrigger
     * @param {Object} [syntheticEvent] An object that contains detail regarding the event
     * that occurred.
     */
    var trigger = function(syntheticEvent) {
      notifyMonitors('ruleTriggered', {
        rule: rule
      });
      checkConditions(rule, normalizeSyntheticEvent(syntheticEventMeta, syntheticEvent));
    };

    try {
      moduleExports(settings, trigger);
    } catch (e) {
      logger.error(getErrorMessage(event, rule, e.message, e.stack));
      return;
    }
  };

  buildRuleExecutionOrder(rules).forEach(initEventModule);
};

/***************************************************************************************
 * (c) 2017 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 ****************************************************************************************/













var HIDE_ACTIVITY_LOCAL_STORAGE_NAME = 'hideActivity';
var DEBUG_LOCAL_STORAGE_NAME = 'debug';


var _satellite = window._satellite;

if (_satellite && !window.__satelliteLoaded) {
  // If a consumer loads the library multiple times, make sure only the first time is effective.
  window.__satelliteLoaded = true;

  var container = _satellite.container;

  // Remove container in public scope ASAP so it can't be manipulated by extension or user code.
  delete _satellite.container;

  var undefinedVarsReturnEmpty = container.property.settings.undefinedVarsReturnEmpty;

  var dataElements = container.dataElements || {};

  // Remove when migration period has ended.
  dataElementSafe.migrateCookieData(dataElements);

  var getDataElementDefinition = function(name) {
    return dataElements[name];
  };

  var moduleProvider = createModuleProvider();

  var replaceTokens;

  // We support data elements referencing other data elements. In order to be able to retrieve a
  // data element value, we need to be able to replace data element tokens inside its settings
  // object (which is what replaceTokens is for). In order to be able to replace data element
  // tokens inside a settings object, we need to be able to retrieve data element
  // values (which is what getDataElementValue is for). This proxy replaceTokens function solves the
  // chicken-or-the-egg problem by allowing us to provide a replaceTokens function to
  // getDataElementValue that will stand in place of the real replaceTokens function until it
  // can be created. This also means that createDataElementValue should not call the proxy
  // replaceTokens function until after the real replaceTokens has been created.
  var proxyReplaceTokens = function() {
    return replaceTokens.apply(null, arguments);
  };

  var getDataElementValue = createGetDataElementValue(
    moduleProvider,
    getDataElementDefinition,
    proxyReplaceTokens,
    undefinedVarsReturnEmpty
  );

  var customVars = {};
  var setCustomVar = createSetCustomVar(
    customVars
  );

  var isVar = createIsVar(
    customVars,
    getDataElementDefinition
  );

  var getVar = createGetVar(
    customVars,
    getDataElementDefinition,
    getDataElementValue
  );

  replaceTokens = createReplaceTokens(
    isVar,
    getVar,
    undefinedVarsReturnEmpty
  );

  var localStorage = getNamespacedStorage('localStorage');

  var getDebugOutputEnabled = function() {
    return localStorage.getItem(DEBUG_LOCAL_STORAGE_NAME) === 'true';
  };

  var setDebugOutputEnabled = function(value) {
    localStorage.setItem(DEBUG_LOCAL_STORAGE_NAME, value);
    logger.outputEnabled = value;
  };

  var getShouldExecuteActions = function() {
    return localStorage.getItem(HIDE_ACTIVITY_LOCAL_STORAGE_NAME) !== 'true';
  };

  logger.outputEnabled = getDebugOutputEnabled();

  // Important to hydrate satellite object before we hydrate the module provider or init rules.
  // When we hydrate module provider, we also execute extension code which may be
  // accessing _satellite.
  hydrateSatelliteObject(
    _satellite,
    container,
    setDebugOutputEnabled,
    getVar,
    setCustomVar
  );

  hydrateModuleProvider(
    container,
    moduleProvider,
    replaceTokens,
    getDataElementValue
  );

  initRules(
    _satellite,
    container.rules || [],
    moduleProvider,
    replaceTokens,
    getShouldExecuteActions
  );
}

// Rollup's iife option always sets a global with whatever is exported, so we'll set the
// _satellite global with the same object it already is (we've only modified it).
var src = _satellite;

return src;

}());
