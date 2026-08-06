/*! @version 1.0.10 */
var t = function () {
    if (((this._listeners = {}), parent === window)) return !1;
    (this.url = document.referrer),
        (this.version = '1.0.10-20190104'),
        function t() {
            var e = this;
            window.addEventListener
                ? window.addEventListener(
                      'message',
                      function (t) {
                          try {
                              n.call(e, t);
                          } catch (t) {
                              h('550202', t.message);
                          }
                      },
                      !1,
                  )
                : window.attachEvent('onmessage', function (t) {
                      try {
                          n.call(e, t);
                      } catch (t) {
                          h('550202', t.message);
                      }
                  });
        }.call(this);
};
function n(t) {
    var e = JSON.parse(t.data);
    'event' == e.type
        ? (o.call(this, e.name, e.param),
          1 == this.transMsg &&
              (function a(t, e) {
                  if (window.parent == t.source)
                      for (var n = window.frames, i = JSON.stringify(e), s = 0, o = n.length; s < o; s++) n[0].postMessage(i, '*');
              })(t, e))
        : 'setData' == e.type
        ? o.call(this, 'getData_' + e.name, e.param)
        : e.type;
}
function l(t) {
    (t.name = encodeURI(t.name)),
        1 == this.transMsg
            ? window.parent.postMessage(JSON.stringify(t), this.url)
            : setTimeout(function () {
                  top.postMessage(JSON.stringify(t), '*');
              }, 0);
}
function i(t, e) {
    try {
        l.call(this, {
            type: 'function',
            name: t,
            msgId: f(),
            param: (function o(t, e, n) {
                for (var i = [], s = 0; s < t.length; s++) (e || 0) <= s && s <= (n || t.length) && i.push(t[s]);
                return i;
            })(e),
        });
    } catch (n) {
        h('550201', n.message);
    }
}
function s(t, e, n) {
    var i = this,
        s = 'getData_' + encodeURI(t),
        o = f(),
        a = setTimeout(function () {
            h('550203', o, t, JSON.stringify(n));
        }, 3e3),
        r = function (t) {
            clearTimeout(a), i.removeListener(s, r), e && e(t);
        };
    i.on(s, r);
    try {
        l.call(this, {
            type: 'getData',
            name: t,
            param: n,
            __cross__: 'true',
            origin: window.location.href,
        });
    } catch (c) {
        h('550201', c.message);
    }
}
function o(t, e, n) {
    if (
        ('string' == typeof t &&
            (t = {
                type: t,
            }),
        t.target || (t.target = this),
        !t.type)
    )
        throw new Error("Event object missing 'type' property.");
    if (this._listeners[t.type] instanceof Array)
        for (var i = this._listeners[t.type], s = i.length; 0 < s; s--) i[s - 1].apply(this, [].slice.call(arguments, 1));
}
var e = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
function f() {
    var t = 'xxxxxx'.replace(/x/g, function () {
        var t = (62 * Math.random()) | 0;
        return e[t];
    });
    return new Date().valueOf() + t;
}
function a(t) {
    if (/^http/.test(t)) return t;
    var e = document.createElement('div');
    return (e.innerHTML = '<a href="' + t.replace(/"/g, '%22') + '"/>'), e.firstChild.href;
}
function h() {
    if ((window.logger && logger.log.apply(logger, arguments), window.console && console.error)) {
        var t = [].slice.call(arguments, 0);
        console.error(t);
    }
}
t.prototype = {
    callOutByCenter: function () {
        i.call(this, 'callOutInterface', arguments);
    },
    createTab: function () {
        (arguments[1] = a(arguments[1])), i.call(this, 'createTab', arguments);
    },
    setTabCloseable: function (t, e) {
        i.call(this, 'setTabCloseable', arguments);
    },
    refreshTab: function () {
        i.call(this, 'refresh', arguments);
    },
    isExistTab: function (t, e) {
        s.call(this, 'getIframe', e, t);
    },
    isExistDialog: function (t, e) {
        s.call(this, 'getDialog', e, t);
    },
    destroyTab: function () {
        i.call(this, 'destroyTab', arguments);
    },
    showDialog: function () {
        var t = arguments[0].url;
        (arguments[0].url = a(t)), i.call(this, 'iframeDialog', arguments);
    },
    destroyDialog: function () {
        i.call(this, 'closeDialog', arguments);
    },
    destroyParentDialog: function () {
        i.call(this, 'destroyDialog', arguments);
    },
    tips: function () {
        i.call(this, 'tips', arguments);
    },
    showLoading: function () {
        i.call(this, 'screenLoading.show', arguments);
    },
    destroyLoading: function () {
        i.call(this, 'screenLoading.hide', arguments);
    },
    getContact: function (t, e, n) {
        '[object Function]' == Object.prototype.toString.call(e) ? s.call(this, t, e) : s.call(this, t, n, e);
    },
    getIndexInfo: function (t) {
        s.call(this, 'cross_data', t);
    },
    set: function (t, e) {
        (function i(t, e) {
            try {
                l.call(this, {
                    type: 'setData',
                    name: t,
                    msgId: f(),
                    param: e,
                });
            } catch (n) {
                h('550201', n.message);
            }
        }).call(this, t, e);
    },
    get: function (t, e) {
        s.call(this, t, e);
    },
    popAlert: function () {
        i.call(this, 'popAlert', arguments);
    },
    backToLogin: function () {
        i.call(this, 'backToLogin', arguments);
    },
    on: function (t, e) {
        'undefined' == typeof this._listeners[t] && (this._listeners[t] = []), this._listeners[t].push(e);
    },
    removeListener: function (t, e) {
        if (this._listeners[t] instanceof Array)
            for (var n = this._listeners[t], i = 0, s = n.length; i < s; i++)
                if (n[i] === e) {
                    n.splice(i, 1);
                    break;
                }
    },
    switchTab: function () {
        i.call(this, 'switchTab', arguments);
    },
    trigger: function (t, e, n) {
        (function s(t, e, n) {
            try {
                l.call(this, {
                    type: 'event',
                    name: t,
                    param: n,
                    msgId: f(),
                    origin: e,
                });
            } catch (i) {
                h('550201', i.message);
            }
        }).call(this, e, t, n);
    },
    transMsg: function (t) {
        this.transMsg = t;
    },
};
window.crossAPI = new t();
export default crossAPI;
