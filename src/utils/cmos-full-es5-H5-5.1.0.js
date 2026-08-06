!(function (e, t) {
    'object' == typeof exports && 'undefined' != typeof module
        ? (module.exports = t())
        : 'function' == typeof define && define.amd
        ? define(t)
        : ((e = 'undefined' != typeof globalThis ? globalThis : e || self).cmos = t());
})(this, function () {
    'use strict';
    var e = function (t, n) {
        return (
            (e =
                Object.setPrototypeOf ||
                ({ __proto__: [] } instanceof Array &&
                    function (e, t) {
                        e.__proto__ = t;
                    }) ||
                function (e, t) {
                    for (var n in t) ({}).hasOwnProperty.call(t, n) && (e[n] = t[n]);
                }),
            e(t, n)
        );
    };
    function t(t, n) {
        if ('function' != typeof n && null !== n) throw new TypeError('Class extends value ' + n + ' is not a constructor or null');
        function i() {
            this.constructor = t;
        }
        e(t, n), (t.prototype = null === n ? Object.create(n) : ((i.prototype = n.prototype), new i()));
    }
    var n = function () {
        return (
            (n =
                Object.assign ||
                function (e) {
                    for (var t, n = 1, i = arguments.length; i > n; n++)
                        for (var r in (t = arguments[n])) ({}).hasOwnProperty.call(t, r) && (e[r] = t[r]);
                    return e;
                }),
            n.apply(this, arguments)
        );
    };
    function i(e, t, n) {
        if (n || 2 === arguments.length)
            for (var i, r = 0, o = t.length; o > r; r++) (!i && r in t) || (i || (i = [].slice.call(t, 0, r)), (i[r] = t[r]));
        return e.concat(i || [].slice.call(t));
    }
    'function' == typeof SuppressedError && SuppressedError;
    var r = ['web', 'wxwv', 'minp', 'alip', 'baidup', 'qq', 'bytedance'],
        o = {
            autotrack: { type: 'boolean', default: !0 },
            compress: { type: 'boolean', default: !0 },
            dataCollect: { type: 'boolean', default: !0 },
            debug: { type: 'boolean', default: !1 },
            hashtag: { type: 'boolean', default: !1 },
            touch: { type: 'boolean', default: !1 },
            version: { type: 'string', default: '1.0.0' },
            platform: { type: 'string', default: 'web' },
            cookieDomain: { type: 'string', default: '' },
            sendType: { type: 'string', default: 'beacon' },
        },
        a = {
            enableIdMapping: { type: 'boolean', default: !1 },
            gtouchHost: { type: 'string', default: '' },
            host: { type: 'string', default: 'napi.growingio.com' },
            ignoreFields: { type: 'array', default: [] },
            penetrateHybrid: { type: 'boolean', default: !0 },
            scheme: { type: 'string', default: location.protocol.indexOf('http') > -1 ? location.protocol.replace(':', '') : 'https' },
            sessionExpires: { type: 'number', default: 30 },
            performance: { type: 'object', default: { monitor: !0, exception: !1 } },
            embeddedIgnore: { type: 'array', default: [] },
            storageType: { type: 'string', default: 'cookie' },
        },
        s = {},
        u = [
            'clearUserId',
            'getGioInfo',
            'getLocation',
            'getOption',
            'init',
            'setDataCollect',
            'setOption',
            'setUserId',
            'track',
            'setGeneralProps',
            'clearGeneralProps',
        ];
    i(i([], u, !0), ['setEvar', 'setPage', 'setUser', 'setVisitor'], !1);
    var c,
        d,
        l,
        g,
        f,
        h = i(
            i([], u, !0),
            [
                'enableDebug',
                'enableHT',
                'setAutotrack',
                'setTrackerHost',
                'setTrackerScheme',
                'setUserAttributes',
                'getVisitorId',
                'getDeviceId',
                'registerPlugins',
                'getPlugins',
                'sendPage',
                'sendVisit',
                'trackTimerStart',
                'trackTimerPause',
                'trackTimerResume',
                'trackTimerEnd',
                'removeTimer',
                'clearTrackTimer',
            ],
            !1,
        ),
        p = ['autotrack', 'dataCollect', 'dataSourceId', 'debug', 'host', 'hashtag', 'scheme'],
        v = { autotrack: '无埋点采集', dataCollect: '数据采集', debug: '调试模式' },
        m = ['send', 'setConfig', 'collectImp', 'setPlatformProfile'],
        I = ['screenHeight', 'screenWidth'],
        w = { click: 'VIEW_CLICK', change: 'VIEW_CHANGE', submit: 'FORM_SUBMIT' },
        y =
            'undefined' != typeof globalThis
                ? globalThis
                : 'undefined' != typeof window
                ? window
                : 'undefined' != typeof global
                ? global
                : 'undefined' != typeof self
                ? self
                : {},
        _ =
            'function' == typeof Array.from
                ? Array.from
                : (d ||
                      ((d = 1),
                      (l = function (e) {
                          return 'function' == typeof e;
                      }),
                      (g = function (e) {
                          var t = (function (e) {
                              var t = Number(e);
                              return isNaN(t) ? 0 : 0 !== t && isFinite(t) ? (t > 0 ? 1 : -1) * Math.floor(Math.abs(t)) : t;
                          })(e);
                          return Math.min(Math.max(t, 0), 9007199254740991);
                      }),
                      (f = function (e) {
                          var t = e.next();
                          return !t.done && t;
                      }),
                      (c = function (e) {
                          var t,
                              n,
                              i,
                              r = this,
                              o = arguments.length > 1 ? arguments[1] : void 0;
                          if (void 0 !== o) {
                              if (!l(o)) throw new TypeError('Array.from: when provided, the second argument must be a function');
                              arguments.length > 2 && (t = arguments[2]);
                          }
                          var a = (function (e, t) {
                              if (null != e && null != t) {
                                  var n = e[t];
                                  if (null == n) return;
                                  if (!l(n)) throw new TypeError(n + ' is not a function');
                                  return n;
                              }
                          })(
                              e,
                              (function (e) {
                                  if (null != e) {
                                      if (['string', 'number', 'boolean', 'symbol'].indexOf(typeof e) > -1) return Symbol.iterator;
                                      if ('undefined' != typeof Symbol && 'iterator' in Symbol && Symbol.iterator in e) return Symbol.iterator;
                                      if ('@@iterator' in e) return '@@iterator';
                                  }
                              })(e),
                          );
                          if (void 0 !== a) {
                              n = l(r) ? Object(new r()) : [];
                              var s,
                                  u,
                                  c = a.call(e);
                              if (null == c) throw new TypeError('Array.from requires an array-like or iterable object');
                              for (i = 0; ; ) {
                                  if (!(s = f(c))) return (n.length = i), n;
                                  (u = s.value), (n[i] = o ? o.call(t, u, i) : u), i++;
                              }
                          } else {
                              var d = Object(e);
                              if (null == e) throw new TypeError('Array.from requires an array-like object - not null or undefined');
                              var h,
                                  p = g(d.length);
                              for (n = l(r) ? Object(new r(p)) : Array(p), i = 0; p > i; ) (h = d[i]), (n[i] = o ? o.call(t, h, i) : h), i++;
                              n.length = p;
                          }
                          return n;
                      })),
                  c),
        E = function (e) {
            return H(['undefined', 'null'], Y(e));
        },
        b = function (e) {
            return 'string' === Y(e);
        },
        O = function (e) {
            return 'number' === Y(e);
        },
        T = function (e) {
            return 'NaN' === B(Number(e));
        },
        S = function (e) {
            return 'boolean' === Y(e);
        },
        N = function (e) {
            return 'object' === Y(e) && !E(e);
        },
        C = function (e) {
            return 'regexp' === Y(e);
        },
        P = function (e) {
            return ['function', 'asyncfunction'].includes(Y(e));
        },
        L = function (e) {
            return Array.isArray(e) && 'array' === Y(e);
        },
        A = function (e) {
            return 'date' === Y(e);
        },
        x = function (e, t) {
            return O(e) ? Number(e.toFixed(O(t) ? t : 2)) : b(e) && 'NaN' !== B(Number(e)) ? Number(Number(e).toFixed(O(t) ? t : 2)) : e;
        },
        D = function (e) {
            try {
                return j(e)[0];
            } catch (e) {
                return;
            }
        },
        R = function (e) {
            try {
                var t = j(e);
                return t[t.length - 1];
            } catch (e) {
                return;
            }
        },
        k = function (e, t) {
            return void 0 === t && (t = 1), L(e) && O(t) ? e.slice(t > 0 ? t : 1, e.length) : e;
        },
        U = function (e) {
            if (L(e)) {
                for (var t = 0, n = [], i = 0, r = e; i < r.length; i++) {
                    var o = r[i];
                    o && !Z(o) && (n[t++] = o);
                }
                return n;
            }
            return e;
        },
        q = function (e, t) {
            return e[G(e, t)];
        },
        G = function (e, t) {
            var n = -1;
            return (
                L(e) &&
                    e.every(function (e, i) {
                        return !t(e) || ((n = i), !1);
                    }),
                n
            );
        },
        H = function (e, t) {
            return ('array' === Y(e) || 'string' === Y(e)) && e.indexOf(t) >= 0;
        },
        j = _,
        B = function (e) {
            return E(e) ? '' : ''.concat(e);
        },
        M = function (e, t) {
            return 'string' == typeof e ? e.split(t) : e;
        },
        K = function (e) {
            if (b(e)) {
                var t = M(e, '');
                return ''.concat(D(t).toLowerCase()).concat(k(t).join(''));
            }
            return e;
        },
        F = function (e, t) {
            return !!b(e) && e.slice(0, t.length) === t;
        },
        V = function (e, t) {
            if (b(e)) {
                var n = e.length,
                    i = n;
                i > n && (i = n);
                var r = i;
                return (i -= t.length) >= 0 && e.slice(i, r) === t;
            }
            return !1;
        },
        W = {}.hasOwnProperty,
        X = function (e, t) {
            return !E(e) && W.call(e, t);
        },
        z = function (e) {
            return N(e) ? Object.keys(e) : [];
        },
        J = function (e, t) {
            z(e).forEach(function (n) {
                return t(e[n], n);
            });
        },
        Q = function (e, t) {
            var n = z(e);
            return !(
                !N(e) ||
                !N(t) ||
                n.length !== z(t).length ||
                H(
                    n.map(function (n, i) {
                        return N(e[n]) ? Q(e[n], t[n]) : e[n] === t[n];
                    }),
                    !1,
                )
            );
        },
        $ = function (e, t) {
            if (!N(e)) return !1;
            try {
                return 'string' === Y(t)
                    ? delete e[t]
                    : 'array' === Y(t)
                    ? t.map(function (t) {
                          return delete e[t];
                      })
                    : (C(t) &&
                          z(e).forEach(function (n) {
                              t.test(n) && $(e, n);
                          }),
                      !0);
            } catch (e) {
                return !1;
            }
        },
        Z = function (e) {
            return L(e) ? 0 === e.length : N(e) ? 0 === z(e).length : !e;
        },
        Y = function (e) {
            return {}.toString.call(e).slice(8, -1).toLowerCase();
        },
        ee = Object.freeze({
            __proto__: null,
            isNil: E,
            isString: b,
            isNumber: O,
            isNaN: T,
            isBoolean: S,
            isObject: N,
            isRegExp: C,
            isFunction: P,
            isArray: L,
            isDate: A,
            fixed: x,
            head: D,
            last: R,
            drop: k,
            dropWhile: function (e, t) {
                return L(e)
                    ? e.filter(function (e) {
                          return !t(e);
                      })
                    : e;
            },
            compact: U,
            find: q,
            findIndex: G,
            includes: H,
            arrayFrom: j,
            toString: B,
            split: M,
            lowerFirst: K,
            upperFirst: function (e) {
                if (b(e)) {
                    var t = M(e, '');
                    return ''.concat(D(t).toUpperCase()).concat(k(t).join(''));
                }
                return e;
            },
            startsWith: F,
            endsWith: V,
            has: X,
            keys: z,
            forEach: J,
            isEqual: Q,
            get: function (e, t, n) {
                var i = e;
                return N(e)
                    ? (t.split('.').forEach(function (e) {
                          i = i ? i[e] : n;
                      }),
                      i)
                    : n;
            },
            unset: $,
            isEmpty: Z,
            typeOf: Y,
            formatDate: function (e) {
                if (A(e)) {
                    var t = function (e) {
                        return 10 > e ? '0' + e : e;
                    };
                    return (
                        e.getFullYear() +
                        '-' +
                        t(e.getMonth() + 1) +
                        '-' +
                        t(e.getDate()) +
                        ' ' +
                        t(e.getHours()) +
                        ':' +
                        t(e.getMinutes()) +
                        ':' +
                        t(e.getSeconds()) +
                        '.' +
                        t(e.getMilliseconds())
                    );
                }
                return e;
            },
        }),
        te = function (e, t) {
            console.log(
                '%c [cmos-log]：'.concat(e),
                { info: 'color: #3B82F6;', error: 'color: #EF4444;', warn: 'color: #F59E0B;', success: 'color: #10B981;' }[t] || '',
            );
        },
        ne = function (e) {
            try {
                return e();
            } catch (e) {
                return;
            }
        },
        ie = function (e) {
            var t = {};
            return (
                N(e) &&
                    J(e, function (e, n) {
                        var i,
                            r = B(n).slice(0, 100);
                        N(e)
                            ? (t[r] = ie(e))
                            : L(e)
                            ? ((t[r] = e.slice(0, 100)),
                              'cdp' === (null === (i = window.vds) || void 0 === i ? void 0 : i.gioEnvironment) &&
                                  (t[r] = t[r].join('||').slice(0, 1e3)))
                            : (t[r] = E(e) ? '' : B(e).slice(0, 1e3));
                    }),
                t
            );
        },
        re = function (e, t, i, r) {
            void 0 === r && (r = {}),
                document.addEventListener
                    ? e.addEventListener(t, i, n(n({}, { capture: !0 }), r))
                    : e.attachEvent
                    ? e.attachEvent('on' + t, i)
                    : (e['on' + t] = i);
        },
        oe = function (e, t) {
            return b(e) && !Z(e) && e.match(/^[a-zA-Z_][0-9a-zA-Z_]{0,100}$/)
                ? t()
                : (te('事件名格式不正确，只能包含数字、字母和下划线，且不能以数字开头，字符总长度不能超过100!', 'error'), !1);
        },
        ae = Object.freeze({
            __proto__: null,
            consoleText: te,
            niceTry: ne,
            limitObject: ie,
            addListener: re,
            flattenObject: function (e) {
                void 0 === e && (e = {});
                var t = n({}, e);
                return (
                    z(t).forEach(function (e) {
                        N(t[e])
                            ? (z(t[e]).forEach(function (n) {
                                  t[''.concat(e, '_').concat(n)] = B(t[e][n]);
                              }),
                              $(t, e))
                            : L(t[e])
                            ? (t[e].forEach(function (n, i) {
                                  N(n)
                                      ? z(n).forEach(function (r) {
                                            t[''.concat(e, '_').concat(i, '_').concat(r)] = B(n[r]);
                                        })
                                      : (t[''.concat(e, '_').concat(i)] = B(n));
                              }),
                              $(t, e))
                            : E(t[e]) || '' === t[e]
                            ? $(t, e)
                            : (t[e] = B(t[e]));
                    }),
                    ie(t)
                );
            },
            eventNameValidate: oe,
            getGioFunction: function () {
                var e,
                    t,
                    n,
                    i,
                    r = window._gio_local_vds || 'vds',
                    o = null !== (t = null === (e = window[r]) || void 0 === e ? void 0 : e.namespace) && void 0 !== t ? t : 'gdp';
                return P(window[o])
                    ? window[o]
                    : null !== (i = null !== (n = window.gdp) && void 0 !== n ? n : window.gio) && void 0 !== i
                    ? i
                    : function () {};
            },
        }),
        se = function (e) {
            return (b(e) && e.length > 0) || (O(e) && e > 0);
        },
        ue = /^((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/i,
        ce = /^(https?:\/\/)|(([a-zA-Z0-9_-])+(\.)?)*(:\d+)?(\/((\.)?(\?)?=?&?[a-zA-Z0-9_-](\?)?)*)*$/i;
    function de(e) {
        for (var t = 1; arguments.length > t; t++) {
            var n = arguments[t];
            for (var i in n) e[i] = n[i];
        }
        return e;
    }
    var le,
        ge = (function e(t, n) {
            function i(e, i, r) {
                if ('undefined' != typeof document) {
                    'number' == typeof (r = de({}, n, r)).expires && (r.expires = new Date(Date.now() + 864e5 * r.expires)),
                        r.expires && (r.expires = r.expires.toUTCString()),
                        (e = encodeURIComponent(e)
                            .replace(/%(2[346B]|5E|60|7C)/g, decodeURIComponent)
                            .replace(/[()]/g, escape));
                    var o = '';
                    for (var a in r) r[a] && ((o += '; ' + a), !0 !== r[a] && (o += '=' + r[a].split(';')[0]));
                    return (document.cookie = e + '=' + t.write(i, e) + o);
                }
            }
            return Object.create(
                {
                    set: i,
                    get: function (e) {
                        if ('undefined' != typeof document && (!arguments.length || e)) {
                            for (var n = document.cookie ? document.cookie.split('; ') : [], i = {}, r = 0; r < n.length; r++) {
                                var o = n[r].split('='),
                                    a = o.slice(1).join('=');
                                try {
                                    var s = decodeURIComponent(o[0]);
                                    if (((i[s] = t.read(a, s)), e === s)) break;
                                } catch (e) {}
                            }
                            return e ? i[e] : i;
                        }
                    },
                    remove: function (e, t) {
                        i(e, '', de({}, t, { expires: -1 }));
                    },
                    withAttributes: function (t) {
                        return e(this.converter, de({}, this.attributes, t));
                    },
                    withConverter: function (t) {
                        return e(de({}, this.converter, t), this.attributes);
                    },
                },
                { attributes: { value: Object.freeze(n) }, converter: { value: Object.freeze(t) } },
            );
        })(
            {
                read: function (e) {
                    return '"' === e[0] && (e = e.slice(1, -1)), e.replace(/(%[\dA-F]{2})+/gi, decodeURIComponent);
                },
                write: function (e) {
                    return encodeURIComponent(e).replace(/%(2[346BF]|3[AC-F]|40|5[BDE]|60|7[BCD])/g, decodeURIComponent);
                },
            },
            { path: '/' },
        ),
        fe = function () {
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (e) {
                var t = (16 * Math.random()) | 0;
                return ('x' === e ? t : (3 & t) | 8).toString(16);
            });
        },
        he = function (e) {
            return V(e, '_gioenc') ? e.slice(0, -7) : e;
        },
        pe = function () {
            var e = window.navigator.userAgent;
            return /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(e) && !/chrome\/(\d+\.\d+)/i.test(e);
        },
        ve = function (e) {
            return (
                (T(Number(e)) &&
                    ne(function () {
                        return JSON.parse(e);
                    })) ||
                e
            );
        },
        me = { A: 1, a: 1, Z: 1, z: 1, '@': 1, '{': 1 },
        Ie = function (e) {
            return E(e)
                ? e
                : ne(function () {
                      return 'gioenc-'.concat(ye(e));
                  }) || e;
        },
        we = function (e) {
            return (
                (b(e) &&
                    F(e, 'gioenc-') &&
                    ne(function () {
                        return ye(e.replace('gioenc-', ''));
                    })) ||
                e
            );
        },
        ye = function (e) {
            return (e = e || '')
                .split('')
                .map(function (e) {
                    return me[e] ? e : _e(e);
                })
                .join('');
        },
        _e = function (e) {
            if (/[0-9]/.test(e)) return 1 ^ +e;
            var t = e.charCodeAt(0);
            return String.fromCharCode(1 ^ t);
        },
        Ee = function (e) {
            var t = this;
            (this.domain = e),
                (this.getItem = function (e) {
                    return ve(we(ge.get(he(e), { domain: t.domain, path: '/' })));
                }),
                (this.setItem = function (e, n, i) {
                    var r;
                    (r = b(n) ? (n.length ? (V(e, '_gioenc') ? Ie(n) : n) : '') : JSON.stringify(n)),
                        ge.set(he(e), r, { expires: i ? new Date(i) : 3650, domain: t.domain, path: '/' });
                }),
                (this.removeItem = function (e) {
                    ge.remove(he(e), { domain: t.domain, path: '/' });
                }),
                (this.hasItem = function (e) {
                    return H(z(ge.get()), he(e));
                }),
                (this.getKeys = function () {
                    return z(ge.get());
                }),
                (this.type = 'Cookie');
        },
        be = function () {
            (this.getItem = function (e) {
                var t =
                    ne(function () {
                        return JSON.parse(localStorage.getItem(he(e)) || '');
                    }) || {};
                return N(t) && t.expiredAt > +Date.now() ? ve(we(t.value)) : void 0;
            }),
                (this.setItem = function (e, t, n) {
                    var i = null != n ? n : +new Date(9999, 12);
                    localStorage.setItem(he(e), JSON.stringify({ value: b(t) && t.length && V(e, '_gioenc') ? Ie(t) : t, expiredAt: i }));
                }),
                (this.removeItem = function (e) {
                    return localStorage.removeItem(he(e));
                }),
                (this.hasItem = function (e) {
                    return !!localStorage.getItem(he(e));
                }),
                (this.getKeys = function () {
                    return j(Array(localStorage.length)).map(function (e, t) {
                        return localStorage.key(t);
                    });
                }),
                (this.type = 'localStorage');
        },
        Oe = {},
        Te = function () {
            (this.getItem = function (e) {
                var t = ne(function () {
                    return JSON.parse(Oe[he(e)] || '');
                });
                return N(t) && t.expiredAt > +Date.now() ? ve(we(t.value)) : void 0;
            }),
                (this.setItem = function (e, t, n) {
                    var i = null != n ? n : +new Date(9999, 12);
                    Oe[he(e)] = JSON.stringify({ value: b(t) && t.length ? Ie(t) : t, expiredAt: i });
                }),
                (this.removeItem = function (e) {
                    return $(Oe, he(e));
                }),
                (this.hasItem = function (e) {
                    return X(Oe, he(e));
                }),
                (this.getKeys = function () {
                    return z(Oe);
                }),
                (this.type = 'memory');
        },
        Se = /^(\.ac\.|\.br\.|\.co\.|\.com\.|\.edu\.|\.gov\.|\.org\.|\.net\.)/,
        Ne = function (e) {
            var t = [];
            try {
                var n = e.split('.'),
                    i = R(n);
                if (n.length >= 2 && (isNaN(Number(i)) || 0 > Number(i) || Number(i) > 255)) {
                    var r = '.'.concat(n.slice(-2).join('.'));
                    Se.test(r) ? (le = r) : t.push(r);
                    var o = '.'.concat(n.slice(-3).join('.'));
                    Se.test(o) || t.includes(o) || t.push(o);
                    var a = '.'.concat(n.slice(-4).join('.'));
                    Se.test(a) || t.includes(a) || t.push(a);
                }
            } catch (e) {}
            return t;
        },
        Ce = function (e) {
            var t = '';
            return (
                e.every(function (e) {
                    return !Pe(e) || ((t = e), !1);
                }),
                t
            );
        },
        Pe = function (e) {
            try {
                ge.set('gioCookie', 'yes', { domain: e });
                var t = !!ge.get('gioCookie', { domain: e });
                return ge.remove('gioCookie', { domain: e }), t;
            } catch (e) {
                return !1;
            }
        },
        Le = function (e) {
            var t,
                n,
                r,
                o = e.storageType,
                a = e.cookieDomain,
                s = e.projectId;
            if (
                (H(['cookie', 'localstorage'], o) || (o = 'cookie'),
                'cookie' === o &&
                    (n = !!(r =
                        navigator.userAgent.indexOf('Electron') > -1 ||
                        H(['', 'localhost', '127.0.0.1'], window.location.hostname) ||
                        !H(['http:', 'https:'], window.location.protocol)
                            ? ''
                            : Ce(i(i([], Ne(window.location.hostname), !0), [window.location.hostname], !1)))),
                'cookie' === o && n)
            ) {
                var u = new Ee(r);
                if (a) {
                    var c = Ne(a),
                        d = Ce(Z(c) ? [] : i([a], Ne(a), !0));
                    d && Pe(d) ? (u.domain = d) : te('指定Cookie域无效或无权限，使用默认域！', 'warn');
                }
                t = u;
            } else
                t = (function () {
                    try {
                        var e = window.localStorage,
                            t = '__storage_test__';
                        return e.setItem(t, t), e.removeItem(t), !0;
                    } catch (e) {
                        return !1;
                    }
                })()
                    ? new be()
                    : new Te();
            return (
                'cookie' === o &&
                    le &&
                    Pe(le) &&
                    (function (e, t, n) {
                        if (t && Pe(t)) {
                            var i = new Ee(t);
                            [
                                ''.concat(n, '_gdp_session_id'),
                                'gdp_user_id_gioenc',
                                ''.concat(n, '_gdp_cs1_gioenc'),
                                ''.concat(n, '_gdp_user_key_gioenc'),
                                ''.concat(n, '_gdp_gio_id_gioenc'),
                                ''.concat(n, '_gdp_sequence_ids'),
                                ''.concat(n, '_gdp_session_id_sent'),
                            ].forEach(function (t) {
                                var n = i.getItem(t);
                                i.hasItem(t) && (e.setItem(t, n), i.removeItem(t));
                            }),
                                (i = void 0);
                        }
                    })(t, le, s),
                t
            );
        },
        Ae = 'OPTION_INITIALIZED',
        xe = 'SDK_INITIALIZED',
        De = 'SESSIONID_UPDATE',
        Re = 'SET_USERID',
        ke = 'SET_USERKEY',
        Ue = {
            name: 'gioCompress',
            method: function (e) {
                var t = this;
                (this.growingIO = e),
                    (this._compress = function (e, t, n) {
                        if (null === e) return '';
                        var i,
                            r,
                            o,
                            a = {},
                            s = {},
                            u = '',
                            c = '',
                            d = '',
                            l = 2,
                            g = 3,
                            f = 2,
                            h = [],
                            p = 0,
                            v = 0;
                        for (o = 0; o < e.length; o += 1)
                            if (
                                ((u = e.charAt(o)),
                                {}.hasOwnProperty.call(a, u) || ((a[u] = g++), (s[u] = !0)),
                                (c = d + u),
                                {}.hasOwnProperty.call(a, c))
                            )
                                d = c;
                            else {
                                if ({}.hasOwnProperty.call(s, d)) {
                                    if (256 > d.charCodeAt(0)) {
                                        for (i = 0; f > i; i++) (p <<= 1), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++;
                                        for (r = d.charCodeAt(0), i = 0; 8 > i; i++)
                                            (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                                    } else {
                                        for (r = 1, i = 0; f > i; i++)
                                            (p = (p << 1) | r), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r = 0);
                                        for (r = d.charCodeAt(0), i = 0; 16 > i; i++)
                                            (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                                    }
                                    0 === --l && ((l = Math.pow(2, f)), f++), delete s[d];
                                } else
                                    for (r = a[d], i = 0; f > i; i++)
                                        (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                                0 === --l && ((l = Math.pow(2, f)), f++), (a[c] = g++), (d = u + '');
                            }
                        if ('' !== d) {
                            if ({}.hasOwnProperty.call(s, d)) {
                                if (256 > d.charCodeAt(0)) {
                                    for (i = 0; f > i; i++) (p <<= 1), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++;
                                    for (r = d.charCodeAt(0), i = 0; 8 > i; i++)
                                        (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                                } else {
                                    for (r = 1, i = 0; f > i; i++) (p = (p << 1) | r), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r = 0);
                                    for (r = d.charCodeAt(0), i = 0; 16 > i; i++)
                                        (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                                }
                                0 === --l && ((l = Math.pow(2, f)), f++), delete s[d];
                            } else
                                for (r = a[d], i = 0; f > i; i++)
                                    (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                            0 === --l && ((l = Math.pow(2, f)), f++);
                        }
                        for (r = 2, i = 0; f > i; i++) (p = (p << 1) | (1 & r)), v === t - 1 ? ((v = 0), h.push(n(p)), (p = 0)) : v++, (r >>= 1);
                        for (;;) {
                            if (((p <<= 1), v === t - 1)) {
                                h.push(n(p));
                                break;
                            }
                            v++;
                        }
                        return h.join('');
                    }),
                    (this.compress = function (e) {
                        var n = t;
                        return t._compress(e, 16, function (e) {
                            return n.f(e);
                        });
                    }),
                    (this.compressToUTF16 = function (e) {
                        var n = t;
                        return null === e
                            ? ''
                            : t._compress(e, 15, function (e) {
                                  return n.f(e + 32);
                              }) + ' ';
                    }),
                    (this.compressToUint8Array = function (e) {
                        for (var n = t.compress(e), i = new Uint8Array(2 * n.length), r = 0, o = n.length; o > r; r++) {
                            var a = n.charCodeAt(r);
                            (i[2 * r] = a >>> 8), (i[2 * r + 1] = a % 256);
                        }
                        return i;
                    }),
                    (this.compressToEncodedURIComponent = function (e) {
                        if (null === e) return '';
                        var n = t;
                        return t._compress(e, 6, function (e) {
                            return n.keyStrUriSafe.charAt(e);
                        });
                    }),
                    (this.f = String.fromCharCode),
                    (this.keyStrUriSafe = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$');
            },
        },
        qe = {
            name: 'gioCustomTracking',
            method: function (e) {
                var t = this;
                (this.growingIO = e),
                    (this.getValidResourceItem = function (e) {
                        if (e && N(e) && e.id && e.key) {
                            var t = { id: b(e.id) ? e.id : B(e.id), key: b(e.key) ? e.key : B(e.key) };
                            return e.attributes && (t.attributes = e.attributes), t;
                        }
                    }),
                    (this.getDynamicAttributes = function (e) {
                        return (
                            E(e) ||
                                z(e).forEach(function (t) {
                                    P(e[t]) ? (e[t] = e[t]()) : N(e[t]) ? $(e, t) : L(e[t]) || (e[t] = B(e[t]));
                                }),
                            e
                        );
                    }),
                    (this.buildCustomEvent = function (e, i, r, o) {
                        oe(e, function () {
                            var a = t.growingIO.dataStore,
                                s = a.eventContextBuilder,
                                u = a.eventConverter,
                                c = a.currentPage,
                                d = n(
                                    {
                                        eventType: 'CUSTOM',
                                        eventName: e,
                                        pageShowTimestamp: null == c ? void 0 : c.time,
                                        attributes: ie(t.getDynamicAttributes(N(i) && !Z(i) ? i : void 0)),
                                        resourceItem: ie(t.getValidResourceItem(r)),
                                    },
                                    s(),
                                );
                            Z(o) || (d = n(n({}, d), o)), u(d);
                        });
                    }),
                    (this.buildUserAttributesEvent = function (e, i) {
                        var r = t.growingIO.dataStore,
                            o = r.eventContextBuilder,
                            a = r.eventConverter,
                            s = n({ eventType: 'LOGIN_USER_ATTRIBUTES', attributes: ie(e) }, o());
                        Z(i) || (s = n(n({}, s), i)), a(s);
                    });
            },
        },
        Ge = {},
        He = {}.hasOwnProperty;
    function je(e) {
        try {
            return decodeURIComponent(e.replace(/\+/g, ' '));
        } catch (e) {
            return null;
        }
    }
    function Be(e) {
        try {
            return encodeURIComponent(e);
        } catch (e) {
            return null;
        }
    }
    (Ge.stringify = function (e, t) {
        t = t || '';
        var n,
            i,
            r = [];
        for (i in ('string' != typeof t && (t = '?'), e))
            if (He.call(e, i)) {
                if (((n = e[i]) || (null != n && !isNaN(n)) || (n = ''), (i = Be(i)), (n = Be(n)), null === i || null === n)) continue;
                r.push(i + '=' + n);
            }
        return r.length ? t + r.join('&') : '';
    }),
        (Ge.parse = function (e) {
            for (var t, n = /([^=?#&]+)=?([^&]*)/g, i = {}; (t = n.exec(e)); ) {
                var r = je(t[1]),
                    o = je(t[2]);
                null === r || null === o || r in i || (i[r] = o);
            }
            return i;
        });
    var Me = {
            gioprojectid: 'projectId',
            giodatacollect: 'dataCollect',
            gioappid: 'domain',
            giodatasourceid: 'dataSourceId',
            gios: 'sessionId',
            giou: 'uid',
            giocs1: 'userId',
            gioid: 'gioId',
            giouserkey: 'userKey',
            gioappchannel: 'appChannel',
            giodevicebrand: 'deviceBrand',
            giodevicemodel: 'deviceModel',
            giodevicetype: 'deviceType',
            giolanguage: 'language',
            gionetworkstate: 'networkState',
            giooperatingsystem: 'operatingSystem',
            gioplatform: 'platform',
            gioplatformversion: 'platformVersion',
            gioscreenheight: 'screenHeight',
            gioscreenwidth: 'screenWidth',
        },
        Ke = [
            'giodatasourceid',
            'gioplatform',
            'gioappchannel',
            'giodevicebrand',
            'giodevicemodel',
            'giodevicetype',
            'giolanguage',
            'gionetworkstate',
            'giooperatingsystem',
            'gioplatformversion',
            'gioscreenheight',
            'gioscreenwidth',
        ],
        Fe = ['giocs1', 'gios', 'giou', 'gioid', 'giouserkey'],
        Ve = 'gio_search_cookie_gioenc',
        We = {
            name: 'gioEmbeddedAdapter',
            method: function (e) {
                var t = this;
                (this.growingIO = e),
                    (this.main = function () {
                        var e,
                            n = t.growingIO.vdsConfig,
                            i = n.projectId,
                            r = n.appId,
                            o = t.getGQS(),
                            a = !1;
                        return (
                            'none' !== t.qsFrom &&
                                o.gioprojectid === i &&
                                o.gioappid === r &&
                                (Z(o) ? t.growingIO.storage.removeItem(Ve) : t.growingIO.storage.setItem(Ve, Ge.stringify(o)),
                                X(o, 'giodatacollect') && (t.growingIO.vdsConfig.dataCollect = H(['true', !0], o.giodatacollect)),
                                null === (e = t.growingIO.emitter) ||
                                    void 0 === e ||
                                    e.on('SDK_INITIALIZED', function () {
                                        var e = t.growingIO,
                                            n = e.userStore,
                                            i = e.vdsConfig.sessionExpires,
                                            r = e.dataStore.eventContextBuilderInst;
                                        Fe.forEach(function (e) {
                                            var t;
                                            n[Me[e]] = null !== (t = o[e]) && void 0 !== t ? t : '';
                                        }),
                                            window.setInterval(function () {
                                                n.sessionId = o.gios;
                                            }, 0.8 * i * 60 * 1e3),
                                            Ke.forEach(function (e) {
                                                X(o, e) && (r.minpExtraParams[Me[e]] = o[e]);
                                            });
                                    }),
                                (t.growingIO.setUserId = function () {}),
                                (t.growingIO.clearUserId = function () {}),
                                X(o, 'giodatacollect') && ((t.growingIO.setDataCollect = function () {}), (t.growingIO.setOption = function () {})),
                                (a = !0)),
                            t.gioURLRewrite(),
                            a
                        );
                    }),
                    (this.getGQS = function () {
                        var e = t.growingIO.vdsConfig.hashtag,
                            n = t.growingIO.storage.getItem(Ve),
                            r = window.location.search,
                            o = window.location.hash,
                            a = e ? o.substring(o.indexOf('?') + 1) : '',
                            s = Ge.parse(r),
                            u = Ge.parse(a),
                            c = Ge.parse((n || '').replace('gioenc-', '')),
                            d = {};
                        if (X(s, 'gioprojectid')) (d = s), (t.qsFrom = 'search');
                        else if (X(u, 'gioprojectid')) (d = u), (t.qsFrom = 'hash');
                        else {
                            if (!X(c, 'gioprojectid')) return (t.qsFrom = 'none'), {};
                            (d = c), (t.qsFrom = 'cookie');
                        }
                        var l = {},
                            g = {},
                            f = i(i(['gioappid', 'gioprojectid', 'giodatacollect'], Fe, !0), Ke, !0);
                        return (
                            z(d).forEach(function (e) {
                                var t = e.toLowerCase();
                                H(f, t)
                                    ? H(['', 'undefined', 'null', void 0, null], d[e]) ||
                                      ((l[t] = d[e]), H(['true', 'TRUE', !0], d[e]) && (l[t] = !0), H(['false', 'FALSE', !1], d[e]) && (l[t] = !1))
                                    : (g[e] = d[e]);
                            }),
                            (t.gqs = l),
                            (t.ngqs = g),
                            l
                        );
                    }),
                    (this.gioURLRewrite = function () {
                        var e = t.growingIO.vdsConfig.hashtag,
                            n = window.location.search,
                            i = window.location.hash,
                            r = !1;
                        if (
                            ('search' === t.qsFrom && ((n = Ge.stringify(t.ngqs, !0)), (r = !0)),
                            e && 'hash' === t.qsFrom && ((i = ''.concat(i.split('?')[0]).concat(Ge.stringify(t.ngqs, !0))), (r = !0)),
                            r)
                        ) {
                            var o = ''
                                .concat(window.location.pathname)
                                .concat(n || '')
                                .concat(i || '');
                            window.history.replaceState(null, document.title, o);
                        }
                    }),
                    (this.gqs = {}),
                    (this.ngqs = {}),
                    (this.qsFrom = 'search'),
                    this.growingIO.emitter.on(Ae, function () {
                        t.growingIO.useEmbeddedInherit = t.main();
                    });
            },
        },
        Xe = {},
        ze = {};
    !(function (e) {
        var t =
            (y && y.__spreadArray) ||
            function (e, t, n) {
                if (n || 2 === arguments.length)
                    for (var i, r = 0, o = t.length; o > r; r++) (!i && r in t) || (i || (i = [].slice.call(t, 0, r)), (i[r] = t[r]));
                return e.concat(i || [].slice.call(t));
            };
        Object.defineProperty(e, '__esModule', { value: !0 }),
            (e.GROWING_TITLE_OLD =
                e.GROWING_TITLE =
                e.GROWING_GTITLE =
                e.GROWING_CDP_INDEX =
                e.GROWING_INDEX_OLD =
                e.GROWING_INDEX =
                e.GROWING_CONTAINER =
                e.GROWING_TRACK =
                e.GROWING_IGNORE =
                e.VALID_CLASS_SELECTOR =
                e.VALID_ID_SELECTOR =
                e.INVALID_NUMERIC_RE =
                e.INVALID_CAMELCASE_RE =
                e.EXCLUDE_CLASS_RE =
                e.UNSUPPORTED_TAGS =
                e.TEXT_NODE =
                e.UNSUPPORTED_CLICK_TAGS =
                e.SUPPORTED_ICON_TAGS =
                e.SUPPORTED_CHANGE_TYPES =
                e.SUPPORTED_CLICK_INPUT_TYPES =
                e.SUPPORTED_CONTAINER_TAGS =
                e.LIST_TAGS =
                    void 0),
            (e.LIST_TAGS = ['TR', 'LI', 'DL']),
            (e.SUPPORTED_CONTAINER_TAGS = t(['A', 'BUTTON'], e.LIST_TAGS, !0)),
            (e.SUPPORTED_CLICK_INPUT_TYPES = ['button', 'submit', 'reset']),
            (e.SUPPORTED_CHANGE_TYPES = ['radio', 'checkbox', 'search']),
            (e.SUPPORTED_ICON_TAGS = ['I', 'EM', 'svg', 'IMG']),
            (e.UNSUPPORTED_CLICK_TAGS = ['TEXTAREA', 'HTML', 'BODY']),
            (e.TEXT_NODE = ['I', 'SPAN', 'EM', 'B', 'STRONG']),
            (e.UNSUPPORTED_TAGS = ['tspan', 'text', 'g', 'rect', 'path', 'defs', 'clippath', 'desc', 'title', 'math', 'use']),
            (e.EXCLUDE_CLASS_RE =
                /(^| |[^ ]+\-)(clear|clearfix|active|hover|enabled|current|selected|unselected|hidden|display|focus|disabled|undisabled|open|checked|unchecked|undefined|null|ng-|growing-)[^\. ]*/g),
            (e.INVALID_CAMELCASE_RE = /[a-z][A-Z][a-z][A-Z]/),
            (e.INVALID_NUMERIC_RE = /[0-9][0-9][0-9][0-9]/),
            (e.VALID_ID_SELECTOR = /^[a-zA-Z-\_][a-zA-Z\-\_0-9]+$/),
            (e.VALID_CLASS_SELECTOR = /^([a-zA-Z\-\_0-9]+)$/),
            (e.GROWING_IGNORE = 'data-growing-ignore'),
            (e.GROWING_TRACK = 'data-growing-track'),
            (e.GROWING_CONTAINER = 'data-growing-container'),
            (e.GROWING_INDEX = 'data-growing-index'),
            (e.GROWING_INDEX_OLD = 'data-growing-idx'),
            (e.GROWING_CDP_INDEX = 'data-index'),
            (e.GROWING_GTITLE = 'data-growing-title'),
            (e.GROWING_TITLE = 'data-title'),
            (e.GROWING_TITLE_OLD = 'growing-title');
    })(ze);
    var Je = {},
        Qe = {};
    Object.defineProperty(Qe, '__esModule', { value: !0 }),
        (Qe.lastFindIndex = Qe.findIndex = Qe.arrayEquals = Qe.rmBlank = Qe.normalizePath = Qe.splitNoEmpty = Qe.filterText = void 0);
    var $e = /\s+/g;
    (Qe.filterText = function (e, t) {
        if ((void 0 === t && (t = !0), !e)) return '';
        var n = e.replace($e, ' ').trim();
        return t && n.length > 50 ? n.slice(0, 50) : n;
    }),
        (Qe.splitNoEmpty = function (e, t) {
            return e
                ? e.split(t).filter(function (e) {
                      return !!e;
                  })
                : [];
        }),
        (Qe.normalizePath = function (e) {
            return e.replace(/\/+$/g, '') || '/';
        }),
        (Qe.rmBlank = function (e) {
            return e ? e.replace(/[\n \t]+/g, '') : '';
        }),
        (Qe.arrayEquals = function (e, t) {
            return (
                !!e &&
                !!t &&
                e.length === t.length &&
                e.every(function (e, n) {
                    return e === t[n];
                })
            );
        }),
        (Qe.findIndex = function (e, t) {
            if (!Array.isArray(e) || 'function' != typeof t) return -1;
            for (var n = 0; n < e.length; n++) if (t(e[n])) return n;
            return -1;
        }),
        (Qe.lastFindIndex = function (e, t) {
            if (null == e || 'function' != typeof t) return -1;
            for (var n = e.length - 1; n >= 0; n--) if (t(e[n])) return n;
            return -1;
        }),
        (function (e) {
            Object.defineProperty(e, '__esModule', { value: !0 }),
                (e.removeDiffTagOnHeadAndTail =
                    e.computeXpath =
                    e.getMarkIndex =
                    e.getEffectiveNode =
                    e.isIgnore =
                    e.depthInside =
                    e.changeableInput =
                    e.clickableInput =
                    e.onlyContainsTextChildren =
                    e.onlyContainsIconChildren =
                    e.supportIconTag =
                    e.isContainerTag =
                    e.isListTag =
                    e.isParentOfLeaf =
                    e.isLeaf =
                    e.getChildren =
                    e.getDeepChildren =
                    e.findParent =
                    e.isRootNode =
                    e.hasValidAttribute =
                    e.arrayFrom =
                        void 0);
            var t = Qe,
                n = ze;
            (e.arrayFrom = function (e) {
                return [].slice.call(e);
            }),
                (e.hasValidAttribute = function (e, t) {
                    if (!(e instanceof Element)) return !1;
                    var n = e.getAttribute(t);
                    return null !== n && 'false' !== n;
                }),
                (e.isRootNode = function (e) {
                    return !e || ['BODY', 'HTML', '#document'].includes(e.nodeName);
                }),
                (e.findParent = function (t, n) {
                    for (var i = t.parentNode; i && !(0, e.isRootNode)(i); ) {
                        if (n(i)) return i;
                        i = i.parentNode;
                    }
                }),
                (e.getDeepChildren = function (t) {
                    var n = [],
                        i = [],
                        r = (0, e.getChildren)(t);
                    i.push.apply(i, r);
                    for (var o = 0; o < i.length; ) {
                        var a = i[o++];
                        n.push(a), i.push.apply(i, (0, e.getChildren)(a));
                    }
                    return n;
                }),
                (e.getChildren = function (t) {
                    try {
                        return (null == t ? void 0 : t.childNodes)
                            ? (0, e.arrayFrom)(t.childNodes).filter(function (e) {
                                  return e.nodeType === Node.ELEMENT_NODE;
                              })
                            : [];
                    } catch (e) {
                        return [];
                    }
                }),
                (e.isLeaf = function (t) {
                    return !t.hasChildNodes() || 'svg' === t.nodeName || 0 === (0, e.getChildren)(t).length;
                }),
                (e.isParentOfLeaf = function (t) {
                    return (
                        !(!t.hasChildNodes() || 'svg' === t.nodeName) &&
                        0 ===
                            (0, e.arrayFrom)(t.childNodes).filter(function (t) {
                                return !(0, e.isLeaf)(t);
                            }).length
                    );
                }),
                (e.isListTag = function (e) {
                    return n.LIST_TAGS.includes(e.nodeName);
                }),
                (e.isContainerTag = function (t) {
                    return (0, e.hasValidAttribute)(t, n.GROWING_CONTAINER) || n.SUPPORTED_CONTAINER_TAGS.includes(t.nodeName);
                }),
                (e.supportIconTag = function (e) {
                    return n.SUPPORTED_ICON_TAGS.includes(e.nodeName);
                }),
                (e.onlyContainsIconChildren = function (t) {
                    if (t.textContent) return !1;
                    var n = (0, e.getChildren)(t);
                    if (0 === n.length) return !1;
                    for (var i = 0, r = n; i < r.length; i++) {
                        var o = r[i];
                        if (!(0, e.supportIconTag)(o) && 'SPAN' !== o.nodeName) return !1;
                    }
                    return !0;
                }),
                (e.onlyContainsTextChildren = function (t) {
                    return (
                        0 !== (0, e.getChildren)(t).length &&
                        !(0, e.getDeepChildren)(t)
                            .map(function (e) {
                                return e.tagName;
                            })
                            .some(function (e) {
                                return !n.TEXT_NODE.includes(e);
                            })
                    );
                }),
                (e.clickableInput = function (e) {
                    return e instanceof HTMLInputElement && n.SUPPORTED_CLICK_INPUT_TYPES.includes(e.type);
                }),
                (e.changeableInput = function (e) {
                    return e instanceof HTMLInputElement && n.SUPPORTED_CHANGE_TYPES.includes(e.type);
                }),
                (e.depthInside = function (t, n, i) {
                    if ((void 0 === n && (n = 4), void 0 === i && (i = 1), i > n)) return !1;
                    for (var r = 'svg' === t.tagName ? [] : (0, e.getChildren)(t), o = 0; o < r.length; o++) {
                        var a = r[o];
                        if (!(0, e.depthInside)(a, n, i + 1)) return !1;
                    }
                    return n >= i;
                }),
                (e.isIgnore = function (t) {
                    if (!(t instanceof Element) || (0, e.hasValidAttribute)(t, n.GROWING_IGNORE)) return !0;
                    for (var i = t.parentNode; i && !(0, e.isRootNode)(i); ) {
                        if ((0, e.hasValidAttribute)(i, n.GROWING_IGNORE)) return !0;
                        i = i.parentNode;
                    }
                    return !1;
                }),
                (e.getEffectiveNode = function (t) {
                    for (
                        var i = function (e) {
                            return (
                                e instanceof Element &&
                                !n.UNSUPPORTED_TAGS.includes(((t = e), null === (i = t.tagName) || void 0 === i ? void 0 : i.toLowerCase()))
                            );
                            var t, i;
                        };
                        t && !i(t) && t.parentNode;

                    )
                        t = t.parentNode;
                    var r,
                        o = t.parentNode;
                    return !(0, e.isRootNode)(o) &&
                        ((0, e.onlyContainsIconChildren)(o) || ('BUTTON' === (r = o).tagName && (0, e.onlyContainsTextChildren)(r)))
                        ? o
                        : t;
                }),
                (e.getMarkIndex = function (e) {
                    if (e instanceof Element)
                        for (var t = 0, i = [n.GROWING_INDEX, n.GROWING_INDEX_OLD, n.GROWING_CDP_INDEX]; i.length > t; t++) {
                            var r = i[t],
                                o = e.getAttribute(r);
                            if (null !== o) {
                                if (/^\d{1,10}$/.test(o)) {
                                    var a = Number(o);
                                    if (a >= 0 && 2147483647 > a) return a;
                                }
                                window.console.error('[GioNode]：标记的index不符合规范（index必须是大于等于0且小于2147483647的整数字）。', o);
                                break;
                            }
                        }
                }),
                (e.computeXpath = function (e) {
                    if (!e) return console.error('Invalid target node'), ['', '', ''];
                    for (var t = e.parentPaths(!0), n = Math.min(t.length, +(t.length >= 10) + 4), i = ['', '', ''], r = 0; r < t.length; r++) {
                        var o = t[r].path,
                            a = t[r].name;
                        (i[0] = o + i[0]), (i[2] = '/'.concat(a) + i[2]), n > r && (i[1] = o + i[1]);
                    }
                    return i;
                }),
                (e.removeDiffTagOnHeadAndTail = function (e, n) {
                    var i = function (e) {
                            return e.nodeName === n.nodeName;
                        },
                        r = (0, t.findIndex)(e, i);
                    if (-1 === r) return [];
                    var o = (0, t.lastFindIndex)(e, i);
                    return -1 === o ? [] : e.slice(r, o + 1);
                });
        })(Je);
    var Ze = {},
        Ye = {};
    Object.defineProperty(Ye, '__esModule', { value: !0 });
    var et = ze,
        tt = Qe,
        nt = Je;
    function it(e) {
        var t;
        if (!(e instanceof Element)) return null;
        var n = null === (t = e.id) || void 0 === t ? void 0 : t.trim();
        return n && et.VALID_ID_SELECTOR.test(n) ? n : null;
    }
    function rt(e) {
        var t;
        if (!(e instanceof Element)) return [];
        var n = e.getAttribute('name');
        if (n) return [n];
        if (e.hasAttribute('class')) {
            var i = null === (t = e.getAttribute('class')) || void 0 === t ? void 0 : t.replace(et.EXCLUDE_CLASS_RE, '').trim();
            if (null == i ? void 0 : i.length)
                return i
                    .split(/\s+/)
                    .filter(function (e) {
                        return et.VALID_CLASS_SELECTOR.test(e) && !et.INVALID_CAMELCASE_RE.test(e) && !et.INVALID_NUMERIC_RE.test(e);
                    })
                    .sort();
        }
        return [];
    }
    var ot = (function () {
        function e(e) {
            (this._parent = null),
                (this.node = e),
                (this.tagName = this.node.nodeName),
                (this.name = this.tagName.toLowerCase()),
                (this.id = it(this.node)),
                (this.classList = rt(this.node)),
                this.guessListAndIndex();
        }
        return (
            (e.prototype.guessListAndIndex = function () {
                var e,
                    t = this;
                this._tagList = (0, nt.isListTag)(this.node);
                var n = (0, nt.getChildren)(this.node.parentNode),
                    i = (0, nt.removeDiffTagOnHeadAndTail)(n, this.node),
                    r = i.length;
                if (this._tagList) {
                    var o = i
                        .filter(function (e) {
                            return e.tagName === t.tagName;
                        })
                        .indexOf(this.node);
                    -1 !== o && (this._index = o + 1);
                }
                if (i.length >= 3 && (null === (e = this.classList) || void 0 === e ? void 0 : e.length)) {
                    var a,
                        s = 0,
                        u = this.tagName,
                        c = -1;
                    for (o = 1; r > o; o++) {
                        var d = i[o - 1];
                        if (d instanceof Element) {
                            if (d.tagName !== u) {
                                s = 0;
                                break;
                            }
                            var l = rt(d);
                            (0, tt.arrayEquals)(this.classList, l) && s++, this.node === d && (c = o);
                        }
                    }
                    (a = c), 3 > s || ((this._pseudoList = !0), (this._index = this._index || a));
                }
            }),
            Object.defineProperty(e.prototype, 'path', {
                get: function () {
                    var e;
                    return (
                        this._path ||
                            ((this._path = '/'.concat(this.name)),
                            this.id && (this._path += '#'.concat(this.id)),
                            (null === (e = this.classList) || void 0 === e ? void 0 : e.length) &&
                                (this._path += '.'.concat(this.classList.join('.')))),
                        this._path
                    );
                },
                enumerable: !1,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'pseudoList', {
                get: function () {
                    return !!this._pseudoList;
                },
                enumerable: !1,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'list', {
                get: function () {
                    return !!this._tagList || !!this._pseudoList;
                },
                enumerable: !1,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'index', {
                get: function () {
                    var e;
                    return null !== (e = (0, nt.getMarkIndex)(this.node)) && void 0 !== e ? e : this._index;
                },
                enumerable: !1,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'container', {
                get: function () {
                    return (0, nt.isContainerTag)(this.node) || this.list;
                },
                enumerable: !1,
                configurable: !0,
            }),
            Object.defineProperty(e.prototype, 'parent', {
                get: function () {
                    var t;
                    if (!(null === (t = this.node) || void 0 === t ? void 0 : t.parentNode)) return null;
                    var n = this.node.parentNode,
                        i = e._parentCache.get(n),
                        r = it(n),
                        o = rt(n);
                    return (
                        (!i || i.id !== r || !(0, tt.arrayEquals)(i.classList, o)) && ((i = new e(n)), e._parentCache.set(n, i)),
                        (this._parent = i),
                        this._parent
                    );
                },
                enumerable: !1,
                configurable: !0,
            }),
            (e.prototype.parentPaths = function (e) {
                void 0 === e && (e = !1);
                for (var t = e ? [this] : [], n = this.parent; n && !(0, nt.isRootNode)(n.node); ) t.push(n), (n = n.parent);
                return t;
            }),
            (e._parentCache = new WeakMap()),
            e
        );
    })();
    Ye.default = ot;
    var at = {};
    Object.defineProperty(at, '__esModule', { value: !0 }), (at.getElementHref = at.getImgHref = at.getAnchorHref = void 0);
    var st = Qe;
    function ut(e) {
        if (e.hasAttribute('href')) {
            var t = e.getAttribute('href');
            if (t && 0 !== t.indexOf('javascript')) return (0, st.normalizePath)(t.slice(0, 320));
        }
    }
    function ct(e) {
        if (e.src && -1 === e.src.indexOf('data:image')) return e.src;
    }
    (at.getAnchorHref = ut),
        (at.getImgHref = ct),
        (at.getElementHref = function (e) {
            var t = e;
            if (t)
                switch (e.nodeName.toLowerCase()) {
                    case 'a':
                        return ut(t);
                    case 'img':
                        return ct(t);
                }
        });
    var dt = {},
        lt =
            (y && y.__importDefault) ||
            function (e) {
                return e && e.__esModule ? e : { default: e };
            };
    Object.defineProperty(dt, '__esModule', { value: !0 }), (dt.getElementContent = dt.getFormContent = void 0);
    var gt = Je,
        ft = at,
        ht = ze,
        pt = lt(Ye),
        vt = Qe,
        mt = function (e) {
            return e.htmlFor || e.getAttribute('for');
        };
    function It(e) {
        var t = e.node;
        return e.list ? wt(t) : (0, vt.filterText)(t.textContent) || void 0;
    }
    function wt(e) {
        for (var t, n = !1, i = 0, r = (0, gt.arrayFrom)(e.childNodes); i < r.length; i++) {
            var o = r[i];
            if (o.nodeType === Node.TEXT_NODE) {
                var a = (0, vt.filterText)(o.textContent);
                if (a) return a;
            }
            if (o.nodeType === Node.ELEMENT_NODE && -1 === ['INPUT', 'SELECT'].indexOf(o.nodeName)) {
                if (new pt.default(o).pseudoList) return;
                n = (0, gt.onlyContainsIconChildren)(o) || (0, gt.supportIconTag)(o);
                var s = _t(o);
                if (n) (t = s), (n = !1);
                else if ((s || (s = wt(o)), s)) return s;
            }
        }
        return t;
    }
    function yt(e) {
        for (var t = e.getElementsByTagName('input'), n = 0, i = (0, gt.arrayFrom)(t); n < i.length; n++) {
            var r = i[n];
            if (
                ('search' === r.type ||
                    ('text' === r.type && ('q' === r.id || -1 !== r.id.indexOf('search') || 'q' === r.name || -1 !== r.name.indexOf('search')))) &&
                !(0, gt.isIgnore)(r)
            ) {
                var o = _t(r);
                if (o) return o;
            }
        }
    }
    function _t(e) {
        return (
            (function (e) {
                var t = e;
                if (t) {
                    var n = (function (e) {
                        var t =
                            e.getAttribute(ht.GROWING_GTITLE) ||
                            e.getAttribute(ht.GROWING_TITLE) ||
                            e.getAttribute(ht.GROWING_TITLE_OLD) ||
                            e.getAttribute('title');
                        return null == t ? void 0 : t.trim();
                    })(t);
                    if (n) return n;
                    var i,
                        r,
                        o,
                        a = new pt.default(e);
                    switch (e.nodeName.toLowerCase()) {
                        case 'a':
                            return (function (e) {
                                if (((0, gt.isLeaf)(e) || (0, gt.onlyContainsIconChildren)(e)) && e.textContent) {
                                    var t = (0, vt.filterText)(e.textContent);
                                    if (t) return t;
                                }
                                var n = (0, ft.getAnchorHref)(e);
                                if (n) {
                                    var i = n.indexOf('?');
                                    return i > -1 ? n.slice(0, i) : n;
                                }
                            })(t);
                        case 'svg':
                            return (function (e) {
                                for (var t = 0, n = (0, gt.arrayFrom)(e.childNodes); t < n.length; t++) {
                                    var i = n[t];
                                    if (i.nodeType === Node.ELEMENT_NODE && 'use' === i.tagName.toLowerCase() && i.hasAttribute('xlink:href'))
                                        return i.getAttribute('xlink:href');
                                }
                            })(t);
                        case 'button':
                            return (null === (o = (r = t).name) || void 0 === o ? void 0 : o.length)
                                ? r.name
                                : (0, vt.filterText)(r.textContent) || wt(r);
                        case 'img':
                            return (function (e) {
                                if (e.alt) return e.alt;
                                var t = (0, ft.getImgHref)(e);
                                if (t) {
                                    var n = t.split('?')[0].split('/');
                                    if (n.length > 0) return n[n.length - 1];
                                }
                            })(t);
                        case 'label':
                            return It(a);
                        case 'input':
                            return (function (e) {
                                if ((0, gt.clickableInput)(e)) return e.value;
                                if ('password' !== e.type && (0, gt.hasValidAttribute)(e, ht.GROWING_TRACK)) return e.value;
                                if ((0, gt.changeableInput)(e)) {
                                    var t = (0, gt.findParent)(e, function (e) {
                                        return 'LABEL' === e.nodeName;
                                    });
                                    if (!t && e.id)
                                        for (var n = document.body.getElementsByTagName('label'), i = 0; i < n.length; i++) {
                                            var r = n[i];
                                            if (mt(r) === e.id) {
                                                t = r;
                                                break;
                                            }
                                        }
                                    if (t) {
                                        var o = It(new pt.default(t));
                                        if (o && o.length > 0) return o + ' (' + e.checked + ')';
                                    }
                                    return e.value;
                                }
                            })(t);
                        case 'select':
                            return (
                                (i = t),
                                (0, gt.arrayFrom)(i.options)
                                    .filter(function (e) {
                                        return e.selected;
                                    })
                                    .map(function (e) {
                                        return e.label;
                                    })
                                    .join(', ') || i.value
                            );
                        case 'form':
                            return yt(t);
                    }
                    return (0, gt.isLeaf)(t)
                        ? (function (e) {
                              var t = (0, vt.filterText)(e.textContent);
                              if (t) return t;
                          })(t)
                        : (0, gt.isParentOfLeaf)(t) && !(0, gt.onlyContainsIconChildren)(t)
                        ? (function (e) {
                              for (var t = '', n = 0, i = (0, gt.arrayFrom)(e.childNodes); n < i.length; n++) {
                                  var r = i[n];
                                  t += (r.nodeType === Node.TEXT_NODE && r.textContent ? r.textContent.trim() : '') + ' ';
                              }
                              return (0, vt.filterText)(t, !1);
                          })(t)
                        : a.container || (0, gt.onlyContainsIconChildren)(e)
                        ? wt(t)
                        : void 0;
                }
            })(e) || void 0
        );
    }
    (dt.getFormContent = yt), (dt.getElementContent = _t);
    var Et =
            (y && y.__extends) ||
            (function () {
                var e = function (t, n) {
                    return (
                        (e =
                            Object.setPrototypeOf ||
                            ({ __proto__: [] } instanceof Array &&
                                function (e, t) {
                                    e.__proto__ = t;
                                }) ||
                            function (e, t) {
                                for (var n in t) ({}).hasOwnProperty.call(t, n) && (e[n] = t[n]);
                            }),
                        e(t, n)
                    );
                };
                return function (t, n) {
                    if ('function' != typeof n && null !== n) throw new TypeError('Class extends value ' + n + ' is not a constructor or null');
                    function i() {
                        this.constructor = t;
                    }
                    e(t, n), (t.prototype = null === n ? Object.create(n) : ((i.prototype = n.prototype), new i()));
                };
            })(),
        bt =
            (y && y.__importDefault) ||
            function (e) {
                return e && e.__esModule ? e : { default: e };
            };
    Object.defineProperty(Ze, '__esModule', { value: !0 });
    var Ot = bt(Ye),
        Tt = at,
        St = dt,
        Nt = Je,
        Ct = (function (e) {
            function t(t) {
                var n = e.call(this, t) || this;
                n.node = t;
                var i = (0, Nt.computeXpath)(n),
                    r = i[0],
                    o = i[1],
                    a = i[2];
                return (n.fullXpath = r), (n.xpath = o), (n.skeleton = a), n;
            }
            return (
                Et(t, e),
                Object.defineProperty(t.prototype, 'href', {
                    get: function () {
                        return (0, Tt.getElementHref)(this.node);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(t.prototype, 'content', {
                    get: function () {
                        return (0, St.getElementContent)(this.node);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                t
            );
        })(Ot.default);
    Ze.default = Ct;
    var Pt =
            (y && y.__assign) ||
            function () {
                return (
                    (Pt =
                        Object.assign ||
                        function (e) {
                            for (var t, n = 1, i = arguments.length; i > n; n++)
                                for (var r in (t = arguments[n])) ({}).hasOwnProperty.call(t, r) && (e[r] = t[r]);
                            return e;
                        }),
                    Pt.apply(this, arguments)
                );
            },
        Lt =
            (y && y.__importDefault) ||
            function (e) {
                return e && e.__esModule ? e : { default: e };
            };
    Object.defineProperty(Xe, '__esModule', { value: !0 });
    var At,
        xt,
        Dt = ze,
        Rt = Je,
        kt = Lt(Ze),
        Ut = (function () {
            function e(e, t, n) {
                void 0 === t && (t = null),
                    void 0 === n && (n = !0),
                    (this.origin = e),
                    (this.action = t),
                    (this.direct = n),
                    (this.target = 'self' === t ? e : (0, Rt.getEffectiveNode)(e)),
                    (this.ignore = (0, Rt.isIgnore)(this.target)),
                    (this.vnode = new kt.default(this.target)),
                    (this.tagName = this.vnode.tagName);
            }
            return (
                Object.defineProperty(e.prototype, 'content', {
                    get: function () {
                        return this.vnode.content;
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'href', {
                    get: function () {
                        return this.vnode.href;
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'index', {
                    get: function () {
                        return this.vnode.index;
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                (e.prototype.inferParentIndex = function () {
                    var t = this;
                    return (
                        this.parentIndex ||
                            (0, Rt.findParent)(this.target, function (n) {
                                var i = new e(n, t.action, !1);
                                return !(!i.traceable() || !i.index || ((t.parentIndex = i.index), 0));
                            }),
                        this.parentIndex
                    );
                }),
                Object.defineProperty(e.prototype, 'xpath', {
                    get: function () {
                        return this.vnode.xpath;
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'fullXpath', {
                    get: function () {
                        return this.vnode.fullXpath;
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'skeleton', {
                    get: function () {
                        return this.vnode.skeleton;
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                (e.prototype.info = function (e) {
                    return (
                        void 0 === e && (e = !0),
                        e && this.inferParentIndex(),
                        {
                            skeleton: this.skeleton,
                            fullXpath: this.fullXpath,
                            xpath: this.xpath,
                            content: this.content,
                            href: this.href,
                            index: this.parentIndex || this.index,
                        }
                    );
                }),
                (e.prototype.traceable = function () {
                    if (this.ignore) return !1;
                    if (this.direct) {
                        if ('click' === this.action || 'hover' === this.action) {
                            if (-1 !== Dt.UNSUPPORTED_CLICK_TAGS.indexOf(this.target.tagName)) return !1;
                            if ('INPUT' === this.target.tagName && !(0, Rt.clickableInput)(this.target)) return !1;
                            if (!(0, Rt.isContainerTag)(this.target) && !(0, Rt.depthInside)(this.target, 5)) return !1;
                        }
                        return !0;
                    }
                    return this.vnode.container;
                }),
                (e.prototype.trackNodes = function () {
                    if (!this.traceable()) return [];
                    var e,
                        t = [this];
                    if ('submit' !== this.action)
                        for (var n = this.parentElement; n; ) {
                            if (n.ignore) return [];
                            n.traceable() && t.unshift(n), (n = n.parentElement);
                        }
                    return t.map(function (t) {
                        var n = t.info(!1),
                            i = n.index;
                        return !e && i && (e = i), Pt(Pt({}, n), { index: e || i });
                    });
                }),
                Object.defineProperty(e.prototype, 'parentElement', {
                    get: function () {
                        var t = this.target.parentElement;
                        if (t && !(0, Rt.isRootNode)(t)) return new e(t, this.action, !1);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                e
            );
        })(),
        qt = (Xe.default = Ut),
        Gt = (function () {
            function e(e) {
                this.handler = e;
                var t = navigator.userAgent,
                    n = /chrome/i.exec(t),
                    i = /android/i.exec(t);
                this.hasTouch = 'ontouchstart' in window && !(n && !i);
            }
            return (
                (e.prototype.main = function () {
                    for (
                        var e = this.hasTouch ? ['touchstart'] : ['mousedown'],
                            t = this.hasTouch ? ['touchend', 'touchcancel'] : ['mouseup', 'mouseleave'],
                            n = this.hasTouch ? ['touchmove'] : ['mousemove'],
                            i = 0,
                            r = e;
                        r.length > i;
                        i++
                    )
                        re(window, r[i], this.touchStartHandler.bind(this));
                    for (var o = 0, a = n; a.length > o; o++) re(window, a[o], this.touchMoveHandler.bind(this));
                    for (var s = 0, u = t; u.length > s; s++) re(window, u[s], this.touchStopHandler.bind(this));
                }),
                (e.prototype.touchStartHandler = function (e) {
                    if (1 >= e.which) {
                        var t = +Date.now();
                        this.safeguard !== t &&
                            (this.touchTimeout && clearTimeout(this.touchTimeout),
                            (this.safeguard = t),
                            (this.touchEvent = {
                                time: t,
                                target: e.target,
                                x: this._page('x', e),
                                y: this._page('y', e),
                                isTrusted: !0,
                                type: 'click',
                            }));
                    }
                }),
                (e.prototype.touchMoveHandler = function (e) {
                    var t = Math.abs(this._page('x', e) - (this.touchEvent && this.touchEvent.x) || 0),
                        n = Math.abs(this._page('y', e) - (this.touchEvent && this.touchEvent.y) || 0);
                    (t > 10 || n > 10) && (this.touchEvent = null);
                }),
                (e.prototype.touchStopHandler = function (e) {
                    var t = this,
                        n = +Date.now() - (this.touchEvent && this.touchEvent.time) || 0;
                    this.touchEvent && 200 > n
                        ? (this.touchTimeout = setTimeout(function () {
                              t.handler(t.touchEvent), (t.touchEvent = null);
                          }, 200))
                        : this.touchEvent && n >= 200 && 700 > n && (this.handler(this.touchEvent), (this.touchEvent = null));
                }),
                (e.prototype._page = function (e, t) {
                    return (this.hasTouch ? t.touches[0] : t)['page'.concat(e.toUpperCase())];
                }),
                e
            );
        })(),
        Ht = {
            name: 'gioEventAutoTracking',
            method: function (e) {
                var t = this;
                (this.growingIO = e),
                    (this.main = function () {
                        re(document, 'submit', t._handleAction),
                            re(document, 'change', t._handleAction),
                            t.growingIO.vdsConfig.touch ? new Gt(t._handleAction).main() : re(document, 'click', t._handleAction);
                    }),
                    (this._handleAction = function (e, i) {
                        var r = t.growingIO,
                            o = r.vdsConfig,
                            a = r.emitter;
                        if (!o.autotrack) return !1;
                        var s = e.target;
                        if (!s) return !1;
                        var u = new qt(s, e.type, !0).trackNodes();
                        if (('click' !== e.type && (u = Z(R(u)) ? [] : [R(u)]), Z(u))) return !1;
                        null == a || a.emit('onComposeBefore', { event: i, params: null != e ? e : {} }),
                            u.forEach(function (i) {
                                var r = i.fullXpath,
                                    a = i.index,
                                    s = i.content,
                                    u = i.href;
                                if (
                                    !F(i.fullXpath || '', '/div#__vconsole') &&
                                    !F(i.fullXpath || '', '/div#__giokit') &&
                                    (o.debug && console.log('Action：', e.type, Date.now()), r)
                                ) {
                                    var c = t.growingIO.dataStore,
                                        d = c.eventContextBuilder,
                                        l = c.eventConverter,
                                        g = c.currentPage;
                                    l(
                                        n(n({ eventType: w[e.type], element: [{ xpath: r, index: a, textValue: s, hyperlink: u }] }, d()), {
                                            pageShowTimestamp: g.time,
                                        }),
                                    );
                                }
                            });
                    });
            },
        },
        jt = ['VIEW_CLICK', 'VIEW_CHANGE', 'FORM_SUBMIT', 'PAGE', 'CUSTOM', 'LOGIN_USER_ATTRIBUTES'],
        Bt = ['LOGIN_USER_ATTRIBUTES'],
        Mt = {
            name: 'gioHybridAdapter',
            method: function (e) {
                var t = this;
                (this.growingIO = e),
                    (this.penetrateHybrid = !0),
                    (this.onOptionsInit = function () {
                        var e = t.growingIO,
                            n = e.vdsConfig,
                            i = e.emitter;
                        S(n.penetrateHybrid) && (t.penetrateHybrid = n.penetrateHybrid),
                            t._initHybridBridge() &&
                                ((t.onSendBefore = t.sendBeforeListener),
                                t.hybridConfig.projectId === t.growingIO.vdsConfig.projectId && (t.growingIO.useHybridInherit = !0)),
                            t.growingIO.useHybridInherit &&
                                (null == i ||
                                    i.on(Re, function (e) {
                                        var n = e.newUserId,
                                            i = e.oldUserId,
                                            r = e.userKey;
                                        t.penetrateHybrid &&
                                            (!n && i
                                                ? r
                                                    ? t._clearNativeUserIdAndUserKey()
                                                    : t._clearNativeUserId()
                                                : r
                                                ? t._setNativeUserIdAndUserKey(B(n), B(r))
                                                : t._setNativeUserId(B(n)));
                                    }),
                                null == i ||
                                    i.on(ke, function (e) {
                                        var n = e.newUserKey,
                                            i = e.oldUserKey,
                                            r = e.userId;
                                        t.penetrateHybrid && (!n && i ? t._clearNativeUserIdAndUserKey() : t._setNativeUserIdAndUserKey(B(r), B(n)));
                                    }));
                    }),
                    (this._initHybridBridge = function () {
                        var e,
                            n,
                            i,
                            r = !1;
                        return (
                            (t.hasHybridBridge = !!window.GrowingWebViewJavascriptBridge),
                            t.hasHybridBridge
                                ? ((null === (e = null === window || void 0 === window ? void 0 : window.GrowingWebViewJavascriptBridge) ||
                                  void 0 === e
                                      ? void 0
                                      : e.configuration) ||
                                      (window.GrowingWebViewJavascriptBridge.configuration = JSON.parse(
                                          window.GrowingWebViewJavascriptBridge.getConfiguration(),
                                      )),
                                  (null === (n = null === window || void 0 === window ? void 0 : window.GrowingWebViewJavascriptBridge) ||
                                  void 0 === n
                                      ? void 0
                                      : n.configuration) &&
                                      (t.hybridConfig =
                                          null === (i = null === window || void 0 === window ? void 0 : window.GrowingWebViewJavascriptBridge) ||
                                          void 0 === i
                                              ? void 0
                                              : i.configuration),
                                  (r = !0))
                                : At.consoleText('HybridAdapter：当前不存在 WebViewJavascriptBridge，Web模式。', 'info'),
                            r
                        );
                    }),
                    (this.sendBeforeListener = function (e) {
                        var i = e.requestData;
                        if (t.hasHybridBridge) {
                            var r = t.processAttributes(n({}, i));
                            H(jt, r.eventType) &&
                                (H(Bt, r.eventType)
                                    ? t.penetrateHybrid && t._dispatchEvent(r)
                                    : (t.penetrateHybrid || $(r, ['userId', 'userKey', 'cs1']), t._dispatchEvent(r)));
                        }
                    }),
                    (this.processAttributes = function (e) {
                        return (
                            J(e, function (t, n) {
                                N(t) || L(t)
                                    ? J(e[n], function (t, i) {
                                          N(t) || L(t) ? (e[n][i] = JSON.stringify(t)) : (e[n][i] = B(t));
                                      })
                                    : (e[n] = B(t));
                            }),
                            e
                        );
                    }),
                    (this._setNativeUserId = function (e) {
                        ne(function () {
                            return window.GrowingWebViewJavascriptBridge.setNativeUserId(e);
                        });
                    }),
                    (this._clearNativeUserId = function () {
                        ne(function () {
                            return window.GrowingWebViewJavascriptBridge.clearNativeUserId();
                        });
                    }),
                    (this._setNativeUserIdAndUserKey = function (e, t) {
                        ne(function () {
                            return window.GrowingWebViewJavascriptBridge.setNativeUserIdAndUserKey(e, t);
                        });
                    }),
                    (this._clearNativeUserIdAndUserKey = function () {
                        ne(function () {
                            return window.GrowingWebViewJavascriptBridge.clearNativeUserIdAndUserKey();
                        });
                    }),
                    (this._dispatchEvent = function (e) {
                        ne(function () {
                            var t;
                            return null === (t = window.GrowingWebViewJavascriptBridge) || void 0 === t ? void 0 : t.dispatchEvent(JSON.stringify(e));
                        });
                    });
                var i = this.growingIO,
                    r = i.emitter,
                    o = i.utils;
                (At = o), r.on(Ae, this.onOptionsInit);
            },
        },
        Kt = ['i', 'span', 'em', 'b', 'strong', 'svg'];
    !(function (e) {
        (e[(e.OUTER = 0)] = 'OUTER'), (e[(e.INNER_COVERED = 1)] = 'INNER_COVERED'), (e[(e.INNER_SHOW = 2)] = 'INNER_SHOW');
    })(xt || (xt = {}));
    var Ft = i(
            ['HR', 'BR', 'SCRIPT', 'NOSCRIPT', 'STYLE', 'HEAD', 'BASE', 'LINK', 'META', 'TITLE', 'BODY', 'HTML', 'TEMPLATE', 'CODE'],
            ze.UNSUPPORTED_CLICK_TAGS,
            !0,
        ),
        Vt = ['SELECT', 'A', 'BUTTON', 'INPUT', 'IMG', 'FORM'],
        Wt = function (e, t, n) {
            return document.elementFromPoint(t, n) === e;
        },
        Xt = (function () {
            function e(e, t, n) {
                (this.node = e),
                    (this.parentNodeDesc = t),
                    (this.devicesInfo = n),
                    (this.proxy = new qt(e)),
                    (this.tagName = this.node.tagName),
                    (this.name = this.tagName.toLowerCase()),
                    (this.isIgnore = !!this.node.dataset.growingIgnore),
                    (this.isUnSupported = -1 !== Ft.indexOf(this.tagName)),
                    (this.rect = this.computeWindowRect());
            }
            return (
                (e.prototype.info = function () {
                    var e = this.desc();
                    e.zLevel += this.devicesInfo.webviewZLevel;
                    var t = this.getDeviceRect(this.rect);
                    return (
                        $(e, 'isContainer'),
                        n(n(n({}, e), t), {
                            parentXPath: this.parentNodeDesc.isContainer ? this.parentNodeDesc.xpath : void 0,
                            href: this.proxy.href,
                            content: this.proxy.content,
                            nodeType: this.nodeType(),
                        })
                    );
                }),
                (e.prototype.nodeType = function () {
                    return 'input' !== this.name || Je.changeableInput(this.node) ? this.node.tagName : 'INPUT_BTN';
                }),
                (e.prototype.desc = function () {
                    return {
                        index: this.parentNodeDesc.index || this.proxy.index,
                        zLevel: this.zLevel(),
                        xpath: this.proxy.xpath,
                        isContainer: this.isDefinedContainer(),
                    };
                }),
                (e.prototype.cssVisible = function () {
                    var e = this.computedStyle();
                    return Number(e.opacity) > 0 && 'visible' === e.visibility && 'none' !== e.display;
                }),
                (e.prototype.viewportStatus = function () {
                    var e = this.rect,
                        t = e.top,
                        n = e.left,
                        i = e.width,
                        r = e.height,
                        o = this.devicesInfo,
                        a = o.winWidth,
                        s = o.winHeight;
                    if (0 >= i || 0 >= r) return xt.OUTER;
                    var u = this.node;
                    return s > t && a > n && i > 0 && r > 0
                        ? Wt(u, n + i / 2, t + r / 2) ||
                          Wt(u, n + 1, t + 1) ||
                          Wt(u, n + i - 1, t + 1) ||
                          Wt(u, n + 1, t + r - 1) ||
                          Wt(u, n + i - 1, t + r - 1)
                            ? xt.INNER_SHOW
                            : xt.INNER_COVERED
                        : xt.OUTER;
                }),
                (e.prototype.isCircleable = function () {
                    return (
                        this.proxy.target === this.proxy.origin &&
                        (!!this.isDefinedContainer() ||
                            (!('input' === this.name && this.node instanceof HTMLInputElement && 'password' === this.node.type) &&
                                (-1 !== Vt.indexOf(this.name) ||
                                    (Je.isLeaf(this.node) ? !this.isBigBlank() : this.hasBackgroundImage() && Je.depthInside(this.node, 4)))))
                    );
                }),
                (e.prototype.isSimpleContainer = function () {
                    return (
                        'select' === this.name ||
                        (this.isDefaultContainer() &&
                            ((function (e, t) {
                                if (0 === e.children.length) return !1;
                                for (var n = 0, i = j(e.children); n < i.length; n++) {
                                    var r = i[n];
                                    if (-1 === t.indexOf(r.tagName.toLowerCase())) return !1;
                                }
                                return !0;
                            })(this.node, Kt) ||
                                !this.node.childElementCount))
                    );
                }),
                (e.prototype.isDefinedContainer = function () {
                    var e;
                    return E(this.isContainer)
                        ? this.isDefaultContainer() ||
                              this.isMarkContainer() ||
                              (Je.isParentOfLeaf(this.node) &&
                                  (!!(null === (e = this.node.innerText) || void 0 === e ? void 0 : e.trim().length) ||
                                      (function (e) {
                                          var t = e.attributes;
                                          if (t.length > 0)
                                              for (var n = 0; n < t.length; n++) {
                                                  var i = t[n].value;
                                                  if (i && 'false' !== i) return !0;
                                              }
                                          return !1;
                                      })(this.node))) ||
                              'select' === this.name
                        : !!this.isContainer;
                }),
                (e.prototype.isDefaultContainer = function () {
                    return -1 !== ze.SUPPORTED_CONTAINER_TAGS.indexOf(this.tagName) || Je.clickableInput(this.node);
                }),
                (e.prototype.isMarkContainer = function () {
                    return this.node.hasAttribute('data-growing-container') || this.node.hasAttribute('growing-container');
                }),
                (e.prototype.isBigBlank = function () {
                    var e,
                        t,
                        n = null !== (t = null === (e = this.node.innerText) || void 0 === e ? void 0 : e.trim().length) && void 0 !== t ? t : 0,
                        i = this.rect,
                        r = i.width,
                        o = i.height,
                        a = this.devicesInfo,
                        s = a.winWidth,
                        u = a.winHeight;
                    return !n && (r > s >> 1 || o > u >> 1);
                }),
                (e.prototype.hasBackgroundImage = function () {
                    var e = this.computedStyle().backgroundImage;
                    return !!e && 'none' !== e && e.length > 0;
                }),
                (e.prototype.zLevel = function () {
                    var e = this.computedStyle(),
                        t = e.zIndex;
                    if ('auto' !== t) return Number(t || '0') + this.parentNodeDesc.zLevel;
                    switch (e.position) {
                        case 'relative':
                            return this.parentNodeDesc.zLevel + 2;
                        case 'sticky':
                            return this.parentNodeDesc.zLevel + 3;
                        case 'absolute':
                            return this.parentNodeDesc.zLevel + 4;
                        case 'fixed':
                            return this.parentNodeDesc.zLevel + 5;
                        default:
                            return this.parentNodeDesc.zLevel + 1;
                    }
                }),
                (e.prototype.computeWindowRect = function () {
                    if (this.rect) return this.rect;
                    var e = this.node.getBoundingClientRect(),
                        t = e.top,
                        n = e.bottom,
                        i = e.left,
                        r = e.right - i,
                        o = n - t;
                    return (
                        0 > t ? (o = t + o) : t + o > this.devicesInfo.winHeight && (o = this.devicesInfo.winHeight - t),
                        0 > i ? (r = i + r) : i + r > this.devicesInfo.winWidth && (r = this.devicesInfo.winWidth - i),
                        (this.rect = { top: t, left: i, width: r, height: o }),
                        this.rect
                    );
                }),
                (e.prototype.computedStyle = function () {
                    return window.getComputedStyle(this.node);
                }),
                (e.prototype.getDeviceRect = function (e) {
                    var t = this.devicesInfo,
                        n = t.scale,
                        i = t.webviewTop,
                        r = t.webviewLeft;
                    return { top: e.top * n + i, left: e.left * n + r, width: e.width * n, height: e.height * n };
                }),
                e
            );
        })(),
        zt = ['DOMContentLoaded', 'onreadystatechange'],
        Jt = ['scroll', 'resize', 'load', 'beforeunload', 'popstate', 'hashchange', 'pagehide', 'unload'],
        Qt = (function () {
            function e(e) {
                (this.growingIO = e), this.addDomChangeListener();
            }
            return (
                (e.prototype.getDomTree = function (e, t, n, i, r, o) {
                    var a = (function (e, t, n, i, r) {
                            var o = document.documentElement.clientWidth;
                            return {
                                winWidth: o,
                                winHeight: document.documentElement.clientHeight,
                                scale: n / o,
                                webviewTop: t,
                                webviewLeft: e,
                                webviewWidth: n,
                                webviewHeight: i,
                                webviewZLevel: r,
                            };
                        })(e, t, n, i, r),
                        s = this.getElementsByParent(o || document.body, { isContainer: !1, zLevel: 0 }, a),
                        u = this.growingIO.dataStore.currentPage;
                    return { page: { domain: u.domain, path: u.path, query: u.query, title: u.title }, elements: s };
                }),
                (e.prototype.getElementsByParent = function (e, t, n) {
                    var i = this,
                        r = [];
                    return (
                        [].slice
                            .call(e.childNodes, 0)
                            .filter(function (e) {
                                return 1 === e.nodeType;
                            })
                            .forEach(function (e) {
                                var o = new Xt(e, t, n);
                                if (o.cssVisible() && !o.isIgnore) {
                                    switch (o.viewportStatus()) {
                                        case xt.INNER_SHOW:
                                            o.isCircleable() && r.push(o.info());
                                            break;
                                        case xt.INNER_COVERED:
                                            o.isDefaultContainer() && r.push(o.info());
                                    }
                                    o.isSimpleContainer() || [].push.apply(r, i.getElementsByParent(e, o.desc(), n));
                                }
                            }),
                        r
                    );
                }),
                (e.prototype.addDomChangeListener = function () {
                    var e,
                        t = function (t) {
                            return (
                                void 0 === t && (t = ''),
                                function () {
                                    var n;
                                    'beforeunload' === t && e && e.disconnect(),
                                        null === (n = window.GrowingWebViewJavascriptBridge) || void 0 === n || n.onDomChanged();
                                }
                            );
                        };
                    (e = new MutationObserver(t('mutation'))).observe(document.body, {
                        attributes: !0,
                        characterData: !0,
                        childList: !0,
                        subtree: !0,
                    }),
                        zt.forEach(function (e) {
                            re(document, e, t(e));
                        }),
                        Jt.forEach(function (e) {
                            re(window, e, t(e));
                        });
                }),
                e
            );
        })(),
        $t = (function () {
            function e(t) {
                var n,
                    i = this;
                (this.growingIO = t),
                    null === (n = this.growingIO.emitter) ||
                        void 0 === n ||
                        n.on(xe, function () {
                            if (window.GrowingWebViewJavascriptBridge) {
                                var t = i;
                                window.GrowingWebViewJavascriptBridge.getDomTree = function () {
                                    if (arguments.length >= 4)
                                        return e.bindGetDomTree(t.growingIO), e.domHelper.getDomTree.apply(e.domHelper, arguments);
                                };
                            }
                        });
            }
            return (
                (e.bindGetDomTree = function (e) {
                    this.domHelper ||
                        ((this.domHelper = new Qt(e)),
                        (window.GrowingWebViewJavascriptBridge.getDomTree = this.domHelper.getDomTree.bind(this.domHelper)));
                }),
                e
            );
        })(),
        Zt = { name: 'gioHybridCircle', method: $t },
        Yt = {
            name: 'gioImpressionTracking',
            method: function (e) {
                var t,
                    n = this;
                (this.growingIO = e),
                    (this.documentReady = !1),
                    (this.main = function (e) {
                        'listener' === e
                            ? ((n.documentReady = !0), n.growingIO.gioSDKInitialized && n.initMutationObserver())
                            : 'emitter' === e && n.documentReady && n.initMutationObserver();
                    }),
                    (this.initIntersectionObserver = function () {
                        n.intersectionObserver = new IntersectionObserver(function (e) {
                            Z(e) ||
                                e.map(function (e) {
                                    var t = e.target.dataset;
                                    if (e.intersectionRatio > 0) {
                                        var i = n.getImpressionProperties(t),
                                            r = i.eventId,
                                            o = i.properties,
                                            a = i.items,
                                            s = t.id;
                                        if (s) {
                                            if ('once' === t.gioImpType && X(n.sentImps, s)) return;
                                            n.sentImps[s] = { eventId: r, properties: o, items: a };
                                        }
                                        r && n.growingIO.track(r, o, a);
                                    }
                                });
                        });
                    }),
                    (this.initMutationObserver = function () {
                        if (n.mutationObserver) return !1;
                        var e = document.querySelectorAll('[data-gio-imp-track]');
                        j(e).map(function (e) {
                            var t;
                            null === (t = n.intersectionObserver) || void 0 === t || t.observe(e);
                        }),
                            (n.mutationObserver = new MutationObserver(function (e) {
                                return e.map(function (e) {
                                    var t;
                                    if ('attributes' === e.type && e.target.dataset.gioImpTrack)
                                        return null === (t = n.intersectionObserver) || void 0 === t ? void 0 : t.observe(e.target);
                                });
                            })),
                            n.mutationObserver.observe(document.body, {
                                attributes: !0,
                                childList: !0,
                                subtree: !0,
                                attributeOldValue: !0,
                                attributeFilter: ['data-gio-imp-track', 'data-gio-imp-attrs', 'data-gio-imp-items', /^data-gio-track-[a-z]+$/i],
                            });
                    }),
                    (this.getImpressionProperties = function (e) {
                        var t = { eventId: void 0, properties: {} };
                        if (!(null == e ? void 0 : e.gioImpTrack)) return t;
                        if (((t.eventId = e.gioImpTrack), X(e, 'gioImpAttrs')))
                            (t.properties = ne(function () {
                                return N(e.gioImpAttrs) ? e.gioImpAttrs : JSON.parse(e.gioImpAttrs);
                            })),
                                (t.items = ne(function () {
                                    return N(e.gioImpItems) ? e.gioImpItems : JSON.parse(e.gioImpItems);
                                }));
                        else {
                            var n = /^gioTrack(.+)/;
                            for (var i in e) {
                                var r = void 0,
                                    o = i.match(n);
                                o && 'track' !== (r = K(o[1])) && (t.properties[r] = e[i]);
                            }
                        }
                        return (
                            (t.properties = ie(t.properties)),
                            (t.items = ie(t.items)),
                            (/^\w+$/.test(t.eventId) && !Number.isInteger(Number(D(t.eventId.split(''))))) || ((t.eventId = null), (t = {})),
                            t
                        );
                    }),
                    (this.sentImps = {}),
                    window.ActiveXObject ||
                    'ActiveXObject' in window ||
                    (navigator.userAgent.indexOf('compatible') > -1 && navigator.userAgent.indexOf('MSIE') > -1) ||
                    (navigator.userAgent.indexOf('Trident') > -1 && navigator.userAgent.indexOf('rv:11.0') > -1)
                        ? te('IE浏览器不支持半自动埋点，impressionTracking已自动关闭！', 'warn')
                        : (this.initIntersectionObserver(),
                          re(
                              document,
                              'readystatechange',
                              function () {
                                  H(['interactive', 'complete'], document.readyState) && n.main('listener');
                              },
                              { once: !0 },
                          ),
                          null === (t = this.growingIO.emitter) ||
                              void 0 === t ||
                              t.on(xe, function () {
                                  return n.main('emitter');
                              }),
                          re(window, 'unload', function () {
                              var e, t;
                              null === (e = n.intersectionObserver) || void 0 === e || e.disconnect(),
                                  null === (t = n.mutationObserver) || void 0 === t || t.disconnect();
                          }));
            },
        },
        en = {
            name: 'gioLimiting',
            method: function (e) {
                var t = this;
                (this.growingIO = e),
                    (this.requestURL = ''),
                    (this.status = '0'),
                    (this.limitObject = {}),
                    (this.defaulFrequency = '300'),
                    (this.frequency = ''),
                    (this.timer = null),
                    (this.getLimitData = function () {
                        t.generateURL();
                        var e = new XMLHttpRequest();
                        (e.timeout = 5e3),
                            e.open('POST', t.requestURL, !0),
                            e.setRequestHeader('Content-Type', 'application/json;charset=UTF-8'),
                            (e.onreadystatechange = function () {
                                var t = this;
                                if (4 === e.readyState)
                                    try {
                                        var n;
                                        if (200 !== e.status) throw Error('HTTP '.concat(e.status));
                                        '0' === (n = JSON.parse(e.responseText)).result &&
                                            ((this.status = n.status || '0'),
                                            (this.frequency = n.frequency || this.defaultFrequency),
                                            (this.limitObject = n.type || {}));
                                    } catch (e) {
                                        te('请求限流配置失败！', 'error');
                                    } finally {
                                        try {
                                            if (!this.frequency || 0 >= parseInt(this.frequency)) return;
                                            this.timer && clearTimeout(this.timer),
                                                (this.timer = setTimeout(function () {
                                                    t.getLimitData();
                                                }, 1e3 * parseInt(this.frequency)));
                                        } catch (e) {
                                            te('限流定时器异常！', 'error');
                                        }
                                    }
                            }.bind(t)),
                            (e.ontimeout = function () {
                                te('请求超时！', 'error');
                                try {
                                    if (!t.frequency || 0 >= parseInt(t.frequency)) return;
                                    t.timer && clearTimeout(t.timer),
                                        (t.timer = setTimeout(function () {
                                            t.getLimitData();
                                        }, 1e3 * parseInt(t.frequency)));
                                } catch (e) {
                                    te('限流定时器异常！', 'error');
                                }
                            }),
                            (e.onerror = function () {
                                te('请求限流配置失败！', 'error');
                                try {
                                    if (!t.frequency || 0 >= parseInt(t.frequency)) return;
                                    t.timer && clearTimeout(t.timer),
                                        (t.timer = setTimeout(function () {
                                            t.getLimitData();
                                        }, 1e3 * parseInt(t.frequency)));
                                } catch (e) {
                                    te('限流定时器异常！', 'error');
                                }
                            }),
                            e && e.send && e.send(JSON.stringify({}));
                    }),
                    (this.canUploadData = function (e) {
                        switch (t.status) {
                            case '0':
                            default:
                                return !0;
                            case '1':
                                var n = !0;
                                try {
                                    for (var i in t.limitObject)
                                        if ({}.hasOwnProperty.call(t.limitObject, i)) {
                                            var r = e[i];
                                            if (!r) continue;
                                            if (!(n = !t.limitObject[i].includes(r))) break;
                                        }
                                } catch (e) {
                                    te('限流判断异常！', 'error');
                                }
                                return n;
                            case '2':
                                return !1;
                        }
                    }),
                    (this.generateURL = function () {
                        if (!t.requestURL) {
                            var e = t.growingIO.vdsConfig,
                                n = e.scheme,
                                i = e.host,
                                r = void 0 === i ? '' : i,
                                o = e.projectId;
                            n && F(n, 'http') ? V(B(n), '://') || (n = ''.concat(n, '://')) : (n = 'https://'),
                                (r = r.replace('http://', '').replace('https://', '')),
                                (t.requestURL = ''.concat(n).concat(r, '/v3/projects/').concat(o, '/query'));
                        }
                    }),
                    this.growingIO.emitter.on('SDK_INITIALIZED', this.getLimitData);
            },
        },
        tn = function (e) {
            var t = this;
            (this.growingIO = e),
                (this.listenerSet = !1),
                (this.setListeners = function () {
                    t.listenerSet ||
                        (window.addEventListener('unhandledrejection', t.handleError, !0), window.addEventListener('error', t.handleError, !0)),
                        (t.listenerSet = !0);
                }),
                (this.handleError = function (e) {
                    e.reason
                        ? t.errorParse(e.reason.stack, e.reason.message, e.eventTime)
                        : e.error
                        ? t.errorParse(e.error.stack, e.error.message, e.eventTime)
                        : e.target &&
                          t.buildErrorEvent(
                              {
                                  error_type: 'Resource loading error',
                                  error_content: 'at '.concat(e.target.href || e.target.src || e.target.currentSrc),
                              },
                              e.eventTime,
                          );
                }),
                (this.errorParse = function (e, n, i) {
                    var r,
                        o,
                        a,
                        s = b(e) && e.length ? e.split('\n') : [],
                        u = {
                            error_type: n || s[0],
                            error_content: pe()
                                ? (null !== (r = s[0]) && void 0 !== r ? r : '').trim() || (null !== (o = s[1]) && void 0 !== o ? o : '').trim()
                                : (null !== (a = s[1]) && void 0 !== a ? a : '').trim(),
                        };
                    t.buildErrorEvent(u, i);
                }),
                (this.destroy = function () {
                    window.removeEventListener('unhandledrejection', t.handleError), window.removeEventListener('error', t.handleError);
                }),
                (this.buildErrorEvent = function (e, n) {
                    var i;
                    null === (i = t.growingIO.plugins.gioPerformance) || void 0 === i || i.buildPerfEvent('apm_system_error', e, n);
                }),
                this.setListeners(),
                window.gdp.ef &&
                    (window.removeEventListener('unhandledrejection', window.gdp.ef),
                    window.removeEventListener('error', window.gdp.ef),
                    (window.gdp.ef = void 0)),
                !Z(window.gdp.e) && L(window.gdp.e) && (window.gdp.e.forEach(this.handleError), (window.gdp.e = void 0));
        },
        nn = -1,
        rn = function (e) {
            addEventListener(
                'pageshow',
                function (t) {
                    t.persisted && ((nn = t.timeStamp), e(t));
                },
                !0,
            );
        },
        on = function () {
            return window.performance && performance.getEntriesByType && performance.getEntriesByType('navigation')[0];
        },
        an = function () {
            var e = on();
            return (e && e.activationStart) || 0;
        },
        sn = function (e, t) {
            var n = on(),
                i = 'navigate';
            return (
                0 > nn
                    ? n &&
                      (document.prerendering || an() > 0
                          ? (i = 'prerender')
                          : document.wasDiscarded
                          ? (i = 'restore')
                          : n.type && (i = n.type.replace(/_/g, '-')))
                    : (i = 'back-forward-cache'),
                {
                    name: e,
                    value: void 0 === t ? -1 : t,
                    rating: 'good',
                    delta: 0,
                    entries: [],
                    id: 'v3-'.concat(Date.now(), '-').concat(Math.floor(8999999999999 * Math.random()) + 1e12),
                    navigationType: i,
                }
            );
        },
        un = function (e, t, n) {
            try {
                if (PerformanceObserver.supportedEntryTypes.includes(e)) {
                    var i = new PerformanceObserver(function (e) {
                        Promise.resolve().then(function () {
                            t(e.getEntries());
                        });
                    });
                    return i.observe(Object.assign({ type: e, buffered: !0 }, n || {})), i;
                }
            } catch (e) {}
        },
        cn = function (e, t, n, i) {
            var r, o;
            return function (a) {
                t.value >= 0 &&
                    (a || i) &&
                    ((o = t.value - (r || 0)) || void 0 === r) &&
                    ((r = t.value),
                    (t.delta = o),
                    (t.rating = (function (e, t) {
                        return e > t[1] ? 'poor' : e > t[0] ? 'needs-improvement' : 'good';
                    })(t.value, n)),
                    e(t));
            };
        },
        dn = function (e) {
            requestAnimationFrame(function () {
                return requestAnimationFrame(function () {
                    return e();
                });
            });
        },
        ln = -1,
        gn = function () {
            return 'hidden' !== document.visibilityState || document.prerendering ? 1 / 0 : 0;
        },
        fn = function (e) {
            'hidden' === document.visibilityState && ln > -1 && ((ln = 'visibilitychange' === e.type ? e.timeStamp : 0), pn());
        },
        hn = function () {
            addEventListener('visibilitychange', fn, !0), addEventListener('prerenderingchange', fn, !0);
        },
        pn = function () {
            removeEventListener('visibilitychange', fn, !0), removeEventListener('prerenderingchange', fn, !0);
        },
        vn = function () {
            return (
                0 > ln &&
                    ((ln = gn()),
                    hn(),
                    rn(function () {
                        setTimeout(function () {
                            (ln = gn()), hn();
                        }, 0);
                    })),
                {
                    get firstHiddenTime() {
                        return ln;
                    },
                }
            );
        },
        mn = function (e) {
            document.prerendering
                ? addEventListener(
                      'prerenderingchange',
                      function () {
                          return e();
                      },
                      !0,
                  )
                : e();
        },
        In = [1800, 3e3],
        wn = [2500, 4e3],
        yn = {},
        _n = [800, 1800],
        En = function e(t) {
            document.prerendering
                ? mn(function () {
                      return e(t);
                  })
                : 'complete' !== document.readyState
                ? addEventListener(
                      'load',
                      function () {
                          return e(t);
                      },
                      !0,
                  )
                : setTimeout(t, 0);
        },
        bn = function (e, t) {
            t = t || {};
            var n = sn('TTFB'),
                i = cn(e, n, _n, t.reportAllChanges);
            En(function () {
                var r = on();
                if (r) {
                    var o = r.responseStart;
                    if (0 >= o || o > performance.now()) return;
                    (n.value = Math.max(o - an(), 0)),
                        (n.entries = [r]),
                        i(!0),
                        rn(function () {
                            (n = sn('TTFB', 0)), (i = cn(e, n, _n, t.reportAllChanges))(!0);
                        });
                }
            });
        },
        On = { FCP: 'first_contentful_paint_duration', LCP: 'largest_contentful_paint_duration', TTFB: 'first_byte_duration' },
        Tn = 'gioPerformanceInfo';
    function Sn(e, t) {
        var n = JSON.parse(localStorage.getItem(Tn) || '{}');
        e && (n[e] = t), localStorage.setItem(Tn, JSON.stringify(n));
    }
    function Nn(e) {
        void 0 === e && (e = '');
        var t = JSON.parse(localStorage.getItem(Tn) || '{}');
        if (e) return t[e] || '';
    }
    'waiting' === Nn('gioPageStatus')
        ? Sn('gioPageStatus', 'fail')
        : (Sn('gioPageStatus', 'waiting'), Sn('gioPageParams', { href: window.location.href, time: Date.now() }));
    var Cn = (function () {
        function e(e, t) {
            void 0 === t && (t = {});
            var i,
                r,
                o = this;
            (this.growingIO = e),
                (this.options = t),
                (this.performance = {}),
                (this.timer = null),
                (this.timerDuring = 3e3),
                (this.timerKey = 'gioTimerPerformance'),
                (this.setPerformanceData = function (e) {
                    o.vitalsData[e.name].push(e);
                }),
                (this.getLaunchTime = function () {
                    var e = window.performance.timing;
                    return e.loadEventEnd - e.navigationStart;
                }),
                (this.getInteractiveTime = function () {
                    var e = window.performance.timing;
                    return e.domContentLoadedEventEnd - e.navigationStart;
                }),
                (this.getPageStatus = function () {
                    var e, t;
                    'fail' === Nn('gioPageStatus') &&
                        (null === (e = o.growingIO.plugins.gioPerformance) ||
                            void 0 === e ||
                            e.buildPerfEvent('apm_web_loadFail', n({}, Nn('gioPageParams'))));
                    var i = JSON.parse(localStorage.getItem(o.timerKey));
                    i &&
                        (null === (t = o.growingIO.plugins.gioPerformance) || void 0 === t || t.buildPerfEvent('apm_web_stay_time', n({}, i)),
                        setTimeout(function () {
                            localStorage.removeItem(o.timerKey);
                        }, 10)),
                        setTimeout(function () {
                            o.gioStorageSave('gioPageStatus', 'success');
                        }, 10);
                }),
                (this.clearPageStatus = function () {
                    var e;
                    performance.mark('end'), performance.measure('myMeasurement', 'start', 'end');
                    var t = performance.getEntriesByName('myMeasurement', 'measure'),
                        n = t[t.length - 1];
                    n &&
                        (null === (e = o.growingIO.plugins.gioPerformance) ||
                            void 0 === e ||
                            e.buildPerfEvent('apm_web_stay_time', {
                                durationTime: Number(n.duration),
                                leaveTime: new Date().toLocaleString(),
                                enterTime: new Date(Date.now() - Number(n.duration)).toLocaleString(),
                            })),
                        setTimeout(function () {
                            localStorage.removeItem(o.timerKey);
                        }, 0),
                        clearInterval(o.timer),
                        (o.timer = null);
                }),
                (this.setInterval = function () {
                    o.timer = setInterval(function () {
                        performance.mark('end'), performance.measure('myMeasurement', 'start', 'end');
                        var e = performance.getEntriesByName('myMeasurement', 'measure'),
                            t = e[e.length - 1];
                        t &&
                            localStorage.setItem(
                                o.timerKey,
                                JSON.stringify({
                                    durationTime: Number(t.duration),
                                    leaveTime: new Date().toLocaleString(),
                                    enterTime: new Date(Date.now() - t.duration).toLocaleString(),
                                }),
                            );
                    }, o.timerDuring);
                }),
                (this.generatePerfData = function () {
                    o.getPageStatus(),
                        o.watchPage(),
                        performance.mark('start'),
                        o.setInterval(),
                        window.setTimeout(function () {
                            var e = { page_launch_duration: o.getLaunchTime(), interactive_duration: o.getInteractiveTime() };
                            J(o.vitalsData, function (t, n) {
                                Z(t) || (e[On[n]] = x(R(t).value, 0));
                            }),
                                Q(e, o.performance) || (o.buildMonitorEvent(e), (o.performance = e));
                        }, 1e3);
                }),
                (this.destroy = function () {
                    window.removeEventListener('load', o.generatePerfData), window.removeEventListener('beforeunload', o.clearPageStatus);
                }),
                (this.buildMonitorEvent = function (e) {
                    var t, n, i;
                    e.first_contentful_paint_duration > 3e3 &&
                        (null === (t = o.growingIO.plugins.gioPerformance) || void 0 === t || t.buildPerfEvent('apm_web_launch', e)),
                        e.first_contentful_paint_duration > 1e4 &&
                            (null === (n = o.growingIO.plugins.gioPerformance) || void 0 === n || n.buildPerfEvent('apm_web_launch_time_10', e)),
                        e.first_contentful_paint_duration > 2e4 &&
                            (null === (i = o.growingIO.plugins.gioPerformance) || void 0 === i || i.buildPerfEvent('apm_web_launch_time_20', e));
                }),
                (this.vitalsData = { FCP: [], FID: [], INP: [], LCP: [], TTFB: [] }),
                (i = this.setPerformanceData),
                (r = r || {}),
                mn(function () {
                    var e,
                        t = vn(),
                        n = sn('FCP'),
                        o = un('paint', function (i) {
                            i.forEach(function (i) {
                                'first-contentful-paint' === i.name &&
                                    (o.disconnect(),
                                    i.startTime < t.firstHiddenTime && ((n.value = Math.max(i.startTime - an(), 0)), n.entries.push(i), e(!0)));
                            });
                        });
                    o &&
                        ((e = cn(i, n, In, r.reportAllChanges)),
                        rn(function (t) {
                            (n = sn('FCP')),
                                (e = cn(i, n, In, r.reportAllChanges)),
                                dn(function () {
                                    (n.value = performance.now() - t.timeStamp), e(!0);
                                });
                        }));
                }),
                (function (e, t) {
                    (t = t || {}),
                        mn(function () {
                            var n,
                                i = vn(),
                                r = sn('LCP'),
                                o = function (e) {
                                    var t = e[e.length - 1];
                                    t && t.startTime < i.firstHiddenTime && ((r.value = Math.max(t.startTime - an(), 0)), (r.entries = [t]), n());
                                },
                                a = un('largest-contentful-paint', o);
                            if (a) {
                                n = cn(e, r, wn, t.reportAllChanges);
                                var s = (function (e) {
                                    var t = !1;
                                    return function (n) {
                                        t || (e(), (t = !0));
                                    };
                                })(function () {
                                    yn[r.id] || (o(a.takeRecords()), a.disconnect(), (yn[r.id] = !0), n(!0));
                                });
                                ['keydown', 'click'].forEach(function (e) {
                                    addEventListener(
                                        e,
                                        function () {
                                            return setTimeout(s, 0);
                                        },
                                        !0,
                                    );
                                }),
                                    (function (e) {
                                        var t = function (t) {
                                            ('pagehide' !== t.type && 'hidden' !== document.visibilityState) || e(t);
                                        };
                                        addEventListener('visibilitychange', t, !0), addEventListener('pagehide', t, !0);
                                    })(s),
                                    rn(function (i) {
                                        (r = sn('LCP')),
                                            (n = cn(e, r, wn, t.reportAllChanges)),
                                            dn(function () {
                                                (r.value = performance.now() - i.timeStamp), (yn[r.id] = !0), n(!0);
                                            });
                                    });
                            }
                        });
                })(this.setPerformanceData, { reportAllChanges: !0 }),
                bn(this.setPerformanceData),
                window.addEventListener('load', this.generatePerfData),
                window.addEventListener('beforeunload', function () {
                    o.clearPageStatus();
                });
        }
        return (
            (e.prototype.watchPage = function () {
                this.watchDom(), this.getPageLoadType();
            }),
            (e.prototype.getPageLoadType = function () {
                performance.getEntriesByType('navigation')[0].type;
            }),
            (e.prototype.sendPageError = function () {
                var e;
                null === (e = this.growingIO.plugins.gioPerformance) || void 0 === e || e.buildPerfEvent('apm_web_page_destroy_error');
            }),
            (e.prototype.watchDom = function () {
                var e = this,
                    t = document.querySelector('html');
                new MutationObserver(function (t, n) {
                    document.querySelector('body') || (e.sendPageError(), n.disconnect());
                }).observe(t, { attributes: !0, childList: !0, subtree: !0 });
            }),
            (e.prototype.getScriptUrl = function () {
                for (var e = document.querySelectorAll('script[src]'), t = [], n = 0; n < e.length; n += 1) {
                    var i = e[n];
                    i.src.includes('/sw.js') && t.push(i);
                }
                if (t[0]) return t[0].src;
            }),
            (e.prototype.gioStorageSave = function (e, t) {
                return Sn(e, t);
            }),
            (e.prototype.gioStorageGet = function (e) {
                return void 0 === e && (e = ''), Nn(e);
            }),
            (e.prototype.gioStorageRemove = function (e) {
                return (function (e) {
                    var t = JSON.parse(localStorage.getItem(Tn) || '{}');
                    if (e) return (t[e] = void 0);
                    localStorage.setItem(Tn, JSON.stringify(t));
                })(e);
            }),
            e
        );
    })();
    function Pn(e, t, n, i) {
        if ((void 0 === i && (i = !1), !E(e) && (X(e, t) || i))) {
            var r = n(e[t]);
            'function' == typeof r && (e[t] = r);
        }
    }
    var Ln,
        An,
        xn = function (e, t) {
            var i = this;
            (this.growingIO = e),
                (this.options = t),
                (this.initOptions = function () {
                    var e;
                    N(i.options.network) &&
                        (null === (e = i.options.network) || void 0 === e ? void 0 : e.exclude) &&
                        (i.excludeRegExp = i.options.network.exclude);
                }),
                (this.verifyUrl = function (e) {
                    if (e.indexOf(i.growingIO.uploader.requestURL) > -1) return !0;
                    if (L(i.excludeRegExp)) {
                        var t = U(
                            i.excludeRegExp.map(function (t) {
                                return C(t) ? t.test(e) : b(t) ? e.indexOf(t) > -1 : void 0;
                            }),
                        );
                        return !Z(t);
                    }
                    return b(i.excludeRegExp) ? e.indexOf(i.excludeRegExp) > -1 : !!C(i.excludeRegExp) && i.excludeRegExp.test(e);
                }),
                (this.getTimestamp = function () {
                    return window.performance ? window.performance.now() : Date.now();
                }),
                (this.hookXHR = function () {
                    var e = i;
                    i.originXHR = window.XMLHttpRequest;
                    var t = XMLHttpRequest.prototype,
                        r = {};
                    Pn(t, 'open', function (t) {
                        return function () {
                            for (var n = [], i = 0; arguments.length > i; i++) n[i] = arguments[i];
                            (this.gio_XHR_id = fe()),
                                e.verifyUrl(n[1]) || (r[this.gio_XHR_id] = { type: 'XHR', method: n[0], url: n[1] }),
                                t.apply(this, n);
                        };
                    }),
                        Pn(t, 'send', function (t) {
                            return function () {
                                for (var i = this, o = [], a = 0; arguments.length > a; a++) o[a] = arguments[a];
                                this.addEventListener('loadend', function (t) {
                                    r[i.gio_XHR_id] &&
                                        ((r[i.gio_XHR_id] = n(n({}, r[i.gio_XHR_id]), {
                                            duration: (t.timeStamp || e.getTimestamp()) - r[i.gio_XHR_id].start,
                                            status: i.status,
                                        })),
                                        e.buildNetworkEvent(r[i.gio_XHR_id]),
                                        $(r, i.gio_XHR_id));
                                }),
                                    this.addEventListener('error', function () {
                                        e.buildErrorEvent({ error_title: 'XMLHttpRequest Error', error_content: i.status });
                                    }),
                                    r[this.gio_XHR_id] && (r[this.gio_XHR_id].start = e.getTimestamp()),
                                    t.apply(this, o);
                            };
                        });
                }),
                (this.hookFetch = function () {
                    var e = i;
                    (i.originFetch = window.fetch),
                        Pn(window, 'fetch', function (t) {
                            return function (i, r) {
                                var o;
                                return (
                                    void 0 === r && (r = {}),
                                    e.verifyUrl(i) || (o = { type: 'Fetch', method: r.method || 'GET', url: i, start: e.getTimestamp() }),
                                    t.call(window, i, r).then(
                                        function (t) {
                                            (o = n(n({}, o), { duration: e.getTimestamp() - o.start, status: t.status })), e.buildNetworkEvent(o);
                                        },
                                        function (t) {
                                            var n = t.stack.split('\n');
                                            e.buildErrorEvent({ error_title: n[0] || B(t) || 'Fetch Request Error', error_content: o.url });
                                        },
                                    )
                                );
                            };
                        });
                }),
                (this.buildErrorEvent = function (e) {
                    if (i.options.exception) {
                        var t = i.growingIO.dataStore,
                            r = t.eventContextBuilder,
                            o = t.eventConverter,
                            a = t.currentPage;
                        o(n({ eventType: 'CUSTOM', pageShowTimestamp: a.time, eventName: 'Error', attributes: e }, r()));
                    }
                }),
                (this.destroy = function () {
                    (window.XMLHttpRequest = i.originXHR), (window.fetch = i.originFetch);
                }),
                (this.buildNetworkEvent = function (e) {
                    var n;
                    if (!1 !== t.network) {
                        var r = e.duration,
                            o = e.url,
                            a = e.method,
                            s = e.status;
                        null === (n = i.growingIO.plugins.gioPerformance) ||
                            void 0 === n ||
                            n.buildPerfEvent('apm_network_request', { response_duration: r, request_address: o, request_method: a, http_code: s });
                    }
                }),
                this.initOptions(),
                this.hookXHR(),
                this.hookFetch(),
                window.performance || te('当前浏览器无法支持性能相关API，网络监测数据可能存在偏差!', 'warn');
        },
        Dn = {
            install: function (e) {
                if (e && e.config) {
                    var t = function (t, n, i) {
                        Rn.call(this, t, n, i, e);
                    };
                    if (P(e.config.errorHandler)) {
                        var n = e.config.errorHandler;
                        e.config.errorHandler = function () {
                            var e = n.apply(this, arguments);
                            return t(arguments[0], arguments[1], arguments[2]), e;
                        };
                    } else e.config.errorHandler = t;
                }
            },
        },
        Rn = function (e, t, i, r) {
            var o = { message: ''.concat(e.message, '(').concat(i, ')'), name: e.name, stack: e.stack || [] };
            if (null == r ? void 0 : r.version)
                switch (Number.parseInt(D(M(null == r ? void 0 : r.version, '.')), 10)) {
                    case 2:
                        o = n(n({}, o), kn(t));
                        break;
                    case 3:
                        o = n(n({}, o), Un(t));
                        break;
                    default:
                        return;
                }
            (o = n(n({}, o), qn(o.stack))),
                (window.gdp || window.gio || function () {})('track', 'apm_system_error', {
                    error_type: ''.concat(o.name, ': ').concat(o.message),
                    error_content: 'at '.concat(o.functionName, ' (').concat(o.componentName, ')'),
                });
        },
        kn = function (e) {
            var t = '';
            if (e.$root === e) t = 'root';
            else {
                var n = e._isVue ? (e.$options && e.$options.name) || (e.$options && e.$options._componentTag) : e.name;
                t =
                    (n ? 'component <' + n + '>' : 'anonymous component') +
                    (e._isVue && e.$options && e.$options.__file ? ' at ' + (e.$options && e.$options.__file) : '');
            }
            return { componentName: t };
        },
        Un = function (e) {
            var t = '';
            if (e.$root === e) t = 'root';
            else {
                var n = e.$options && e.$options.name;
                t = n ? 'component <' + n + '>' : 'anonymous component';
            }
            return { componentName: t };
        },
        qn = function (e) {
            var t,
                n = e.split('\n');
            return (
                q(n, function (e) {
                    var n = e.match(/at (.*?) \((.*):(\d{1,}):(\d{1,})\)/);
                    if (L(n) && !t) return (t = n[1]), n.length > 0;
                }),
                { title: n[0], functionName: t }
            );
        },
        Gn = {
            name: 'gioPerformance',
            method: function (e) {
                var t,
                    i = this;
                (this.growingIO = e),
                    (this.inited = !1),
                    (this.cacheQueue = []),
                    (this.init = function () {
                        if (!i.inited) {
                            var e = i.growingIO.vdsConfig,
                                t = e.performance,
                                n = e.dataCollect;
                            t.monitor && (i.monitor = new Cn(i.growingIO)),
                                t.exception && (i.exception = new tn(i.growingIO)),
                                (i.network = new xn(i.growingIO, t)),
                                n && i.sendCacheQuene(),
                                (i.inited = !0);
                        }
                    }),
                    (this.sendCacheQuene = function () {
                        Ln.isEmpty(i.cacheQueue) ||
                            (i.cacheQueue.forEach(function (e) {
                                i.buildPerfEvent(e.eventName, e.attributes, e.eventTime);
                            }),
                            (i.cacheQueue = []));
                    }),
                    (this.buildPerfEvent = function (e, t, r) {
                        var o = i.growingIO,
                            a = o.dataStore,
                            s = a.eventContextBuilder,
                            u = a.eventConverter,
                            c = a.currentPage,
                            d = o.vdsConfig;
                        if (o.gioSDKInitialized && d.dataCollect) {
                            Ln.forEach(t, function (e, n) {
                                (Ln.isNaN(e) || Ln.isNil(e)) && (t[n] = 0), (t[n] = Ln.fixed(e, 0));
                            });
                            var l = n({ eventType: 'CUSTOM', pageShowTimestamp: c.time, eventName: e, attributes: t }, s());
                            r && (l.timestamp = r), u(l);
                        } else i.cacheQueue.push({ eventName: e, attributes: t, eventTime: r || +Date.now() });
                    }),
                    (Ln = this.growingIO.utils),
                    this.growingIO.gioSDKInitialized
                        ? this.init()
                        : this.growingIO.emitter.on('SDK_INITIALIZED_COMPLATE', function () {
                              i.init();
                          }),
                    null === (t = this.growingIO.emitter) ||
                        void 0 === t ||
                        t.on('OPTION_CHANGE', function (e) {
                            var t = e.optionName,
                                n = e.optionValue;
                            'dataCollect' === t && !0 === n && i.sendCacheQuene();
                        });
            },
            GioVue: Dn,
            gioReactErrorReport: function (e, t) {
                var n = e.stack.split('\n')[0],
                    i = t.componentStack.split('\n'),
                    r = [];
                i.forEach(function (e) {
                    var t = ''.concat(e, ' ').match(/at (.*?) /);
                    L(t) && t[1] && r.push(t[1]);
                });
                var o = 'at '.concat(k(r.reverse()).join('/'));
                (window.gdp || window.gio || function () {})('track', 'apm_system_error', { error_type: n, error_content: o });
            },
        },
        Hn = (function (e) {
            function n(t) {
                var n = e.call(this, t) || this;
                return (
                    (n.growingIO = t),
                    (n.growingIO.gioSDKFull = !0),
                    (n.pluginsContext = {
                        plugins: {
                            gioCompress: Ue,
                            gioCustomTracking: qe,
                            gioEmbeddedAdapter: We,
                            gioEventAutoTracking: Ht,
                            gioHybridAdapter: Mt,
                            gioHybridCircle: Zt,
                            gioImpressionTracking: Yt,
                            gioLimiting: en,
                            gioPerformance: Gn,
                        },
                    }),
                    n
                );
            }
            return t(n, e), n;
        })(function (e) {
            var t,
                n,
                i,
                r,
                o = this;
            (this.growingIO = e),
                (this.innerPluginInit = function () {
                    var e;
                    z(null === (e = o.pluginsContext) || void 0 === e ? void 0 : e.plugins).forEach(function (e) {
                        var t,
                            n =
                                null !==
                                    (t = ne(function () {
                                        var t;
                                        return null === (t = o.pluginsContext) || void 0 === t ? void 0 : t.plugins[e];
                                    })) && void 0 !== t
                                    ? t
                                    : {},
                            i = n.name,
                            r = n.method,
                            a = q(o.pluginItems, function (e) {
                                return e.name === i;
                            });
                        a || o.pluginItems.push({ name: K(i || e), method: r || function (e) {} });
                    }),
                        Z(o.pluginItems) || o.installAll();
                }),
                (this.install = function (e, t, n) {
                    var i,
                        r,
                        a =
                            t ||
                            q(o.pluginItems, function (t) {
                                return t.name === e;
                            });
                    if ((null === (i = o.growingIO) || void 0 === i ? void 0 : i.plugins)[e])
                        return te('重复加载插件 '.concat(e, ' 或插件重名，已跳过加载!'), 'warn'), !1;
                    if (!a) return te('插件加载失败!不存在名为 '.concat(e, ' 的插件!'), 'error'), !1;
                    try {
                        return (
                            ((null === (r = o.growingIO) || void 0 === r ? void 0 : r.plugins)[e] = new a.method(o.growingIO, n)),
                            'cdp' === o.growingIO.gioEnvironment && t && te('加载插件 '.concat(e), 'info'),
                            !0
                        );
                    } catch (e) {
                        return te('插件加载异常 '.concat(e), 'error'), !1;
                    }
                }),
                (this.installAll = function (e) {
                    (e || o.pluginItems).forEach(function (t) {
                        o.install(t.name, e ? t : void 0, e ? (null == t ? void 0 : t.options) : void 0) &&
                            !q(o.pluginItems, function (e) {
                                return e.name === t.name;
                            }) &&
                            o.pluginItems.push({ name: K(t.name), method: t.method ? t.method : function () {} });
                    });
                }),
                (this.uninstall = function (e) {
                    var t;
                    $(o.pluginItems, e);
                    var n = $(null === (t = o.growingIO) || void 0 === t ? void 0 : t.plugins, e);
                    return n || te('卸载插件 '.concat(e, ' 失败!'), 'error'), n;
                }),
                (this.uninstallAll = function () {
                    o.pluginItems.forEach(function (e) {
                        return o.uninstall(e.name);
                    });
                }),
                (this.lifeError = function (e, t) {
                    return te('插件执行错误 '.concat(e.name, ' ').concat(t), 'error');
                }),
                (this.onComposeBefore = function (e) {
                    o.pluginItems.forEach(function (t) {
                        var n,
                            i = null === (n = o.growingIO.plugins[t.name]) || void 0 === n ? void 0 : n.onComposeBefore;
                        if (i && P(i))
                            try {
                                i(e);
                            } catch (e) {
                                o.lifeError(t, e);
                            }
                    });
                }),
                (this.onComposeAfter = function (e) {
                    o.pluginItems.forEach(function (t) {
                        var n,
                            i = null === (n = o.growingIO.plugins[t.name]) || void 0 === n ? void 0 : n.onComposeAfter;
                        if (i && P(i))
                            try {
                                i(e);
                            } catch (e) {
                                o.lifeError(t, e);
                            }
                    });
                }),
                (this.onSendBefore = function (e) {
                    o.pluginItems.forEach(function (t) {
                        var n,
                            i = null === (n = o.growingIO.plugins[t.name]) || void 0 === n ? void 0 : n.onSendBefore;
                        if (i && P(i))
                            try {
                                i(e);
                            } catch (e) {
                                o.lifeError(t, e);
                            }
                    });
                }),
                (this.onSendAfter = function (e) {
                    o.pluginItems.forEach(function (t) {
                        var n,
                            i = null === (n = o.growingIO.plugins[t.name]) || void 0 === n ? void 0 : n.onSendAfter;
                        if (i && P(i))
                            try {
                                i(e);
                            } catch (e) {
                                o.lifeError(t, e);
                            }
                    });
                }),
                (this.pluginsContext = { plugins: {} }),
                (this.pluginItems = []),
                null === (t = this.growingIO.emitter) || void 0 === t || t.on('onComposeBefore', this.onComposeBefore),
                null === (n = this.growingIO.emitter) || void 0 === n || n.on('onComposeAfter', this.onComposeAfter),
                null === (i = this.growingIO.emitter) || void 0 === i || i.on('onSendBefore', this.onSendBefore),
                null === (r = this.growingIO.emitter) || void 0 === r || r.on('onSendAfter', this.onSendAfter);
        }),
        jn = (function () {
            function e(e) {
                this.growingIO = e;
                var t = this.growingIO.vdsConfig.projectId,
                    n = this.growingIO.storage,
                    i = n.getItem,
                    r = n.setItem,
                    o = n.getKeys,
                    a = n.removeItem;
                (this.getItem = i),
                    (this.setItem = r),
                    (this.getKeys = o),
                    (this.removeItem = a),
                    (this.sIdStorageName = ''.concat(t, '_gdp_session_id')),
                    (this.uidStorageName = 'gdp_user_id_gioenc'),
                    (this.userIdStorageName = ''.concat(t, '_gdp_cs1_gioenc')),
                    (this.userKeyStorageName = ''.concat(t, '_gdp_user_key_gioenc')),
                    (this.gioIdStorageName = ''.concat(t, '_gdp_gio_id_gioenc'));
            }
            return (
                Object.defineProperty(e.prototype, 'sessionId', {
                    get: function () {
                        return this.getItem(this.sIdStorageName) || ((this.sessionId = fe()), this.sessionId);
                    },
                    set: function (e) {
                        var t,
                            n = this;
                        e || (e = fe());
                        var i = this.getItem(this.sIdStorageName) || this.prevSessionId,
                            r = this.growingIO.vdsConfig.sessionExpires,
                            o = void 0 === r ? 1 : r;
                        this.setItem(this.sIdStorageName, e, +Date.now() + 60 * o * 1e3),
                            i !== e &&
                                (this.getKeys()
                                    .filter(function (e) {
                                        return /.+_gdp_session_id_.{36}/.test(e);
                                    })
                                    .forEach(function (e) {
                                        n.removeItem(e);
                                    }),
                                this.setItem(this.growingIO.dataStore.visitStorageName, ''),
                                null === (t = this.growingIO.emitter) || void 0 === t || t.emit(De, { newSessionId: e, oldSessionId: i })),
                            (this.prevSessionId = e);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'uid', {
                    get: function () {
                        return this.getItem(this.uidStorageName) || ((this.uid = fe()), this.uid);
                    },
                    set: function (e) {
                        var t,
                            n = this.getItem(this.uidStorageName) || this.prevUId;
                        this.setItem(this.uidStorageName, e),
                            n !== e && (null === (t = this.growingIO.emitter) || void 0 === t || t.emit('UID_UPDATE', { newUId: e, oldUId: n })),
                            (this.prevUId = e);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'userId', {
                    get: function () {
                        return this.getItem(this.userIdStorageName) || '';
                    },
                    set: function (e) {
                        var t,
                            n,
                            i = this.getItem(this.userIdStorageName) || this.prevUserId;
                        this.setItem(this.userIdStorageName, e),
                            null === (t = this.growingIO.emitter) ||
                                void 0 === t ||
                                t.emit(Re, { newUserId: e, oldUserId: i, userKey: this.userKey }),
                            i !== e &&
                                (null === (n = this.growingIO.emitter) ||
                                    void 0 === n ||
                                    n.emit('USERID_UPDATE', { newUserId: e, oldUserId: i, userKey: this.userKey })),
                            e && (this.gioId = e),
                            (this.prevUserId = e);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'userKey', {
                    get: function () {
                        return this.getItem(this.userKeyStorageName) || '';
                    },
                    set: function (e) {
                        var t,
                            n,
                            i = this.getItem(this.userKeyStorageName) || this.prevUserKey;
                        this.setItem(this.userKeyStorageName, e),
                            null === (t = this.growingIO.emitter) ||
                                void 0 === t ||
                                t.emit(ke, { newUserKey: e, oldUserKey: i, userId: this.userId }),
                            i !== e &&
                                (null === (n = this.growingIO.emitter) ||
                                    void 0 === n ||
                                    n.emit('USERKEY_UPDATE', { newUserKey: e, oldUserKey: i, userId: this.userId })),
                            (this.prevUserKey = e);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'gioId', {
                    get: function () {
                        return this.getItem(this.gioIdStorageName) || '';
                    },
                    set: function (e) {
                        var t,
                            n = this.getItem(this.gioIdStorageName) || this.prevGioId;
                        this.setItem(this.gioIdStorageName, e),
                            n !== e &&
                                (null === (t = this.growingIO.emitter) || void 0 === t || t.emit('GIOID_UPDATE', { newGioId: e, oldGioId: n })),
                            (this.prevGioId = e);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                e
            );
        })(),
        Bn = function (e) {
            var t = this;
            (this.growingIO = e),
                (this.main = function () {
                    var e,
                        i,
                        r = t.growingIO,
                        o = r.sdkVersion,
                        a = r.useEmbeddedInherit,
                        s = r.vdsConfig,
                        u = r.userStore,
                        c = r.dataStore,
                        d = r.trackingId,
                        l = c.currentPage,
                        g = l.path,
                        f = l.query,
                        h = {
                            appVersion: s.version,
                            dataSourceId: s.dataSourceId,
                            deviceId: u.uid,
                            domain: a ? s.appId : window.location.host,
                            gioId: u.gioId,
                            language: navigator.language,
                            path: g,
                            platform: s.platform,
                            query: f,
                            referralPage: (null === (e = c.lastPageEvent) || void 0 === e ? void 0 : e.referralPage) || '',
                            screenHeight: window.screen.height,
                            screenWidth: window.screen.width,
                            sdkVersion: o,
                            sessionId: u.sessionId,
                            timestamp: +Date.now(),
                            title:
                                null !==
                                    (i = ne(function () {
                                        return document.title.slice(0, 255);
                                    })) && void 0 !== i
                                    ? i
                                    : '',
                            userId: u.userId,
                        };
                    if (
                        (s.enableIdMapping && (h.userKey = u.userKey),
                        Z(s.ignoreFields) ||
                            s.ignoreFields.forEach(function (e) {
                                $(h, e);
                            }),
                        a && !Z(t.minpExtraParams))
                    ) {
                        var p = n({}, h);
                        J(n(n({}, h), t.minpExtraParams), function (e, n) {
                            var i;
                            H(s.embeddedIgnore, n)
                                ? ((h[n] = p[n]), 'domain' === n && (h[n] = window.location.host))
                                : (h[n] = null !== (i = t.minpExtraParams[n]) && void 0 !== i ? i : h[n]);
                        });
                    }
                    return (h.trackingId = d), h;
                }),
                (this.minpExtraParams = {});
        },
        Mn = function (e) {
            var t = this;
            (this.growingIO = e),
                (this.parsePage = function () {
                    var e = t.growingIO.vdsConfig.hashtag,
                        n = location.pathname,
                        i = location.search,
                        r = location.hash,
                        o = r.indexOf('?');
                    (t.domain = window.location.host),
                        (t.title = document.title.slice(0, 255)),
                        (t.time = +Date.now()),
                        (t.path = n),
                        (t.query = i),
                        e && (o > -1 ? ((t.path += r.slice(0, o)), (t.query = t.query + '&' + r.slice(o + 1))) : (t.path += r)),
                        t.query && H(['?', '&'], t.query.charAt(0)) && (t.query = t.query.slice(1));
                }),
                (this._getNoHashHref = function () {
                    var e = window.location,
                        t = e.protocol,
                        n = e.host,
                        i = e.pathname,
                        r = e.search;
                    return ''.concat(t, '://').concat(n).concat(i).concat(r);
                }),
                (this.getReferralPage = function () {
                    var e,
                        n,
                        i = t.growingIO.dataStore.lastPageEvent;
                    return (null == i ? void 0 : i.path) === t.path &&
                        (null !== (e = null == i ? void 0 : i.query) && void 0 !== e ? e : '') === (null !== (n = t.query) && void 0 !== n ? n : '')
                        ? null == i
                            ? void 0
                            : i.referralPage
                        : (null == i ? void 0 : i.path)
                        ? t.lastHref
                        : document.referrer;
                }),
                (this.pageListener = function () {
                    var e = t.growingIO.vdsConfig.hashtag,
                        n = window.location.href,
                        i = t.lastHref;
                    e || ((n = t._getNoHashHref()), (i = t.lastNoHashHref)), i !== n && (t.parsePage(), t.buildPageEvent());
                }),
                (this.hookHistory = function () {
                    var e = window.history.pushState,
                        n = window.history.replaceState,
                        i = t;
                    e &&
                        ne(function () {
                            return (window.history.pushState = function () {
                                e.apply(window.history, arguments), setTimeout(i.pageListener);
                            });
                        }),
                        n &&
                            ne(function () {
                                return (window.history.replaceState = function () {
                                    n.apply(window.history, arguments), setTimeout(i.pageListener);
                                });
                            }),
                        re(window, 'popstate', t.pageListener),
                        t.growingIO.vdsConfig.hashtag && re(window, 'hashchange', t.pageListener);
                }),
                (this.buildPageEvent = function (e) {
                    var i = t.growingIO.dataStore;
                    i.lastPageEvent;
                    var r = i.eventContextBuilder,
                        o = i.eventConverter,
                        a = n(n({ eventType: 'PAGE' }, r()), {
                            protocolType: location.protocol.substring(0, location.protocol.length - 1),
                            referralPage: t.getReferralPage(),
                        });
                    Z(e) || (a = n(n({}, a), e)),
                        (a.timestamp = t.time),
                        o(a),
                        (t.lastHref = window.location.href),
                        (t.lastNoHashHref = t._getNoHashHref()),
                        (t.lastLocation = n({}, window.location));
                }),
                (this.title = document.title.slice(0, 255)),
                (this.lastLocation = n({}, window.location));
        },
        Kn = { referralPage: document.referrer },
        Fn = (function () {
            function e(e) {
                var t,
                    i,
                    u,
                    c = this;
                (this.growingIO = e),
                    (this.ALLOW_SETTING = n(n({}, o), 'saas' === this.growingIO.gioEnvironment ? s : a)),
                    (this.allowOptKeys = Object.keys(this.ALLOW_SETTING)),
                    (this.trackTimers = {}),
                    (this.setSequenceIds = function (e, t) {
                        var i = c.growingIO.storage.getItem(c.seqStorageIdName) || {};
                        'gsid' === e ? (i.globalKey = t) : (i = n(n({}, i), t)), c.growingIO.storage.setItem(c.seqStorageIdName, i);
                    }),
                    (this.initOptions = function (e) {
                        var t,
                            i,
                            o,
                            a,
                            s,
                            u,
                            d,
                            l = e.projectId,
                            g = e.dataSourceId,
                            f = e.appId;
                        c.initialDataSourceId = g;
                        var h = {};
                        c.allowOptKeys.forEach(function (t) {
                            var n = c.ALLOW_SETTING[t].type,
                                i = L(n) ? !H(n, Y(e[t])) : Y(e[t]) !== n;
                            'platform' !== t || H(r, e[t]) || (i = !0),
                                i
                                    ? (h[t] = c.ALLOW_SETTING[t].default)
                                    : 'ignoreFields' === t
                                    ? (h.ignoreFields = e.ignoreFields.filter(function (e) {
                                          return H(I, e);
                                      }))
                                    : ((h[t] = e[t]), H(['dataCollect', 'autotrack'], t) && (h[t] || te('已关闭'.concat(v[t]), 'info')));
                        }),
                            (h.sessionExpires = Math.round(h.sessionExpires)),
                            (T(h.sessionExpires) || 1 > h.sessionExpires || h.sessionExpires > 360) && (h.sessionExpires = 30),
                            (h.storageType = h.storageType.toLowerCase()),
                            (h.sendType = h.sendType.toLowerCase()),
                            H(['beacon', 'xhr'], h.sendType) || (h.sendType = 'beacon'),
                            (c.growingIO.vdsConfig = n(n(n({}, null !== (t = window.vds) && void 0 !== t ? t : {}), h), {
                                projectId: l,
                                dataSourceId: g,
                                appId: f,
                                performance: {
                                    monitor: null === (o = null === (i = h.performance) || void 0 === i ? void 0 : i.monitor) || void 0 === o || o,
                                    exception:
                                        null === (s = null === (a = h.performance) || void 0 === a ? void 0 : a.exception) || void 0 === s || s,
                                    network: null !== (d = null === (u = h.performance) || void 0 === u ? void 0 : u.network) && void 0 !== d && d,
                                },
                            })),
                            (window.vds = c.growingIO.vdsConfig),
                            (c.seqStorageIdName = ''.concat(l, '_gdp_sequence_ids')),
                            (c.visitStorageName = ''.concat(l, '_gdp_session_id_sent'));
                    }),
                    (this.setOption = function (e, t) {
                        var i,
                            r = c.growingIO,
                            o = r.vdsConfig,
                            a = r.callError,
                            s = r.uploader,
                            u = r.emitter,
                            d = b(e) && H(p, e),
                            l = d && typeof t === ((null === (i = c.ALLOW_SETTING[e]) || void 0 === i ? void 0 : i.type) || 'string'),
                            g = n({}, o);
                        return d && l
                            ? ((o[e] = t),
                              'dataCollect' === e && g.dataCollect !== t && (t ? (c.sendVisit(!0), c.sendPage()) : c.growingIO.clearTrackTimer()),
                              H(['host', 'scheme'], e) && (null == s || s.generateHost()),
                              null == u || u.emit('OPTION_CHANGE', { optionName: e, optionValue: t }),
                              (window.vds[e] = t),
                              !0)
                            : (a('setOption > '.concat(e)), !1);
                    }),
                    (this.getOption = function (e) {
                        var t = c.growingIO,
                            i = t.vdsConfig,
                            r = t.callError;
                        return e && X(i, B(e)) ? i[B(e)] : E(e) ? n({}, i) : void r('getOption > '.concat(e));
                    }),
                    (this.sendVisit = function (e) {
                        var t = c.growingIO,
                            n = t.userStore.sessionId,
                            i = t.storage.getItem(c.visitStorageName);
                        (!e && n === i) || ((c.lastVisitEvent.timestamp = c.currentPage.time - 1), c.buildVisitEvent());
                    }),
                    (this.buildVisitEvent = function (e) {
                        var t = c.growingIO,
                            i = t.dataStore,
                            r = i.eventContextBuilder,
                            o = i.eventConverter,
                            a = t.emitter,
                            s = t.storage,
                            u = c.lastVisitEvent,
                            d = u.referralPage,
                            l = u.title,
                            g = u.path,
                            f = u.query,
                            h = u.timestamp,
                            p = n(n({ eventType: 'VISIT' }, r()), { referralPage: d || c.currentPage.getReferralPage(), timestamp: h });
                        g && ((p.title = l), (p.path = g), (p.query = f)),
                            Z(e) ||
                                ((p.session = (null == e ? void 0 : e.session) || p.session),
                                (p.trackingId = null == e ? void 0 : e.trackingId),
                                (p = n(n({}, p), e)));
                        var v = function (e) {
                            var t = e.requestData;
                            'VISIT' === t.eventType && (s.setItem(c.visitStorageName, t.sessionId), a.off('onSendAfter', v));
                        };
                        a.on('onSendAfter', v), o(p);
                    }),
                    (this.sendPage = function (e) {
                        e && c.currentPage.parsePage(), c.currentPage.buildPageEvent();
                    }),
                    (this.buildErrorEvent = function (e) {
                        var t = c.growingIO.dataStore,
                            i = t.eventContextBuilder;
                        (0, t.eventConverter)(
                            n({ eventType: 'CUSTOM', pageShowTimestamp: c.currentPage.time, eventName: 'onError', attributes: e }, i()),
                        );
                    }),
                    (this.currentPage = new Mn(this.growingIO)),
                    (this.eventContextBuilderInst = new Bn(this.growingIO)),
                    (this.eventContextBuilder = this.eventContextBuilderInst.main),
                    (this.generalProps = {}),
                    (this.lastVisitEvent = Kn),
                    null === (t = this.growingIO.emitter) ||
                        void 0 === t ||
                        t.on('onComposeAfter', function (e) {
                            var t = e.composedEvent;
                            ('VISIT' !== t.eventType && 'vst' !== t.t) || t.trackingId !== c.growingIO.trackingId || (c.lastVisitEvent = t);
                        }),
                    (this.lastPageEvent = {}),
                    null === (i = this.growingIO.emitter) ||
                        void 0 === i ||
                        i.on('onComposeAfter', function (e) {
                            var t = e.composedEvent;
                            ('PAGE' !== t.eventType && 'page' !== t.t) || t.trackingId !== c.growingIO.trackingId || (c.lastPageEvent = t);
                        }),
                    null === (u = this.growingIO.emitter) ||
                        void 0 === u ||
                        u.on(De, function () {
                            if (c.growingIO.gioSDKInitialized) {
                                c.currentPage.parsePage();
                                var e = c.currentPage,
                                    t = e.title,
                                    n = e.path,
                                    i = e.query,
                                    r = e.time,
                                    o = e.getReferralPage;
                                (c.lastVisitEvent = { referralPage: document.referrer || o(), title: t, path: n, query: i, timestamp: r - 1 }),
                                    c.sendVisit(!0),
                                    c.sendPage(!0);
                            }
                        });
            }
            return (
                Object.defineProperty(e.prototype, 'esid', {
                    get: function () {
                        var e = this,
                            t = this.growingIO.storage.getItem(this.seqStorageIdName) || {},
                            i = n({}, t);
                        return (
                            $(i, 'globalKey'),
                            (i = N(i) && !E(i) ? i : {}),
                            (this._esid = {}),
                            z(i).forEach(function (t) {
                                e._esid[t] = T(Number(i[t])) || i[t] >= 1e9 || 1 > i[t] ? 1 : i[t];
                            }),
                            this._esid
                        );
                    },
                    set: function (e) {
                        var t = {};
                        z(e).forEach(function (n) {
                            t[n] = T(e[n]) || e[n] >= 1e9 || 1 > e[n] ? 1 : e[n];
                        }),
                            Q(this._esid, t) || ((this._esid = t), this.setSequenceIds('esid', this._esid));
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                Object.defineProperty(e.prototype, 'gsid', {
                    get: function () {
                        var e = this.growingIO.storage.getItem(this.seqStorageIdName) || {},
                            t = Number(e.globalKey);
                        return (this._gsid = T(t) || t >= 1e9 || 1 > t ? 1 : t), this._gsid;
                    },
                    set: function (e) {
                        T(Number(e)) || e >= 1e9 || 1 > e ? (this._gsid = 1) : (this._gsid = e), this.setSequenceIds('gsid', this._gsid);
                    },
                    enumerable: !1,
                    configurable: !0,
                }),
                e
            );
        })(),
        Vn = (function (e) {
            function i(t) {
                var i = e.call(this, t) || this;
                return (
                    (i.growingIO = t),
                    (i.eventConverter = function (e) {
                        var t,
                            r,
                            o = i.growingIO,
                            a = o.vdsConfig,
                            s = o.dataStore,
                            u = o.uploader;
                        if (a.dataCollect) {
                            e.trackingId === i.growingIO.trackingId &&
                                ((e.globalSequenceId = s.gsid), (e.eventSequenceId = s.esid[e.eventType] || 1));
                            var c = {};
                            J(e, function (e, t) {
                                var n;
                                if ('element' === t) {
                                    var i = null !== (n = D(e)) && void 0 !== n ? n : {};
                                    J(i, function (e, t) {
                                        (Z(e) && 0 !== e) || (c[t] = e);
                                    });
                                } else ((Z(e) || E(e)) && 0 !== e) || (c[t] = e);
                            }),
                                e.trackingId === i.growingIO.trackingId &&
                                    ((i.growingIO.dataStore.gsid += 1),
                                    (i.growingIO.dataStore.esid = n(
                                        n({}, i.growingIO.dataStore.esid),
                                        (((t = {})[c.eventType] = (i.growingIO.dataStore.esid[c.eventType] || 1) + 1), t),
                                    ))),
                                null === (r = i.growingIO.emitter) || void 0 === r || r.emit('onComposeAfter', { composedEvent: n({}, c) }),
                                e.trackingId === i.growingIO.trackingId && u.commitRequest(c);
                        } else 'VISIT' === e.eventType && (i.lastVisitEvent = e);
                    }),
                    i
                );
            }
            return t(i, e), i;
        })(Fn),
        Wn = (function (e) {
            function n(t) {
                var n = e.call(this, t) || this;
                return (
                    (n.growingIO = t),
                    (n.generateHost = function () {
                        var e = n.growingIO.vdsConfig,
                            t = e.scheme,
                            i = e.host,
                            r = void 0 === i ? '' : i,
                            o = e.projectId;
                        t
                            ? V(B(t), '://') || (t = ''.concat(t, '://'))
                            : (t = ''.concat(location.protocol.indexOf('http') > -1 ? location.protocol.replace(':', '') : 'https', '//')),
                            F(r, 'http') && (r = r.substring(r.indexOf('://') + (V(B(t), '://') ? 3 : 0))),
                            (n.requestURL = ''.concat(t).concat(r, '/v3/projects/').concat(o, '/collect'));
                    }),
                    (n.requestURL = ''),
                    n.generateHost(),
                    n
                );
            }
            return t(n, e), n;
        })(function (e) {
            var t = this;
            (this.growingIO = e),
                (this.getSendType = function () {
                    var e = t.growingIO.vdsConfig.sendType;
                    return 'beacon' === e
                        ? (function () {
                              var e,
                                  t,
                                  n = !!(null === (e = null === window || void 0 === window ? void 0 : window.navigator) || void 0 === e
                                      ? void 0
                                      : e.sendBeacon),
                                  i = window.navigator.userAgent;
                              if (i.match(/(iPad|iPhone|iPod)/g)) {
                                  var r =
                                      !(t = i.toLowerCase().match(/cpu.*os (.*?) like mac os/i)) || 2 > t.length
                                          ? 0
                                          : +t[1].split('_').slice(0, 2).join('.');
                                  return n && r > 13;
                              }
                              return n;
                          })()
                            ? 'beacon'
                            : 'xhr'
                        : e;
                }),
                (this.commitRequest = function (e) {
                    var i = n({}, e);
                    t.requestQueue.push(n(n({}, i), { requestType: t.getSendType() })), t.initiateRequest();
                }),
                (this.initiateRequest = function () {
                    var e, r, o, a;
                    if (i([], t.requestQueue, !0).length > 0 && t.requestingNum < t.requestLimit) {
                        var s = t.growingIO,
                            u = s.vdsConfig,
                            c = s.emitter,
                            d = s.plugins,
                            l = s.useHybridInherit;
                        if (
                            ((t.requestQueue = i([], t.requestQueue, !0).filter(function (e) {
                                return (t.retryIds[e.globalSequenceId || e.esid] || 0) <= t.retryLimit;
                            })),
                            Z(t.requestQueue))
                        )
                            return;
                        var g = t.requestQueue.shift(),
                            f = g.requestType;
                        null == c || c.emit('onSendBefore', { requestData: n({}, g) });
                        var h = n({}, g);
                        if (
                            ($(h, ['requestType', 'trackingId']),
                            u.debug && console.log('[GrowingIO Debug]:', JSON.stringify(h, null, 2).replace(/\"/g, pe() ? '' : '"')),
                            (t.requestingNum += 1),
                            l)
                        )
                            return t.requestSuccessFn(g), !1;
                        var p = n({}, h),
                            v =
                                null === (r = null === (e = null == d ? void 0 : d.gioLimiting) || void 0 === e ? void 0 : e.canUploadData(p)) ||
                                void 0 === r ||
                                r;
                        if ((console.log('限流插件:', p, v), !v)) return;
                        switch (
                            (u.compress && (null == d ? void 0 : d.gioCompress)
                                ? ((t.compressType = '1'),
                                  (p =
                                      'image' === f
                                          ? null === (o = null == d ? void 0 : d.gioCompress) || void 0 === o
                                              ? void 0
                                              : o.compressToUTF16(JSON.stringify([p]))
                                          : null === (a = null == d ? void 0 : d.gioCompress) || void 0 === a
                                          ? void 0
                                          : a.compressToUint8Array(JSON.stringify([p]))))
                                : ((t.compressType = '0'), (p = JSON.stringify([p]))),
                            f)
                        ) {
                            case 'beacon':
                            default:
                                t.sendByBeacon(g, p);
                                break;
                            case 'xhr':
                                t.sendByXHR(g, p);
                            case 'image':
                        }
                    }
                }),
                (this.generateURL = function () {
                    return ''.concat(t.requestURL, '?stm=').concat(+Date.now(), '&compress=').concat(t.compressType);
                }),
                (this.sendByBeacon = function (e, n) {
                    navigator.sendBeacon(t.generateURL(), n) ? t.requestSuccessFn(e) : t.requestFailFn(e, 'beacon');
                }),
                (this.sendByXHR = function (e, n) {
                    var i = new XMLHttpRequest();
                    if (i)
                        return (
                            i.open('POST', t.generateURL(), !0),
                            (i.onreadystatechange = function () {
                                4 === i.readyState && (200 === i.status || 204 === i.status ? t.requestSuccessFn(e) : t.requestFailFn(e, 'xhr'));
                            }),
                            i.setRequestHeader('Content-Type', 'text/plain;charset=UTF-8'),
                            void i.send(n)
                        );
                    if (null === window || void 0 === window ? void 0 : window.XDomainRequest) {
                        var r = new window.XDomainRequest();
                        r.open('POST', t.generateURL().replace('https://', 'http://'), !0),
                            (r.onload = function () {
                                200 === i.status || 204 === r.status ? t.requestSuccessFn(e) : t.requestFailFn(e, 'xhr');
                            }),
                            (r.onerror = r.ontimeout =
                                function () {
                                    t.requestFailFn(e, 'xhr');
                                }),
                            r.send(n);
                    }
                }),
                (this.sendByImage = function (e, n) {
                    var i = ''.concat(t.generateURL(), '&data=').concat(n),
                        r = document.createElement('img');
                    (r.width = 1),
                        (r.height = 1),
                        (r.onload = function () {
                            t.requestSuccessFn(e), t.clearImage(r);
                        }),
                        (r.onerror = r.onabort =
                            function () {
                                t.requestSuccessFn(e), t.clearImage(r);
                            }),
                        (r.src = i);
                }),
                (this.clearImage = function (e) {
                    (e.src = ''), (e.onload = function () {}), (e.onerror = e.onerabort = function () {}), (e = null);
                }),
                (this.requestSuccessFn = function (e) {
                    var i;
                    t.requestingNum -= 1;
                    var r = e.globalSequenceId || e.esid || -1;
                    t.retryIds[r] && (t.retryIds[r] = 0),
                        e.trackingId === t.growingIO.trackingId && (t.growingIO.userStore.sessionId = e.sessionId),
                        null === (i = t.growingIO.emitter) || void 0 === i || i.emit('onSendAfter', { requestData: n({}, e) }),
                        t.initiateRequest();
                }),
                (this.requestFailFn = function (e, i) {
                    t.requestingNum -= 1;
                    var r = e.globalSequenceId || e.esid || -1;
                    t.retryIds[r] || (t.retryIds[r] = 0), (t.retryIds[r] += 1);
                    var o = t.requestQueue.some(function (t) {
                            return t.globalSequenceId === e.globalSequenceId && t.esid === e.esid;
                        }),
                        a = i;
                    if (
                        (t.retryIds[r] < t.retryLimit + 1 || ((a = 'beacon' === i ? 'xhr' : 'xhr' === i ? 'image' : void 0), (t.retryIds[r] = 0)),
                        !o && a)
                    )
                        var s = window.setTimeout(function () {
                            Z(t.requestQueue)
                                ? (t.requestQueue.push(n(n({}, e), { requestType: a })), t.initiateRequest())
                                : t.requestQueue.push(n(n({}, e), { requestType: a })),
                                window.clearTimeout(s),
                                (s = null);
                        }, 800);
                }),
                (this.requestQueue = []),
                (this.requestLimit = 10),
                (this.requestTimeout = 5e3),
                (this.retryLimit = 1),
                (this.retryIds = {}),
                (this.requestingNum = 0),
                (this.requestURL = '');
        }),
        Xn = (function (e) {
            function i() {
                var t = e.call(this) || this;
                return (
                    (t.registerPlugins = function (e) {
                        L(e)
                            ? (e.forEach(function (t, i) {
                                  var r, o;
                                  Z(t) || E(t)
                                      ? te('插件不合法，跳过加载!', 'warn')
                                      : (null === (r = t.js) || void 0 === r ? void 0 : r.default) &&
                                        (e[i] = n(n({}, null === (o = t.js) || void 0 === o ? void 0 : o.default), { options: t.options }));
                              }),
                              (e = U(e)),
                              t.plugins.installAll(e))
                            : te('插件注册失败，请检查!', 'error');
                    }),
                    (t.initCallback = function () {
                        (t.uploader = new Wn(t)), (t.userStore = new jn(t));
                    }),
                    (t.getPlugins = function () {
                        return t.plugins.pluginItems;
                    }),
                    (t.setTrackerScheme = function (e) {
                        H(['http', 'https'], e) ? (t.dataStore.setOption('scheme', e), t.notRecommended()) : t.callError('scheme', !1);
                    }),
                    (t.setTrackerHost = function (e) {
                        ue.test(e) || ce.test(e) ? (t.dataStore.setOption('host', e), t.notRecommended()) : t.callError('host', !1);
                    }),
                    (t.setDataCollect = function (e) {
                        t.setOption('dataCollect', !!e), t.notRecommended();
                    }),
                    (t.setAutotrack = function (e) {
                        t.setOption('autotrack', !!e), t.notRecommended();
                    }),
                    (t.enableDebug = function (e) {
                        t.setOption('debug', !!e), t.notRecommended();
                    }),
                    (t.enableHT = function (e) {
                        t.setOption('hashtag', !!e), t.notRecommended();
                    }),
                    (t.getVisitorId = function () {
                        return t.userStore.uid;
                    }),
                    (t.getDeviceId = function () {
                        return t.userStore.uid;
                    }),
                    (t.setUserAttributes = function (e, n) {
                        var i, r;
                        !Z(e) && N(e)
                            ? null === (r = null === (i = t.plugins) || void 0 === i ? void 0 : i.gioCustomTracking) ||
                              void 0 === r ||
                              r.buildUserAttributesEvent(e, n)
                            : t.callError('setUserAttributes');
                    }),
                    (t.setUserId = function (e, n) {
                        if (se(B(e).trim())) {
                            var i = t.userStore.gioId;
                            t.vdsConfig.enableIdMapping && (t.userStore.userKey = !E(n) && B(n).length > 0 ? B(n).slice(0, 1e3) : ''),
                                (t.userStore.userId = B(e).slice(0, 1e3)),
                                i && i !== t.userStore.userId && (t.userStore.sessionId = '');
                        } else t.clearUserId(), t.callError('setUserId');
                    }),
                    (t.clearUserId = function () {
                        (t.userStore.userId = ''), (t.userStore.userKey = '');
                    }),
                    (t.track = function (e, i, r, o) {
                        var a, s;
                        (
                            (null === (s = null === (a = t.plugins) || void 0 === a ? void 0 : a.gioCustomTracking) || void 0 === s
                                ? void 0
                                : s.buildCustomEvent) || function () {}
                        )(e, n(n({}, t.dataStore.generalProps), N(i) && !Z(i) ? i : {}), r, o);
                    }),
                    (t.sendPage = function (e) {
                        return t.dataStore.currentPage.buildPageEvent(e);
                    }),
                    (t.sendVisit = function (e) {
                        return t.dataStore.buildVisitEvent(e);
                    }),
                    (t.trackTimerStart = function (e, n) {
                        t.vdsConfig.dataCollect &&
                            oe(e, function () {
                                var i = fe();
                                P(n)
                                    ? ((t.dataStore.trackTimers[i] = { eventName: e, leng: 0, start: +Date.now() }), n(i))
                                    : te('回调方法不合法，返回timerId失败!');
                            });
                    }),
                    (t.trackTimerPause = function (e) {
                        if (e && t.dataStore.trackTimers[e]) {
                            var n = t.dataStore.trackTimers[e];
                            n.start && (n.leng = n.leng + (+Date.now() - n.start)), (n.start = 0);
                        }
                    }),
                    (t.trackTimerResume = function (e) {
                        if (e && t.dataStore.trackTimers[e]) {
                            var n = t.dataStore.trackTimers[e];
                            0 === n.start && (n.start = +Date.now());
                        }
                    }),
                    (t.trackTimerEnd = function (e, i) {
                        if (t.vdsConfig.dataCollect)
                            if (e && t.dataStore.trackTimers[e]) {
                                var r = t.dataStore.trackTimers[e];
                                if (0 !== r.start) {
                                    var o = +Date.now() - r.start;
                                    r.leng = o > 0 ? r.leng + o : 0;
                                }
                                t.track(r.eventName, n(n({}, i), { event_duration: r.leng > 864e5 ? 0 : r.leng / 1e3 })), t.removeTimer(e);
                            } else te('未查找到对应的计时器，请检查!', 'error');
                    }),
                    (t.removeTimer = function (e) {
                        e && t.dataStore.trackTimers[e] && delete t.dataStore.trackTimers[e];
                    }),
                    (t.clearTrackTimer = function () {
                        t.dataStore.trackTimers = {};
                    }),
                    (t.dataStore = new Vn(t)),
                    t
                );
            }
            return t(i, e), i;
        })(function () {
            var e,
                t = this;
            (this.trackingId = 'g0'),
                (this.init = function (e) {
                    var n, i, r, o, a;
                    te('Web SDK 初始化中...', 'info');
                    var s = t.dataStore,
                        u = s.initOptions,
                        c = s.currentPage,
                        d = s.sendVisit,
                        l = s.sendPage;
                    u(e),
                        (t.storage = Le(t.vdsConfig)),
                        t.initCallback(),
                        null === (n = t.emitter) || void 0 === n || n.emit(Ae, t),
                        null === (r = null === (i = t.plugins) || void 0 === i ? void 0 : i.gioEventAutoTracking) || void 0 === r || r.main(),
                        c.hookHistory(),
                        c.parsePage(),
                        null === (o = t.emitter) || void 0 === o || o.emit(xe, t),
                        te('Web SDK 初始化完成！', 'success'),
                        t.useEmbeddedInherit || ((t.dataStore.lastVisitEvent.timestamp = c.time), d()),
                        l(),
                        (t.gioSDKInitialized = !0),
                        (t.vdsConfig.gioSDKInitialized = !0),
                        (window[t.vds] = t.vdsConfig),
                        null === (a = t.emitter) || void 0 === a || a.emit('SDK_INITIALIZED_COMPLATE', t);
                }),
                (this.setOption = function (e, n) {
                    if (H(p, e)) {
                        var i = t.dataStore.setOption(e, n);
                        return i && v[e] && te('已'.concat(n ? '开启' : '关闭').concat(v[e]), 'info'), i;
                    }
                    return te('不存在可修改的配置项：'.concat(e, '，请检查后重试!'), 'warn'), !1;
                }),
                (this.getOption = function (e) {
                    return t.dataStore.getOption(e);
                }),
                (this.setGeneralProps = function (e) {
                    N(e) && !Z(e)
                        ? ((t.dataStore.generalProps = n(n({}, t.dataStore.generalProps), e)),
                          z(t.dataStore.generalProps).forEach(function (e) {
                              H([void 0, null], t.dataStore.generalProps[e]) && (t.dataStore.generalProps[e] = '');
                          }))
                        : t.callError('setGeneralProps');
                }),
                (this.clearGeneralProps = function (e) {
                    L(e) && !Z(e)
                        ? e.forEach(function (e) {
                              $(t.dataStore.generalProps, e);
                          })
                        : (t.dataStore.generalProps = {});
                }),
                (this.reissuePage = function () {
                    t.dataStore.sendPage();
                }),
                (this.notRecommended = function () {
                    return te("不推荐的方法使用，建议使用 gio('setOption', [optionName], [value])!", 'info');
                }),
                (this.callError = function (e, t, n) {
                    return (
                        void 0 === t && (t = !0),
                        void 0 === n && (n = '参数不合法'),
                        te(
                            ''
                                .concat(t ? '调用' : '设置', ' ')
                                .concat(e, ' 失败，')
                                .concat(n, '!'),
                            'warn',
                        )
                    );
                }),
                (this.gioEnvironment = 'cdp'),
                (this.sdkVersion = '5.1.0'),
                (this.vds = window.gioCompatibilityVds ? 'gdp_vds' : 'vds'),
                (this.utils = Object.assign({}, ee, ae, Ge)),
                (this.emitter = {
                    all: (e = e || new Map()),
                    on: function (t, n) {
                        var i = e.get(t);
                        i ? i.push(n) : e.set(t, [n]);
                    },
                    off: function (t, n) {
                        var i = e.get(t);
                        i && (n ? i.splice(i.indexOf(n) >>> 0, 1) : e.set(t, []));
                    },
                    emit: function (t, n) {
                        var i = e.get(t);
                        i &&
                            i.slice().map(function (e) {
                                e(n);
                            }),
                            (i = e.get('*')) &&
                                i.slice().map(function (e) {
                                    e(t, n);
                                });
                    },
                }),
                (this.useEmbeddedInherit = !1),
                (this.useHybridInherit = !1),
                (this.gioSDKInitialized = !1),
                (this.plugins = new Hn(this)),
                this.plugins.innerPluginInit();
        });
    return (
        (function () {
            var e,
                t,
                i,
                r,
                o,
                a = window.gioCompatibilityVds ? 'gdp_vds' : 'vds';
            if (null === (e = window[a]) || void 0 === e ? void 0 : e.gioSDKInstalled)
                return (An = window.gdp), void te('SDK重复加载，请检查是否重复加载SDK或接入其他平台SDK导致冲突!', 'warn');
            window[a] = n(n({}, null !== (t = window[a]) && void 0 !== t ? t : {}), { gioSDKInstalled: !0 });
            var s = new Xn();
            An = function () {
                var e,
                    t = arguments[0];
                if (b(t) && H(h, t) && s[t]) {
                    var i = k(j(arguments));
                    if ('init' === t) {
                        var r = (function (e) {
                            var t;
                            return e.vdsConfig || e.gioSDKInitialized || (null === (t = window.vds) || void 0 === t ? void 0 : t.gioSDKInitialized)
                                ? (te('SDK重复初始化，请检查是否重复加载SDK或接入其他平台SDK导致冲突!', 'warn'), !1)
                                : !(
                                      H(['', 'localhost', '127.0.0.1'], location.hostname) &&
                                      !window._gr_ignore_local_rule &&
                                      (te('当前SDK不允许在本地环境初始化!', 'warn'), 1)
                                  );
                        })(s);
                        if (!r) return;
                        var o = (function (e) {
                            return (
                                !Z(U(e)) ||
                                (te(
                                    'SDK初始化失败，请使用 gdp("init", "您的项目 accountId", "您项目的 dataSourceId", options); 进行初始化!',
                                    'error',
                                ),
                                !1)
                            );
                        })(i);
                        if (!o) return;
                        var u = (function (e) {
                            var t = D(e),
                                n = R(e);
                            return se(B(t).trim())
                                ? ((N(n) && n) || (n = {}), { projectId: t, userOptions: n })
                                : (te('SDK初始化失败，accountId 参数不合法!', 'error'), !1);
                        })(i);
                        if (!u) return;
                        var c = (function (e) {
                            var t = e[1],
                                n = e[2],
                                i = R(e);
                            return t && b(t)
                                ? { dataSourceId: t, appId: b(n) ? n : '', cdpOptions: i }
                                : (te('SDK初始化失败，dataSourceId 参数不合法!', 'error'), !1);
                        })(i);
                        if (!c) return;
                        var d = u.projectId,
                            l = c.dataSourceId,
                            g = c.appId,
                            f = c.cdpOptions;
                        s.init(n(n({}, f), { projectId: d, dataSourceId: l, appId: g }));
                    } else if ('registerPlugins' === t) s.registerPlugins(i[0]);
                    else {
                        if (s.gioSDKInitialized && s.vdsConfig) return s[t].apply(s, i);
                        s.emitter.emit('UNINITIALIZED_CALL', arguments), te('SDK未初始化!', 'error');
                    }
                } else H(m, t) ? te('方法 '.concat(B(t), ' 已被弃用，请移除!'), 'warn') : te('不存在名为 '.concat(B(t), ' 的方法调用!'), 'error');
                window[a] = n(n({}, window[a]), {
                    _gr_ignore_local_rule: null !== (e = window._gr_ignore_local_rule) && void 0 !== e && e,
                    gioEnvironment: 'cdp',
                    gioSDKVersion: s.sdkVersion,
                    gioSDKFull: s.gioSDKFull,
                    canIUse: function (e) {
                        return H(h, e) && s[e];
                    },
                });
            };
            var u = null === (i = null === window || void 0 === window ? void 0 : window.gdp) || void 0 === i ? void 0 : i.q,
                c = null === (r = null === window || void 0 === window ? void 0 : window.gdp) || void 0 === r ? void 0 : r.e,
                d = null === (o = null === window || void 0 === window ? void 0 : window.gdp) || void 0 === o ? void 0 : o.ef;
            (window.gdp = An),
                (window.gdp.e = c),
                (window.gdp.ef = d),
                L(u) &&
                    !Z(u) &&
                    u.forEach(function (e) {
                        An.apply(null, e);
                    });
        })(),
        An
    );
});
