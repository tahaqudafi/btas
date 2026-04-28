
        (function () {
            try {
                (function scriptlets_preventWindowOpen(source, args) {
  var flag = "done";
  var uniqueIdentifier = source.uniqueId + source.name + "_" + (Array.isArray(args) ? args.join("_") : "");
  if (source.uniqueId) {
    if (Window.prototype.toString[uniqueIdentifier] === flag) {
      return;
    }
  }
  function preventWindowOpen(source) {
    var match = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : "*";
    var delay = arguments.length > 2 ? arguments[2] : undefined;
    var replacement = arguments.length > 3 ? arguments[3] : undefined;
    var nativeOpen = window.open;
    var isNewSyntax = match !== "0" && match !== "1";
    var oldOpenWrapper = function oldOpenWrapper(str) {
      match = Number(match) > 0;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (!isValidStrPattern(delay)) {
        logMessage(source, `Invalid parameter: ${delay}`);
        return nativeOpen.apply(window, [ str, ...args ]);
      }
      var searchRegexp = toRegExp(delay);
      if (match !== searchRegexp.test(str)) {
        return nativeOpen.apply(window, [ str, ...args ]);
      }
      hit(source);
      return handleOldReplacement(replacement);
    };
    var newOpenWrapper = function newOpenWrapper(url) {
      var shouldLog = replacement && replacement.includes("log");
      for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
        args[_key2 - 1] = arguments[_key2];
      }
      if (shouldLog) {
        var argsStr = args && args.length > 0 ? `, ${args.join(", ")}` : "";
        var message = `${url}${argsStr}`;
        logMessage(source, message, true);
        hit(source);
      }
      var shouldPrevent = false;
      if (match === "*") {
        shouldPrevent = true;
      } else if (isValidMatchStr(match)) {
        var {isInvertedMatch: isInvertedMatch, matchRegexp: matchRegexp} = parseMatchArg(match);
        shouldPrevent = matchRegexp.test(url) !== isInvertedMatch;
      } else {
        logMessage(source, `Invalid parameter: ${match}`);
        shouldPrevent = false;
      }
      if (shouldPrevent) {
        var parsedDelay = parseInt(delay, 10);
        var result;
        if (nativeIsNaN(parsedDelay)) {
          result = noopNull();
        } else {
          var decoyArgs = {
            replacement: replacement,
            url: url,
            delay: parsedDelay
          };
          var decoy = createDecoy(decoyArgs);
          var popup = decoy.contentWindow;
          if (typeof popup === "object" && popup !== null) {
            Object.defineProperty(popup, "closed", {
              value: false
            });
            Object.defineProperty(popup, "opener", {
              value: window
            });
            Object.defineProperty(popup, "frameElement", {
              value: null
            });
          } else {
            var nativeGetter = decoy.contentWindow && decoy.contentWindow.get;
            Object.defineProperty(decoy, "contentWindow", {
              get: getPreventGetter(nativeGetter)
            });
            popup = decoy.contentWindow;
          }
          result = popup;
        }
        hit(source);
        return result;
      }
      return nativeOpen.apply(window, [ url, ...args ]);
    };
    window.open = isNewSyntax ? newOpenWrapper : oldOpenWrapper;
    window.open.toString = nativeOpen.toString.bind(nativeOpen);
  }
  function hit(e) {
    if (e.verbose) {
      try {
        var n = console.trace.bind(console), i = "[AdGuard] ";
        "corelibs" === e.engine ? i += e.ruleText : (e.domainName && (i += `${e.domainName}`), 
        e.args ? i += `#%#//scriptlet('${e.name}', '${e.args.join("', '")}')` : i += `#%#//scriptlet('${e.name}')`), 
        n && n(i);
      } catch (e) {}
      "function" == typeof window.__debug && window.__debug(e);
    }
  }
  function isValidStrPattern(e) {
    var t, n = escapeRegExp(e);
    "/" === e[0] && "/" === e[e.length - 1] && (n = e.slice(1, -1));
    try {
      t = new RegExp(n), t = !0;
    } catch (e) {
      t = false;
    }
    return t;
  }
  function escapeRegExp(e) {
    return e.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }
  function isValidMatchStr(t) {
    var i = t;
    return null != t && t.startsWith("!") && (i = t.slice(1)), isValidStrPattern(i);
  }
  function toRegExp(e) {
    var r = e || "", t = "/";
    if ("" === r) return new RegExp(".?");
    var n, i, s = r.lastIndexOf(t), a = r.substring(s + 1), g = r.substring(0, s + 1), u = (i = a, 
    (n = g).startsWith(t) && n.endsWith(t) && !n.endsWith("\\/") && function(e) {
      if (!e) return false;
      try {
        return new RegExp("", e), !0;
      } catch (e) {
        return false;
      }
    }(i) ? i : "");
    if (r.startsWith(t) && r.endsWith(t) || u) return new RegExp((u ? g : r).slice(1, -1), u);
    var c = r.replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(c);
  }
  function nativeIsNaN(N) {
    return (Number.isNaN || window.isNaN)(N);
  }
  function parseMatchArg(t) {
    var e = !!t && (null == t ? void 0 : t.startsWith("!")), a = e ? t.slice(1) : t;
    return {
      isInvertedMatch: e,
      matchRegexp: toRegExp(a),
      matchValue: a
    };
  }
  function handleOldReplacement(e) {
    var n;
    if (e) {
      if ("trueFunc" === e) n = trueFunc; else if (e.includes("=")) {
        if (e.startsWith("{") && e.endsWith("}")) {
          var t = e.slice(1, -1), u = substringBefore(t, "=");
          "noopFunc" === substringAfter(t, "=") && ((n = {})[u] = noopFunc);
        }
      }
    } else n = noopFunc;
    return n;
  }
  function createDecoy(e) {
    var t, r = function(e) {
      return e.Object = "data", e.Iframe = "src", e;
    }({}), {replacement: n, url: o, delay: a} = e;
    t = "obj" === n ? "object" : "iframe";
    var i = document.createElement(t);
    return i instanceof HTMLObjectElement ? i[r.Object] = o : i instanceof HTMLIFrameElement && (i[r.Iframe] = o), 
    i.style.setProperty("height", "1px", "important"), i.style.setProperty("position", "fixed", "important"), 
    i.style.setProperty("top", "-1px", "important"), i.style.setProperty("width", "1px", "important"), 
    document.body.appendChild(i), setTimeout((function() {
      return i.remove();
    }), 1e3 * a), i;
  }
  function getPreventGetter(n) {
    return function(t, e) {
      return (!e || "closed" !== e) && ("function" == typeof n ? noopFunc : e && t[e]);
    };
  }
  function noopNull() {
    return null;
  }
  function logMessage(e, o) {
    var n = arguments.length > 2 && void 0 !== arguments[2] && arguments[2], g = !(arguments.length > 3 && void 0 !== arguments[3]) || arguments[3], {name: l, verbose: v} = e;
    if (n || v) {
      var a = console.log;
      g ? a(`${l}: ${o}`) : a(`${l}:`, o);
    }
  }
  function noopFunc() {}
  function trueFunc() {
    return true;
  }
  function substringBefore(r, n) {
    if (!r || false) return r;
    var e = r.indexOf(n);
    return e < 0 ? r : r.substring(0, e);
  }
  function substringAfter(n, r) {
    if (!n) return n;
    var t = n.indexOf(r);
    return t < 0 ? "" : n.substring(t + r.length);
  }
  var updatedArgs = args ? [].concat(source).concat(args) : [ source ];
  try {
    preventWindowOpen.apply(this, updatedArgs);
    if (source.uniqueId) {
      Object.defineProperty(Window.prototype.toString, uniqueIdentifier, {
        value: flag,
        enumerable: false,
        writable: false,
        configurable: false
      });
    }
  } catch (e) {
    console.log(e);
  }
})({"args":[],"engine":"extension","name":"prevent-window-open","verbose":false,"domainName":"https://happybirthdaydeargift.vercel.app/","version":"5.3.1.7"}, []);

            } catch (ex) {
                console.error('Error executing AG js: ' + ex);
            }
        })();
        //# sourceURL=ag-scripts.js
        