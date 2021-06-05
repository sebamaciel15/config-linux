var injectContentScript = function() {
    var permId, defaultServerOptions = [ "s100", "s101", "s102", "s103", "s104", "s105", "s106", "s107", "s108", "s109", "s110", "s111", "s112", "s113", "s114", "s115", "s116", "s117", "s118", "s119", "s120", "s121", "s122", "s123", "s125", "s126", "s127", "s128", "s129", "s124", "s130", "s131", "s132", "s133", "s134", "s135", "s136", "s137", "s138", "s139", "s140", "s141", "s142", "s143", "s144", "s145", "s146", "s147", "s148", "s149", "s150", "s151", "s152", "s153", "s154", "s155", "s156", "s157", "s158", "s159", "s160", "s161", "s162", "s163", "s164", "s165", "s166", "s167", "s168", "s169", "s170", "s171", "s172", "s173", "s174", "s175", "s176", "s177", "s178", "s179", "s180", "s181", "s182", "s183", "s184", "s185", "s186", "s187", "s188", "s189", "s190", "s191", "s192", "s193", "s194", "s195", "s196", "s197", "s198", "s199" ], changingVideo = !1, upNextClick = !1, replaceRunning = !1;
    chrome.storage.local.get([ "userId" ], (function(data) {
        data.userId && (permId = data.userId);
    }));
    const closeImage = chrome.extension.getURL("img/x-circle.svg");
    var ownerOnlyNextEpisodeModal = {
        title: "Teleparty | Disconnected from party",
        content: "Only the owner of this party can change the episode. Click the button below to be redirected to the party, then click on the red Tp icon to rejoin.",
        buttonTitle: "Return to Party"
    }, wrongScreenModal = {
        title: "Teleparty | Disconnected from party",
        content: "It looks like you left the party. Please click the button below to rejoin the party.",
        buttonTitle: "Return to Party"
    }, invalidNextEpisodeModal = {
        title: "Teleparty | Disconnected from party",
        content: "Sorry, long parties only work for consecutive episodes for now. Please share a new Teleparty to continue watching together, or click the button below to rejoin the party.",
        buttonTitle: "Return to Party"
    }, failedNextEpisodeModal = {
        title: "Teleparty | Disconnected from party",
        content: "It looks like the video changed and we weren't able to connect you. Click the button below to be redirected to the party, then click on the red Tp icon to rejoin.",
        buttonTitle: "Return to Party"
    }, lostConnectionModal = {
        title: "Teleparty | Disconnected from party",
        content: "It looks like you lost connection to the server. Click the button below to be redirected to the party, then click on the red Tp icon to rejoin.",
        buttonTitle: "Return to Party"
    }, showButtonMessage = function(options, redirectUrl) {
        const modalTemplate = function(options) {
            return `\n    <div id="alert-dialog-wrapper">\n      <div id="alert-dialog-container">\n        <div id="alert-title-wrapper">\n            <div class="alert-title">\n                <p id="alert-title-txt" class="extension-title">\n                    ${options.title}\n                </p>\n                <button id="alert-x-btn">\n                    <img src="${closeImage}" alt="close" />\n                </button>\n            </div>\n            <div class="extension-border-bot">\n                \n            </div>\n        </div>\n        <div id="alert-description">\n            <p id="alert-content-txt" class="extension-txt">\n              ${options.content}\n            </p>\n            <button id="alert-return-btn" class="extension-btn">${options.buttonTitle}</button>\n        </div>\n      </div>\n    </div>\n    `;
        }(options);
        document.body.insertAdjacentHTML("afterbegin", modalTemplate), jQuery("#alert-x-btn").click((() => {
            document.querySelector("#alert-dialog-wrapper").remove();
        })), jQuery("#alert-return-btn").click((() => {
            document.querySelector("#alert-dialog-wrapper").remove(), window.location.href = redirectUrl;
        }));
    }, logMessage = function(message, logTime = !1) {
        false;
    }, escapeStr = function(str) {
        return str.replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }, delay = function(milliseconds) {
        return function(result) {
            return new Promise((function(resolve, reject) {
                setTimeout((function() {
                    resolve(result);
                }), milliseconds);
            }));
        };
    }, delayUntil = function(condition, maxDelay) {
        return function(result) {
            var startTime = (new Date).getTime(), checkForCondition = function() {
                return condition() ? Promise.resolve(result) : null != maxDelay && (new Date).getTime() - startTime > maxDelay ? Promise.reject(Error("delayUntil timed out")) : delay(250)().then(checkForCondition);
            };
            return checkForCondition();
        };
    }, shove = function(array, value, limit) {
        array.push(value), array.length > limit && array.splice(0, array.length - limit);
    }, median = function(array) {
        return array.concat().sort()[Math.floor(array.length / 2)];
    }, swallow = function(action) {
        return function(result) {
            return action(result).catch((function(e) {
                console.error(e);
            }));
        };
    };
    Promise.prototype.ensure = function(fn) {
        return this.then(fn, (function(e) {
            throw fn(), e;
        }));
    };
    var injectScript = function(script) {
        var s = document.createElement("script");
        s.textContent = script, (document.head || document.documentElement).after(s);
    }, uiEventsHappening = 0, hboDivs = jQuery("div");
    setInterval((function() {
        hboDivs = jQuery("div");
    }), 1500);
    var socket, isVideoReady = function() {
        var state = getState();
        return "paused" === state || "playing" === state;
    }, getState = function() {
        return 0 == jQuery("video").length || "" === jQuery("video")[0].src ? "notready" : 0 == jQuery("video").length ? "none" : jQuery("video")[0].readyState < 4 ? "loading" : jQuery("video")[0].paused ? "paused" : "playing";
    }, seek = function(milliseconds) {
        return changingVideo ? Promise.resolve() : (logMessage(0, !0), new Promise((async function(resolve, reject) {
            uiEventsHappening += 1;
            try {
                video.currentTime = milliseconds / 1e3, await delay(300)(), await delayUntil((() => "loading" !== getState()), 1e3)(), 
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                uiEventsHappening -= 1;
            }
        })));
    }, pause = function() {
        return changingVideo ? Promise.resolve() : new Promise((async (resolve, reject) => {
            uiEventsHappening += 1;
            try {
                const pauseEvent = new CustomEvent("tpVideoNode", {
                    detail: {
                        type: "pause"
                    }
                });
                window.dispatchEvent(pauseEvent), await delayUntil((() => "paused" === getState()), 1e3)(), 
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                uiEventsHappening -= 1;
            }
        }));
    }, play = function() {
        return changingVideo ? Promise.resolve() : new Promise((async (resolve, reject) => {
            uiEventsHappening += 1;
            try {
                const playEvent = new CustomEvent("tpVideoNode", {
                    detail: {
                        type: "play"
                    }
                });
                window.dispatchEvent(playEvent), await delayUntil((() => "playing" === getState()), 1e3)(), 
                resolve();
            } catch (error) {
                reject(error);
            } finally {
                uiEventsHappening -= 1;
            }
        }));
    }, getRemainingTime = function() {
        return videoDuration - getPlaybackPosition();
    }, getRemainingTimeText = function() {
        return function(seconds) {
            const h = Math.floor(seconds / 3600), m = Math.floor(seconds % 3600 / 60), s = seconds % 60;
            return [ h, m > 9 ? m : h ? "0" + m : m || "0", s > 9 ? s : "0" + s ].filter(Boolean).join(":");
        }(getRemainingTime());
    }, getPlaybackPosition = function() {
        return null == video ? 0 : Math.floor(1e3 * video.currentTime - videoTimeOffset);
    }, onBuffer = function() {
        sessionId && socket.emit("buffering", {
            buffering: !0
        }, (() => {}));
    }, onCanPlay = function() {
        sessionId && socket.emit("buffering", {
            buffering: !1
        }, (() => {}));
    }, wakeUp = function() {
        return uiEventsHappening += 1, delay(1)().ensure((function() {
            uiEventsHappening -= 1;
        }));
    }, hideControls = function() {
        return uiEventsHappening += 1, delay(1)().ensure((function() {
            uiEventsHappening -= 1;
        }));
    }, getHBOVideoType = function(url) {
        return url.includes("urn:hbo:feature") ? (console.log("this is an hbo feature"), 
        "feature") : url.includes("urn:hbo:episode") ? (console.log("this is an hbo episode"), 
        "episode") : url.includes("urn:hbo:extra") ? (console.log("this is an hbo extra"), 
        "extra") : "none";
    }, getURLParameter = function(url, key, queryIndex) {
        var searchString = "?" + url.split("?")[queryIndex];
        if (void 0 === searchString) return null;
        logMessage();
        var escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        logMessage();
        var match = new RegExp("[?|&]" + escapedKey + "=([^&]*)(&|$)").exec(searchString);
        return null === match ? null : decodeURIComponent(match[1]);
    }, url = window.location.href;
    logMessage();
    (function(url) {
        var searchString = url.split("/episode/")[1];
        if (void 0 === searchString) return null;
        logMessage();
        var escapedKey = "urn:hbo:episode".replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        logMessage();
        var match = new RegExp(escapedKey + ":([^&]*)(&|$)").exec(searchString);
        null === match || decodeURIComponent(match[1]);
    })(url), getURLParameter(url, "npSessionId", 1);
    var npServerIdFromUrl = getURLParameter(url, "npServerId", 1), servers = {
        load: !0,
        undefined: !0,
        wpseth: !0,
        sundefined: !0,
        s1: !0,
        s2: !0,
        s3: !0,
        s4: !0,
        s5: !0,
        s6: !0,
        s7: !0,
        s8: !0,
        s9: !0,
        s10: !0,
        s11: !0,
        s12: !0,
        s13: !0,
        s14: !0,
        s15: !0,
        s16: !0,
        s17: !0,
        s18: !0,
        s19: !0,
        s20: !0,
        s21: !0,
        s22: !0,
        s23: !0,
        s24: !0,
        s25: !0,
        s26: !0,
        s27: !0,
        s28: !0,
        s29: !0,
        s30: !0,
        s31: !0,
        s32: !0,
        s33: !0,
        s34: !0,
        s35: !0,
        s36: !0,
        s37: !0,
        s38: !0,
        s39: !0,
        s40: !0,
        s41: !0,
        s42: !0,
        s43: !0,
        s44: !0,
        s45: !0,
        s46: !0,
        s47: !0,
        s48: !0,
        s49: !0,
        s50: !0,
        s51: !0,
        s52: !0,
        s53: !0,
        s54: !0,
        s55: !0,
        s56: !0,
        s57: !0,
        s58: !0,
        s59: !0,
        s60: !0,
        s61: !0,
        s62: !0,
        s63: !0,
        s64: !0,
        s65: !0,
        s66: !0,
        s67: !0,
        s68: !0,
        s69: !0,
        s70: !0,
        s71: !0,
        s72: !0,
        s73: !0,
        s74: !0,
        s75: !0,
        s76: !0,
        s77: !0,
        s78: !0,
        s79: !0,
        s80: !0,
        s81: !0,
        s82: !0,
        s83: !0,
        s84: !0,
        s85: !0,
        s86: !0,
        s87: !0,
        s88: !0,
        s89: !0,
        s90: !0,
        s91: !0,
        s92: !0,
        s93: !0,
        s94: !0,
        s95: !0,
        s96: !0,
        s97: !0,
        s98: !0,
        s99: !0,
        s100: !0,
        s101: !0,
        s102: !0,
        s103: !0,
        s104: !0,
        s105: !0,
        s106: !0,
        s107: !0,
        s108: !0,
        s109: !0,
        s110: !0,
        s111: !0,
        s112: !0,
        s113: !0,
        s114: !0,
        s115: !0,
        s116: !0,
        s117: !0,
        s118: !0,
        s119: !0,
        s120: !0,
        s121: !0,
        s122: !0,
        s123: !0,
        s124: !0,
        s125: !0,
        s126: !0,
        s127: !0,
        s128: !0,
        s129: !0,
        s130: !0,
        s131: !0,
        s132: !0,
        s133: !0,
        s134: !0,
        s135: !0,
        s136: !0,
        s137: !0,
        s138: !0,
        s139: !0,
        s140: !0,
        s141: !0,
        s142: !0,
        s143: !0,
        s144: !0,
        s145: !0,
        s146: !0,
        s147: !0,
        s148: !0,
        s149: !0,
        s150: !0,
        s151: !0,
        s152: !0,
        s153: !0,
        s154: !0,
        s155: !0,
        s156: !0,
        s157: !0,
        s158: !0,
        s159: !0,
        s160: !0,
        s161: !0,
        s162: !0,
        s163: !0,
        s164: !0,
        s165: !0,
        s166: !0,
        s167: !0,
        s168: !0,
        s169: !0,
        s170: !0,
        s171: !0,
        s172: !0,
        s173: !0,
        s174: !0,
        s175: !0,
        s176: !0,
        s177: !0,
        s178: !0,
        s179: !0,
        s180: !0,
        s181: !0,
        s182: !0,
        s183: !0,
        s184: !0,
        s185: !0,
        s186: !0,
        s187: !0,
        s188: !0,
        s189: !0,
        s190: !0,
        s191: !0,
        s192: !0,
        s193: !0,
        s194: !0,
        s195: !0,
        s196: !0,
        s197: !0,
        s198: !0,
        s199: !0,
        s200: !0,
        s201: !0,
        s202: !0,
        s203: !0,
        s204: !0,
        s205: !0,
        s206: !0,
        s207: !0,
        s208: !0,
        s209: !0,
        s210: !0,
        s211: !0,
        s212: !0,
        s213: !0,
        s214: !0,
        s215: !0,
        s216: !0,
        s217: !0,
        s218: !0,
        s219: !0,
        s220: !0,
        s221: !0,
        s222: !0,
        s223: !0,
        s224: !0,
        s225: !0,
        s226: !0,
        s227: !0,
        s228: !0,
        s229: !0,
        s230: !0,
        s231: !0,
        s232: !0,
        s233: !0,
        s234: !0,
        s235: !0,
        s236: !0,
        s237: !0,
        s238: !0,
        s239: !0,
        s240: !0,
        s241: !0,
        s242: !0,
        s243: !0,
        s244: !0,
        s245: !0,
        s246: !0,
        s247: !0,
        s248: !0,
        s249: !0,
        s250: !0,
        s251: !0,
        s252: !0,
        s253: !0,
        s254: !0,
        s255: !0,
        s256: !0,
        s257: !0,
        s258: !0,
        s259: !0,
        s260: !0,
        s261: !0,
        s262: !0,
        s263: !0,
        s264: !0,
        s265: !0,
        s266: !0,
        s267: !0,
        s268: !0,
        s269: !0,
        s270: !0,
        s271: !0,
        s272: !0,
        s273: !0,
        s274: !0,
        s275: !0,
        s276: !0,
        s277: !0,
        s278: !0,
        s279: !0,
        s280: !0,
        s281: !0,
        s282: !0,
        s283: !0,
        s284: !0,
        s285: !0,
        s286: !0,
        s287: !0,
        s288: !0,
        s289: !0,
        s290: !0,
        s291: !0,
        s292: !0,
        s293: !0,
        s294: !0,
        s295: !0,
        s296: !0,
        s297: !0,
        s298: !0,
        s299: !0,
        s300: !0,
        s301: !0,
        s302: !0,
        s303: !0,
        s304: !0,
        s305: !0,
        s306: !0,
        s307: !0,
        s308: !0,
        s309: !0,
        s310: !0,
        s311: !0,
        s312: !0,
        s313: !0,
        s314: !0,
        s315: !0,
        s316: !0,
        s317: !0,
        s318: !0,
        s319: !0,
        s320: !0,
        s321: !0,
        s322: !0,
        s323: !0,
        s324: !0,
        s325: !0,
        s326: !0,
        s327: !0,
        s328: !0,
        s329: !0,
        s330: !0,
        s331: !0,
        s332: !0,
        s333: !0,
        s334: !0,
        s335: !0,
        s336: !0,
        s337: !0,
        s338: !0,
        s339: !0,
        s340: !0,
        s341: !0,
        s342: !0,
        s343: !0,
        s344: !0,
        s345: !0,
        s346: !0,
        s347: !0,
        s348: !0,
        s349: !0,
        s350: !0,
        s351: !0,
        s352: !0,
        s353: !0,
        s354: !0,
        s355: !0,
        s356: !0,
        s357: !0,
        s358: !0,
        s359: !0,
        s360: !0,
        s361: !0,
        s362: !0,
        s363: !0,
        s364: !0,
        s365: !0,
        s366: !0,
        s367: !0,
        s368: !0,
        s369: !0,
        s370: !0,
        s371: !0,
        s372: !0,
        s373: !0,
        s374: !0,
        s375: !0,
        s376: !0,
        s377: !0,
        s378: !0,
        s379: !0,
        s380: !0,
        s381: !0,
        s382: !0,
        s383: !0,
        s384: !0,
        s385: !0,
        s386: !0,
        s387: !0,
        s388: !0,
        s389: !0,
        s390: !0,
        s391: !0,
        s392: !0,
        s393: !0,
        s394: !0,
        s395: !0,
        s396: !0,
        s397: !0,
        s398: !0,
        s399: !0,
        s400: !0,
        s401: !0,
        s402: !0,
        s403: !0,
        s404: !0,
        s405: !0,
        s406: !0,
        s407: !0,
        s408: !0,
        s409: !0,
        s410: !0,
        s411: !0,
        s412: !0,
        s413: !0,
        s414: !0,
        s415: !0,
        s416: !0,
        s417: !0,
        s418: !0,
        s419: !0,
        s420: !0,
        s421: !0,
        s422: !0,
        s423: !0,
        s424: !0,
        s425: !0,
        s426: !0,
        s427: !0,
        s428: !0,
        s429: !0,
        s430: !0,
        s431: !0,
        s432: !0,
        s433: !0,
        s434: !0,
        s435: !0,
        s436: !0,
        s437: !0,
        s438: !0,
        s439: !0,
        s440: !0,
        s441: !0,
        s442: !0,
        s443: !0,
        s444: !0,
        s445: !0,
        s446: !0,
        s447: !0,
        s448: !0,
        s449: !0,
        s450: !0,
        s451: !0,
        s452: !0,
        s453: !0,
        s454: !0,
        s455: !0,
        s456: !0,
        s457: !0,
        s458: !0,
        s459: !0,
        s460: !0,
        s461: !0,
        s462: !0,
        s463: !0,
        s464: !0,
        s465: !0,
        s466: !0,
        s467: !0,
        s468: !0,
        s469: !0,
        s470: !0,
        s471: !0,
        s472: !0,
        s473: !0,
        s474: !0,
        s475: !0,
        s476: !0,
        s477: !0,
        s478: !0,
        s479: !0,
        s480: !0,
        s481: !0,
        s482: !0,
        s483: !0,
        s484: !0,
        s485: !0,
        s486: !0,
        s487: !0,
        s488: !0,
        s489: !0,
        s490: !0,
        s491: !0,
        s492: !0,
        s493: !0,
        s494: !0,
        s495: !0,
        s496: !0,
        s497: !0,
        s498: !0,
        s499: !0,
        s500: !0,
        s501: !0,
        s502: !0,
        s503: !0,
        s504: !0,
        s505: !0,
        s506: !0,
        s507: !0,
        s508: !0,
        s509: !0,
        s510: !0,
        s511: !0,
        s512: !0,
        s513: !0,
        s514: !0,
        s515: !0,
        s516: !0,
        s517: !0,
        s518: !0,
        s519: !0,
        s520: !0,
        s521: !0,
        s522: !0,
        s523: !0,
        s524: !0,
        s525: !0,
        s526: !0,
        s527: !0,
        s528: !0,
        s529: !0,
        s530: !0,
        s531: !0,
        s532: !0,
        s533: !0,
        s534: !0,
        s535: !0,
        s536: !0,
        s537: !0,
        s538: !0,
        s539: !0,
        s540: !0,
        s541: !0,
        s542: !0,
        s543: !0,
        s544: !0,
        s545: !0,
        s546: !0,
        s547: !0,
        s548: !0,
        s549: !0,
        s550: !0,
        s551: !0,
        s552: !0,
        s553: !0,
        s554: !0,
        s555: !0,
        s556: !0,
        s557: !0,
        s558: !0,
        s559: !0,
        s560: !0,
        s561: !0,
        s562: !0,
        s563: !0,
        s564: !0,
        s565: !0,
        s566: !0,
        s567: !0,
        s568: !0,
        s569: !0,
        s570: !0,
        s571: !0,
        s572: !0,
        s573: !0,
        s574: !0,
        s575: !0,
        s576: !0,
        s577: !0,
        s578: !0,
        s579: !0,
        s580: !0,
        s581: !0,
        s582: !0,
        s583: !0,
        s584: !0,
        s585: !0,
        s586: !0,
        s587: !0,
        s588: !0,
        s589: !0,
        s590: !0,
        s591: !0,
        s592: !0,
        s593: !0,
        s594: !0,
        s595: !0,
        s596: !0,
        s597: !0,
        s598: !0,
        s599: !0,
        s600: !0,
        s601: !0,
        s602: !0,
        s603: !0,
        s604: !0,
        s605: !0,
        s606: !0,
        s607: !0,
        s608: !0,
        s609: !0,
        s610: !0,
        s611: !0,
        s612: !0,
        s613: !0,
        s614: !0,
        s615: !0,
        s616: !0,
        s617: !0,
        s618: !0,
        s619: !0,
        s620: !0,
        s621: !0,
        s622: !0,
        s623: !0,
        s624: !0,
        s625: !0,
        s626: !0,
        s627: !0,
        s628: !0,
        s629: !0,
        s630: !0,
        s631: !0,
        s632: !0,
        s633: !0,
        s634: !0,
        s635: !0,
        s636: !0,
        s637: !0,
        s638: !0,
        s639: !0,
        s640: !0,
        s641: !0,
        s642: !0,
        s643: !0,
        s644: !0,
        s645: !0,
        s646: !0,
        s647: !0,
        s648: !0,
        s649: !0,
        s650: !0,
        s651: !0,
        s652: !0,
        s653: !0,
        s654: !0,
        s655: !0,
        s656: !0,
        s657: !0,
        s658: !0,
        s659: !0,
        s660: !0,
        s661: !0,
        s662: !0,
        s663: !0,
        s664: !0,
        s665: !0,
        s666: !0,
        s667: !0,
        s668: !0,
        s669: !0,
        s670: !0,
        s671: !0,
        s672: !0,
        s673: !0,
        s674: !0,
        s675: !0,
        s676: !0,
        s677: !0,
        s678: !0,
        s679: !0,
        s680: !0,
        s681: !0,
        s682: !0,
        s683: !0,
        s684: !0,
        s685: !0,
        s686: !0,
        s687: !0,
        s688: !0,
        s689: !0,
        s690: !0,
        s691: !0,
        s692: !0,
        s693: !0,
        s694: !0,
        s695: !0,
        s696: !0,
        s697: !0,
        s698: !0,
        s699: !0,
        s700: !0,
        s701: !0,
        s702: !0,
        s703: !0,
        s704: !0,
        s705: !0,
        s706: !0,
        s707: !0,
        s708: !0,
        s709: !0,
        s710: !0,
        s711: !0,
        s712: !0,
        s713: !0,
        s714: !0,
        s715: !0,
        s716: !0,
        s717: !0,
        s718: !0,
        s719: !0,
        s720: !0,
        s721: !0,
        s722: !0,
        s723: !0,
        s724: !0,
        s725: !0,
        s726: !0,
        s727: !0,
        s728: !0,
        s729: !0,
        s730: !0,
        s731: !0,
        s732: !0,
        s733: !0,
        s734: !0,
        s735: !0,
        s736: !0,
        s737: !0,
        s738: !0,
        s739: !0,
        s740: !0,
        s741: !0,
        s742: !0,
        s743: !0,
        s744: !0,
        s745: !0,
        s746: !0,
        s747: !0,
        s748: !0,
        s749: !0,
        s750: !0,
        s751: !0,
        s752: !0,
        s753: !0,
        s754: !0,
        s755: !0,
        s756: !0,
        s757: !0,
        s758: !0,
        s759: !0,
        s760: !0,
        s761: !0,
        s762: !0,
        s763: !0,
        s764: !0,
        s765: !0,
        s766: !0,
        s767: !0,
        s768: !0,
        s769: !0,
        s770: !0,
        s771: !0,
        s772: !0,
        s773: !0,
        s774: !0,
        s775: !0,
        s776: !0,
        s777: !0,
        s778: !0,
        s779: !0,
        s780: !0,
        s781: !0,
        s782: !0,
        s783: !0,
        s784: !0,
        s785: !0,
        s786: !0,
        s787: !0,
        s788: !0,
        s789: !0,
        s790: !0,
        s791: !0,
        s792: !0,
        s793: !0,
        s794: !0,
        s795: !0,
        s796: !0,
        s797: !0,
        s798: !0,
        s799: !0
    }, defaultServer = defaultServerOptions[Math.floor(Math.random() * defaultServerOptions.length)], serverId = npServerIdFromUrl || defaultServer, corsOptions = {
        transports: [ "websocket" ]
    };
    npServerIdFromUrl ? servers[npServerIdFromUrl] ? (socket = io("https://" + npServerIdFromUrl + ".netflixparty.com/", corsOptions), 
    logMessage()) : (socket = io("https://netflixparty-server.herokuapp.com", corsOptions), 
    logMessage(), herokuSocket = !0) : (socket = io("https://" + defaultServer + ".netflixparty.com/", corsOptions), 
    logMessage());
    var userId = null;
    socket.on("userId", (function(data) {
        logMessage(JSON.stringify(data)), null === userId && (userId = data);
    }));
    var userAds = {}, usersPlayingAds = [];
    socket.on("updateActiveAd", (function(data) {
        var userAd;
        logMessage(JSON.stringify(data)), data.userAd && ((userAd = data.userAd).userId && (userAds[userAd.userId] = userAd, 
        usersPlayingAds.push(userAd.userId)));
    }));
    var oldIcons = [ "Batman.svg", "DeadPool.svg", "CptAmerica.svg", "Wolverine.svg", "IronMan.svg", "Goofy.svg", "Alien.svg", "Mulan.svg", "Snow-White.svg", "Poohbear.svg", "Sailormoon.svg", "Sailor Cat.svg", "Pizza.svg", "Cookie.svg", "Chocobar.svg", "hotdog.svg", "Hamburger.svg", "Popcorn.svg", "IceCream.svg", "ChickenLeg.svg" ], enableIconsetFunctions = {
        General: function() {
            return !0;
        },
        Christmas: function() {
            return 11 === (new Date).getMonth();
        },
        Halloween: function() {
            var date = new Date;
            return 9 === date.getMonth() && date.getDate() >= 24;
        },
        Thanksgiving: function() {
            var date = new Date;
            return 10 === date.getMonth() && date.getDate() >= 18 && date.getDate() <= 28 || 9 === date.getMonth() && date.getDate() >= 8 && date.getDate() <= 14;
        }
    }, newIcons = [ "General/Alien.svg", "General/Batman.svg", "General/ChickenLeg.svg", "General/Chocobar.svg", "General/Cookie.svg", "General/CptAmerica.svg", "General/DeadPool.svg", "General/Goofy.svg", "General/Hamburger.svg", "General/hotdog.svg", "General/IceCream.svg", "General/IronMan.svg", "General/Mulan.svg", "General/Pizza.svg", "General/Poohbear.svg", "General/Popcorn.svg", "General/Sailor Cat.svg", "General/Sailormoon.svg", "General/Snow-White.svg", "General/Wolverine.svg", "Christmas/angel.svg", "Christmas/bell.svg", "Christmas/box.svg", "Christmas/cane.svg", "Christmas/flake.svg", "Christmas/gingerbread.svg", "Christmas/gingerbread_F.svg", "Christmas/gingerbread_M.svg", "Christmas/gloves_blue.svg", "Christmas/gloves_red.svg", "Christmas/hat.svg", "Christmas/ornament.svg", "Christmas/raindeer.svg", "Christmas/reef.svg", "Christmas/santa_F.svg", "Christmas/santa_M.svg", "Christmas/snowglobe.svg", "Christmas/snowman.svg", "Christmas/sock.svg", "Christmas/tree.svg", "Halloween/bats.svg", "Halloween/candy_corn.svg", "Halloween/cat_black.svg", "Halloween/cat_white.svg", "Halloween/coffin.svg", "Halloween/eye_ball.svg", "Halloween/face_angry.svg", "Halloween/face_evil.svg", "Halloween/face_silly.svg", "Halloween/face_smile.svg", "Halloween/frankenstein.svg", "Halloween/ghost_F.svg", "Halloween/ghost_M.svg", "Halloween/gravestone.svg", "Halloween/lollipop.svg", "Halloween/moon.svg", "Halloween/mummy.svg", "Halloween/potion.svg", "Halloween/pumpkin.svg", "Halloween/pumpkin_witch.svg", "Halloween/skull_brain.svg", "Halloween/skull_candy.svg", "Halloween/skull_girl.svg", "Halloween/witch_hat.svg", "Thanksgiving/acorn.svg", "Thanksgiving/bread.svg", "Thanksgiving/candles.svg", "Thanksgiving/corn.svg", "Thanksgiving/drinks.svg", "Thanksgiving/maple_leaf.svg", "Thanksgiving/plate_chicken.svg", "Thanksgiving/pumpkin.svg", "Thanksgiving/pumpkin_pie.svg", "Thanksgiving/slice_pie.svg", "Thanksgiving/sun_flower.svg", "Thanksgiving/turkey_face.svg" ], iconMap = {
        General: [ "Alien.svg", "Batman.svg", "ChickenLeg.svg", "Chocobar.svg", "Cookie.svg", "CptAmerica.svg", "DeadPool.svg", "Goofy.svg", "Hamburger.svg", "hotdog.svg", "IceCream.svg", "IronMan.svg", "Mulan.svg", "Pizza.svg", "Poohbear.svg", "Popcorn.svg", "Sailor Cat.svg", "Sailormoon.svg", "Snow-White.svg", "Wolverine.svg" ],
        Christmas: [ "angel.svg", "bell.svg", "box.svg", "cane.svg", "flake.svg", "gingerbread.svg", "gingerbread_F.svg", "gingerbread_M.svg", "gloves_blue.svg", "gloves_red.svg", "hat.svg", "ornament.svg", "raindeer.svg", "reef.svg", "santa_F.svg", "santa_M.svg", "snowglobe.svg", "snowman.svg", "sock.svg", "tree.svg" ],
        Halloween: [ "bats.svg", "candy_corn.svg", "cat_black.svg", "cat_white.svg", "coffin.svg", "eye_ball.svg", "face_angry.svg", "face_evil.svg", "face_silly.svg", "face_smile.svg", "frankenstein.svg", "ghost_F.svg", "ghost_M.svg", "gravestone.svg", "lollipop.svg", "moon.svg", "mummy.svg", "potion.svg", "pumpkin.svg", "pumpkin_witch.svg", "skull_brain.svg", "skull_candy.svg", "skull_girl.svg", "witch_hat.svg" ],
        Thanksgiving: [ "acorn.svg", "bread.svg", "candles.svg", "corn.svg", "drinks.svg", "maple_leaf.svg", "plate_chicken.svg", "pumpkin.svg", "pumpkin_pie.svg", "slice_pie.svg", "sun_flower.svg", "turkey_face.svg" ]
    }, defaultIcon = oldIcons[Math.floor(Math.random() * oldIcons.length)], iconsInUse = [], userIcons = {}, userNicknames = {}, nicknamesInUse = [], userSettings = {}, addIconButton = function(iconPath, iconHolder) {
        jQuery(`\n        <a class="image-button">\n          <img class="img-class" src='${chrome.runtime.getURL("img/icons/" + iconPath)}'>\n        </a>\n    `).appendTo(iconHolder).data("icon", iconPath);
    }, getUserIconURL = function(userId, userIcon) {
        if (userIcons[userId]) return userIcons[userId];
        var iconURL = null;
        if (userIcon) if (userIcon.includes("?newIconUrl=")) {
            var parsedIcon = userIcon.split("?newIconUrl=")[1], oldIcon = userIcon.split("?newIconUrl=")[0];
            newIcons.includes(parsedIcon) ? iconURL = chrome.runtime.getURL("img/icons/" + parsedIcon) : oldIcons.includes(oldIcon) && (iconURL = chrome.runtime.getURL("img/icons/General/" + oldIcon));
        } else newIcons.includes(userIcon) ? iconURL = chrome.runtime.getURL("img/icons/" + userIcon) : oldIcons.includes(userIcon) && (iconURL = chrome.runtime.getURL("img/icons/General/" + userIcon));
        if (null == iconURL && (iconURL = chrome.runtime.getURL("img/icons/General/" + oldIcons[Math.floor(Math.random() * oldIcons.length)]), 
        iconsInUse.length < iconMap.General.length)) for (;iconsInUse.hasOwnProperty(iconURL); ) iconURL = chrome.runtime.getURL("img/icons/General/" + oldIcons[Math.floor(Math.random() * oldIcons.length)]);
        return userIcons[userId] = iconURL, iconsInUse.push(iconURL), userIcons[userId];
    }, setUserIcon = function(userId, userIcon, saveToChrome) {
        userIcon = escapeStr(userIcon), userIcons[userId];
        if (saveToChrome) {
            if (userIcon.includes("/")) {
                var iconName = userIcon.split("/")[1];
                oldIcons.includes(iconName) ? (userIcon = `${iconName}?newIconUrl=${userIcon}`, 
                defaultIcon = iconName) : userIcon = `${defaultIcon}?newIconUrl=${userIcon}`;
            }
            chrome.storage.local.set({
                userIcon
            }, (function(data) {
                chrome.runtime.lastError ? console.log(chrome.runtime.lastError.message) : (console.log("set user icon chrome storage data: " + JSON.stringify(data)), 
                console.log("userIcon saved into settings chrome storage: " + userIcon));
            })), userSettings.userIcon = userIcon, console.log("new user settings after set user icon: " + JSON.stringify(userSettings)), 
            socket.emit("broadcastUserSettings", {
                userSettings
            }, (function() {}));
        }
        var iconURL = "";
        if (userIcon.includes("?newIconUrl=")) {
            var parsedIcon = userIcon.split("?newIconUrl=")[1], oldIcon = userIcon.split("?newIconUrl=")[0];
            newIcons.includes(parsedIcon) ? iconURL = chrome.runtime.getURL("img/icons/" + parsedIcon) : oldIcons.includes(oldIcon) && (iconURL = chrome.runtime.getURL("img/icons/General/" + oldIcon));
        } else newIcons.includes(userIcon) ? iconURL = chrome.runtime.getURL("img/icons/" + userIcon) : oldIcons.includes(userIcon) && (iconURL = chrome.runtime.getURL("img/icons/General/" + userIcon));
        if (null == iconURL && (iconURL = chrome.runtime.getURL("img/icons/General/" + oldIcons[Math.floor(Math.random() * oldIcons.length)]), 
        iconsInUse.length < iconMap.General.length)) for (;iconsInUse.hasOwnProperty(iconURL); ) iconURL = chrome.runtime.getURL("img/icons/General/" + oldIcons[Math.floor(Math.random() * oldIcons.length)]);
        userIcons[userId] = iconURL, iconsInUse.push(iconURL), logIcons(), renderSidebar();
    }, setUserNickname = function(userId, userNickname, saveToChrome) {
        userNicknames[userId];
        saveToChrome && (chrome.storage.local.set({
            userNickname
        }, (function(data) {
            chrome.runtime.lastError ? logMessage(chrome.runtime.lastError.message) : (logMessage(JSON.stringify(data)), 
            chrome.storage.local.get([ "userNickname" ], (function(result) {
                logMessage(result.key);
            })), logMessage());
        })), userSettings.userNickname = userNickname, logMessage(JSON.stringify(userSettings)), 
        socket.emit("broadcastUserSettings", {
            userSettings
        }, (function() {}))), userNicknames[userId] = userNickname, nicknamesInUse.push(userNickname), 
        renderSidebar();
    };
    chrome.storage.onChanged.addListener((function(changes, areaName) {
        logMessage((JSON.stringify(changes), JSON.stringify(areaName)));
    }));
    var renderSidebar = function() {
        var userIconURL = getUserIconURL(userSettings.userId, userSettings.userIcon);
        jQuery("#user-icon img").attr("src", userIconURL), jQuery(".user-icon img").attr("src", userIconURL);
        for (var msgs = jQuery(".msg"), i = 0; i < msgs.length; i++) if (jQuery(msgs[i]).data("permId") && jQuery(msgs[i]).data("userIcon") && userIcons[jQuery(msgs[i]).data("permId")] != jQuery(msgs[i]).data("userIcon") && (jQuery(msgs[i]).find("img").attr("src", userIcons[jQuery(msgs[i]).data("permId")]), 
        jQuery(msgs[i]).data("userIcon", userIcons[jQuery(msgs[i]).data("permId")])), jQuery(msgs[i]).data("permId") && "" == jQuery(msgs[i]).data("userNickname") && userNicknames[jQuery(msgs[i]).data("permId")] != jQuery(msgs[i]).data("userNickname") && userNicknames[jQuery(msgs[i]).data("permId")]) {
            var message = jQuery(msgs[i]).data("message"), permId = jQuery(msgs[i]).data("permId"), userIcon = userIcons[jQuery(msgs[i]).data("permId")], userNickname = userNicknames[jQuery(msgs[i]).data("permId")], nicknameMessage = jQuery(`\n                <div class="msg-container">\n                    <div class="icon-name">\n                      <div class="icon">\n                        <img src="${jQuery(msgs[i]).data("userIcon")}">\n                      </div>\n                    </div>\n                    <div class="msg-txt message${message.isSystemMessage ? "-system" : "-txt"}">\n                                  <h3>${userNicknames[jQuery(msgs[i]).data("permId")].replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h3>\n                      <p>${message.body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>\n                    </div>\n                  </div>\n              `);
            jQuery(msgs[i]).replaceWith(nicknameMessage), jQuery(nicknameMessage).data("permId", permId).data("userIcon", userIcon).data("userNickname", userNickname);
        }
        for (msgs = jQuery(".msg-container"), i = 0; i < msgs.length; i++) jQuery(msgs[i]).data("permId") && jQuery(msgs[i]).data("userIcon") && userIcons[jQuery(msgs[i]).data("permId")] != jQuery(msgs[i]).data("userIcon") && (jQuery(msgs[i]).find("img").attr("src", userIcons[jQuery(msgs[i]).data("permId")]), 
        jQuery(msgs[i]).data("userIcon", userIcons[jQuery(msgs[i]).data("permId")])), jQuery(msgs[i]).data("permId") && jQuery(msgs[i]).data("userNickname") && userNicknames[jQuery(msgs[i]).data("permId")] != jQuery(msgs[i]).data("userNickname") && userNicknames[jQuery(msgs[i]).data("permId")] && (jQuery(msgs[i]).find("h3").text(userNicknames[jQuery(msgs[i]).data("permId")]), 
        jQuery(msgs[i]).data("userNickname", userNicknames[jQuery(msgs[i]).data("permId")]));
    }, logIcons = function() {
        logMessage(JSON.stringify(iconsInUse)), logMessage(JSON.stringify(userIcons));
    };
    socket.on("updateSettings", (function(data) {
        logMessage(JSON.stringify(data)), data.userSettings.userIcon && setUserIcon(data.userSettings.userId, data.userSettings.userIcon, !1), 
        data.userSettings.userNickname && setUserNickname(data.userSettings.userId, data.userSettings.userNickname, !1);
    }));
    var sessionStartTime, messages = [], unreadCount = 0, originalTitle = document.title, messagesCount = 0, interactionsCount = 0, summarySent = !1, typingTimer = null, video = (hboDivs = jQuery("div"), 
    jQuery(hboDivs.find("[style*='overflow: hidden']")[0]), null), resizeListener = function() {
        delay(100)().then((function() {
            isChatVisible && (document.webkitIsFullScreen ? jQuery("video").width(window.innerWidth) : jQuery("video").width(window.innerWidth - 288));
        }));
    }, playItem = null, videoTimeOffset = 0, nodeListener = function(evt) {
        "PlayItem" == evt.detail.type ? (playItem = evt.detail.playItem, evt.detail.updatedAt, 
        videoTimeOffset = 1e3 * evt.detail.videoTimeOffset, videoDuration = evt.detail.videoDuration) : "ManualClick" == evt.detail.type && (clickAtProgress(video, "0.5", "mousedown"), 
        clickAtProgress(video, "0.5", "mouseup"));
    };
    window.nodeScriptLoaded || injectScript("\n    window.videoNodeEnabled = true;\n    if (!window.nodeScriptLoaded) {\n      console.log(\"VIDEO NODE SCRIPT\")\n      window.nodeScriptLoaded = true;\n      window.addEventListener('tpVideoNode', function(evt) {\n          var type = evt.detail.type;\n          var video = document.querySelector('video');\n          if (type === 'seek') {\n              if (video) {\n                  if (video._dispNode.position != null) {\n                    video._dispNode.position = evt.detail.time;\n                  }else {\n                    video.currentTime = evt.detail.time;\n                  }\n              }\n          }else if (type === 'pause') {\n              if (video) {\n                if (video._dispNode.pause != null) {\n                  video._dispNode.pause();\n                }else {\n                  var evt = new CustomEvent('FromNode', {detail: {type: 'ManualClick'}});\n                  window.dispatchEvent(evt);\n                }\n              }\n          }else if (type === 'play') {\n              if (video) {\n                if (video._dispNode.play != null) {\n                  video._dispNode.play();\n                }else {\n                  var evt = new CustomEvent('FromNode', {detail: {type: 'ManualClick'}});\n                  window.dispatchEvent(evt);\n                }\n              }\n          }else if(type == 'getPlayItem') {\n              if(video == null || video.src == \"\" || video.readyState < 4 || video._dispNode == null || video._dispNode._playItem == null) {\n                // console.log('Invalid VIDEO in GETPLAYITEM');\n                // console.log(video.src);\n              } else {\n                  var playItem = video._dispNode._playItem;\n                  var videoDuration = video._dispNode.lastSeekablePosition * 1000;\n                  var videoTimeOffset = video.currentTime - video._dispNode._player._currentPosition;\n                  var evt = new CustomEvent('FromNode', {detail: {type: 'PlayItem', playItem: playItem, videoTimeOffset: videoTimeOffset, videoDuration: videoDuration, updatedAt: new Date().getTime()}});\n                  window.dispatchEvent(evt);\n              }\n          }else if(type == 'trigger') {\n            console.log(\"trigger marker request\");\n            if(document.querySelector('video') && document.querySelector('video')._dispNode && document.querySelector('video')._dispNode.position) {\n              console.log(\"triggered\");\n              document.querySelector('video')._dispNode.position = document.querySelector('video')._dispNode.position + 0.1;\n            }\n          }\n      });\n    }\n  "), 
    jQuery(document).on("webkitfullscreenchange mozfullscreenchange fullscreenchange MSFullscreenChange", (function() {
        if (console.log("Full Screen Changed"), sessionId && 0 != jQuery("video").length && isChatVisible) {
            var divWith = jQuery("div").width(), modifiedWith = divWith - 288;
            document.webkitIsFullScreen ? jQuery("video").width(divWith) : jQuery("video").width(modifiedWith);
        }
    })), window.addEventListener("FromNode", nodeListener), window.addEventListener("resize", resizeListener), 
    window.document.addEventListener("webkitfullscreenchange", resizeListener);
    var getPartyUrl = function() {
        return "https://www.tele.pe/hbomax/" + encodeURIComponent(sessionId) + "?s=" + encodeURIComponent(serverId);
    }, isChatVisible = (typingTimer = null, !0), linkIconListener = function(e) {
        if (sessionId && serverId) {
            const el = document.createElement("textarea");
            el.value = getPartyUrl(), document.body.appendChild(el), el.select(), document.execCommand("copy"), 
            document.body.removeChild(el);
        }
    }, userIconListener = function(e) {
        logMessage(), toggleIconContainer();
    }, largeUserIconListener = function(e) {
        toggleLargeUserIconButton();
    }, userIconSelectorListener = function(e) {
        jQuery(this).data("icon") && (console.log("userIconSelector button clicked: " + jQuery(this).data("icon")), 
        setUserIcon(userSettings.userId, jQuery(this).data("icon"), !0)), toggleIconContainer();
    }, saveChangesListener = function(e) {
        var nicknameText = jQuery(".nickname-input input").val().slice(0, 25).replace(/^\s+|\s+$/g, "");
        "" != nicknameText && (console.log("saveChanges button clicked: " + nicknameText), 
        setUserNickname(userSettings.userId, nicknameText, !0)), toggleIconContainer();
    }, onNicknameKeyPressed = function(e) {
        e.stopPropagation(), console.log("Stoped");
    }, onChatKeyPressed = function(e) {
        if (e.stopPropagation(), 13 === e.which) {
            const body = jQuery("#chat-input").val().replace(/^\s+|\s+$/g, "");
            "" !== body && (null !== typingTimer && (clearTimeout(typingTimer), typingTimer = null, 
            socket.emit("typing", {
                typing: !1
            }, (function() {}))), jQuery("#chat-input").prop("disabled", !0), socket.emit("sendMessage", {
                body
            }, (function() {
                jQuery("#chat-input").val("").prop("disabled", !1).focus();
            })));
        } else null === typingTimer ? socket.emit("typing", {
            typing: !0
        }, (function() {})) : clearTimeout(typingTimer), typingTimer = setTimeout((function() {
            typingTimer = null, socket.emit("typing", {
                typing: !1
            }, (function() {}));
        }), 500);
    }, chatClicked = function(e) {
        e.stopPropagation();
    }, setupChatHandlers = function() {
        jQuery(".user-icon").click(largeUserIconListener), jQuery("#user-icon").click(userIconListener), 
        jQuery("#link-icon").click(linkIconListener), jQuery("#chat-wrapper").mouseup(chatClicked), 
        Object.keys(iconMap).forEach((function(categoryName) {
            if (enableIconsetFunctions[categoryName]()) {
                var icons = iconMap[categoryName], iconHolder = jQuery('\n            <ul id="icon-holder"></ul>\n          ');
                for (var icon of icons) addIconButton(`${categoryName}/${icon}`, iconHolder);
                var categorySection = jQuery(`\n            <div class="icon-holder-wrap">\n              <p class="extension-txt-indicator">${categoryName}</p>\n            </div>\n          `);
                iconHolder.appendTo(categorySection), categorySection.appendTo(jQuery("#icon-holder-template"));
            }
        })), jQuery(".image-button").click(userIconSelectorListener), jQuery("#chat-input").keyup(onChatKeyPressed), 
        jQuery(".btns button").click(saveChangesListener), jQuery("#chat-input-container").click((() => jQuery("#chat-input").focus())), 
        jQuery("#nickname-input").click((() => jQuery("#nickname-input").focus())), jQuery("#nickname-edit").keyup(onNicknameKeyPressed);
    }, coverCheckRunning = !1, onCoverChanged = async function() {
        if (!coverCheckRunning && !changingVideo) {
            coverCheckRunning = !0;
            try {
                await delayUntil(removeVideoCover, 2500)(), await delay(500)(), changingVideo || (pushTask(skipPromo), 
                pushTask(sync));
            } catch (e) {} finally {
                coverCheckRunning = !1;
            }
        }
    };
    const coverObserver = new MutationObserver((function(mutationsList, observer) {
        onCoverChanged();
    }));
    const upNextObserver = new MutationObserver((function(mutationsList, observer) {
        !async function() {
            console.log("onUpNextChanged called"), getUpNextButton() && (getUpNextButton().style.left = isChatVisible ? "-250px" : "10px", 
            getUpNextButton().addEventListener("mousedown", (async function() {
                console.log("upNextClick"), upNextClick = !0, changingVideo = !0, await clickUpNext(0);
            })));
        }();
    }));
    var getUpNextButton = function() {
        return document.querySelector("[aria-label*='Up Next']");
    }, onFullScreen = function() {
        console.log("full screen click"), document.documentElement.webkitRequestFullScreen(document.documentElement.ALLOW_KEYBOARD_INPUT), 
        setTimeout((() => {
            const video = document.querySelector("video");
            null != video && (video.style.width = window.innerWidth - 288 + "px");
        }), 400);
    }, tryFixFullScreen = function() {
        delay(400)().then((() => {
            const fs = document.querySelector("[aria-label*='Full screen']");
            fs ? (fs.removeEventListener("mousedown", onFullScreen), fs.addEventListener("mousedown", onFullScreen), 
            console.log("Fullscreen fixed")) : (setTimeout(tryFixFullScreen, 5e3), console.log("Can't find fullscreen button, trying again"));
        }));
    }, initChat = function() {
        tryFixFullScreen(), 0 === jQuery("#chat-wrapper").length ? (!function() {
            var hboDivs = jQuery("div"), summaryWrapper = jQuery(hboDivs.find("[style*='user-select']")[0]).next();
            jQuery("body").append(chatHtml2), summaryWrapper.hide();
        }(), setupChatHandlers()) : jQuery("#chat-history").html("");
        var playCover = null;
        jQuery("[style*='btn_play_large_initial']").length ? playCover = document.querySelector("[style*='btn_play_large_initial']") : jQuery("[style*='icn_tile_play_max_large_3']").length && (playCover = document.querySelector("[style*='icn_tile_play_max_large_3']")), 
        playCover && coverObserver.observe(playCover, {
            childList: !0,
            characterData: !0,
            attributes: !0,
            subtree: !0
        });
        var upNextWrapper = null;
        dismissControls = document.querySelector("[aria-label*='Dismiss']"), subtitleControls = document.querySelector("[aria-label*='Subtitles']"), 
        dismissControls ? upNextWrapper = dismissControls.parentElement.parentElement.lastElementChild : subtitleControls && (upNextWrapper = subtitleControls.parentElement.parentElement.parentElement.parentElement.parentElement.lastElementChild), 
        upNextWrapper ? upNextObserver.observe(upNextWrapper, {
            childList: !0
        }) : console.log("Couldn't find up next wrapper"), jQuery("#presence-indicator").data("typing", !1), 
        jQuery("#presence-indicator").data("buffering", !1), setPresenceVisible(!1);
    }, getChatVisible = function() {
        return jQuery("#chat-wrapper").is(":visible");
    }, setChatVisible = (isChatVisible = !0, function(visible) {
        isChatVisible = visible, visible ? (jQuery("video").width(window.innerWidth - 288), 
        jQuery("#chat-wrapper").show(), document.hasFocus() || clearUnreadCount(), getUpNextButton() && (getUpNextButton().style.left = isChatVisible ? "-250px" : "10px")) : (jQuery("video").width(window.innerWidth), 
        jQuery("#chat-wrapper").hide(), jQuery(window).trigger("resize"), getUpNextButton() && (getUpNextButton().style.left = isChatVisible ? "-250px" : "10px"));
    }), toggleIconContainer = function() {
        jQuery("#chat-icon-container").data("active") ? (jQuery("#chat-icon-container").data("active", !1), 
        jQuery("#chat-icon-container").hide(), jQuery(".chat-settings-container").hide(), 
        jQuery("#chat-history-container").show(), jQuery("#chat-input-container").show(), 
        jQuery("#teleparty-blog-container").show(), jQuery("#presence-indicator").show(), 
        jQuery("#chat-header-container").removeClass("chat-header-container-active")) : (jQuery("#chat-icon-container").data("active", !0), 
        jQuery(".chat-settings-container").show(), jQuery("#chat-icon-container").hide(), 
        jQuery("#chat-link-container").hide(), jQuery("#chat-history-container").hide(), 
        jQuery("#chat-input-container").hide(), jQuery("#teleparty-blog-container").hide(), 
        jQuery("#presence-indicator").hide());
    }, toggleLargeUserIconButton = function() {
        jQuery("#chat-icon-container").data("active") && (jQuery("#chat-icon-container").show(), 
        jQuery(".chat-settings-container").hide(), jQuery("#chat-header-container").addClass("chat-header-container-active"));
    }, setPresenceVisible = function(visible) {
        jQuery("#presence-indicator").data("typing", visible), setPresenceText();
    }, setPresenceText = function() {
        var typing = jQuery("#presence-indicator").data("typing"), buffering = jQuery("#presence-indicator").data("buffering"), startVideoData = jQuery("#presence-indicator").data("startVideo");
        logMessage(), startVideoData ? jQuery("#presence-indicator").text("Loading: Play video to start party...") : typing && buffering ? jQuery("#presence-indicator").text("People are typing and buffering...") : typing ? jQuery("#presence-indicator").text("People are typing...") : buffering ? jQuery("#presence-indicator").text("People are buffering...") : jQuery("#presence-indicator").text("");
    }, addMessage = function(message, firstTime) {
        if (!message.isSystemMessage || "left" !== message.body || (console.log("trying to add left message"), 
        message.userIcon)) {
            firstTime && message.isSystemMessage && message.body.indexOf("updated their user icon") > -1 && (message.userIcon && setUserIcon(message.permId, message.userIcon, !1), 
            message.userNickname && setUserNickname(message.permId, message.userNickname, !1)), 
            messages.push(message);
            var userIcon = message.userIcon ? getUserIconURL(message.permId, message.userIcon) : getUserIconURL(message.permId), userNickname = message.userNickname ? function(userId, userNickname) {
                return userNicknames[userId] ? userNicknames[userId] : userNickname ? (userNicknames[userId] = userNickname, 
                nicknamesInUse.push(userNickname), userNicknames[userId]) : void 0;
            }(message.permId, message.userNickname) : "";
            if ("" == userNickname) message = jQuery(`\n            <div class="msg">\n              <div class="icon">\n                <img src="${escapeStr(userIcon)}"/>\n              </div>\n              <div class="message${message.isSystemMessage ? "-system" : "-txt"}">\n                <p class="msg-nickname">${userNickname.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>\n                <p>${message.body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>\n              </div>\n            </div>\n        `).appendTo(jQuery("#chat-history")).data("permId", message.permId).data("userIcon", userIcon).data("userNickname", userNickname).data("message", message); else jQuery(`\n          <div class="msg-container">\n              <div class="icon-name">\n                <div class="icon">\n                  <img src="${escapeStr(userIcon)}">\n                </div>\n              </div>\n              <div class="msg-txt message${message.isSystemMessage ? "-system" : "-txt"}">\n                <h3>${userNickname.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</h3>\n                <p>${message.body.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>\n              </div>\n            </div>\n        `).appendTo(jQuery("#chat-history")).data("permId", message.permId).data("userIcon", userIcon).data("userNickname", userNickname);
            jQuery("#chat-history").scrollTop(jQuery("#chat-history").prop("scrollHeight")), 
            unreadCount += 1, messagesCount += 1, document.hasFocus() || (document.title = "(" + String(unreadCount) + ") " + originalTitle);
        }
    }, clearUnreadCount = function() {
        unreadCount > 0 && (unreadCount = 0, document.title = originalTitle);
    };
    function logSummary() {
        try {
            if (permId && sessionStartTime && sessionId && videoId && !summarySent) {
                var data = {
                    userId: permId,
                    sessionId,
                    messagesCount,
                    interactionsCount,
                    duration: new Date - sessionStartTime,
                    videoId,
                    videoDuration
                };
                logMessage(JSON.stringify(data)), chrome.runtime.sendMessage({
                    summary: data
                }, (function(response) {
                    logMessage();
                })), summarySent = !0;
            }
        } catch (e) {
            logMessage();
        }
    }
    jQuery(window).focus((function() {
        getChatVisible() && clearUnreadCount();
    }));
    var unloadInteraction = function(event) {
        logSummary();
    };
    window.addEventListener("unload", unloadInteraction, !0);
    var simulClick = !1;
    function loadNewVideo() {
        var start = performance.now();
        return new Promise((async function(resolve, reject) {
            console.log("Loading new Video");
            var interval = setInterval((() => {
                if (videoId === nextEpisodeId) {
                    console.log("Video Ids match");
                    var videoElement = document.querySelector("video");
                    null != videoElement && videoElement instanceof Element && (console.log("Loaded new video"), 
                    clearInterval(interval), Promise.resolve().then(delayUntil(isVideoReady, 1 / 0)).then(skipPromo).then((() => {
                        lastUpdateEvent.getTime() <= videoChangeStartTime.getTime() ? (pushTask(broadcast), 
                        pushTask(waitTillUpdate), console.log("PUSHING BORADSFSAF NEXT EPISODE")) : (console.log("Not pushing broadcast"), 
                        pushTask(sync)), onCanPlay(), changingVideo = !1, simulClick = !1, setChatVisible(isChatVisible), 
                        videoTitle = getVideoTitle(), console.log("CHANGE EPISODE OVER"), resolve();
                    })));
                } else parseVideoId == nextEpisodeId && (console.log("Using parsed id"), videoId = parseVideoId);
                performance.now() - start >= 15e3 && (clearInterval(interval), logMessage(), showButtonMessage(failedNextEpisodeModal, getPartyUrl()), 
                teardown(), reject("Could not load new video in time."));
            }), 100);
        }));
    }
    var clickAtProgress = function(target, progress, eventType) {
        const {width, height, left, top} = target.getBoundingClientRect(), x = left + width * progress, y = top + height / 2;
        var clickEvent = document.createEvent("MouseEvents");
        clickEvent.initMouseEvent(eventType, !0, !0, window, 0, 0, 0, x, y, !1, !1, !1, !1, 0, null), 
        target.dispatchEvent(clickEvent);
    }, clickUpNext = function(attempts) {
        return new Promise((async (resolve, reject) => {
            console.log("CLICK UP NEXT CALLED: " + getVideoTitle()), jQuery("video")[0].currentTime = videoDuration, 
            resolve();
        }));
    }, continueNextEpisode = function() {
        return new Promise((async function(resolve, reject) {
            if (uiEventsHappening += 1, changingVideo) console.log("Video already changing, no need to click."); else if (changingVideo = !0, 
            videoId !== nextEpisodeId) try {
                await clickUpNext(0);
            } catch (error) {
                console.log("Click next episode failed, but we will wait and see if the vidoe changes in time.");
            }
            pushTask(loadNewVideo), resolve(), uiEventsHappening -= 1;
        }));
    };
    socket.on("jumpToNextEpisode", (data => {
        console.log("Received next episode event from server"), videoChangeStartTime = new Date((new Date).getTime() - localTimeMinusServerTimeMedian), 
        nextEpisodeId = data.nextEpisode, simulClick = !0, pushTask(continueNextEpisode);
    }));
    logMessage(window.replaceScriptLoaded), window.replaceScriptLoaded || (logMessage(), 
    injectScript('\n      if(!window.replaceScriptLoaded) {\n      \t  console.log("loaded script");\n      \t  window.replaceScriptLoaded = true;\n\t      (function(history){\n\t        var replaceState = history.replaceState;\n\t        history.replaceState = function(state) {\n\t          if (typeof history.onreplacestate == "function") {\n\t            history.onreplacestate({state: state});\n\t          }\n\t          return replaceState.apply(history, arguments);\n\t        }\n\t      })(window.history);\n\n\t      var popInteraction = function(e) {\n          // send message to content script w next episode\n          window.postMessage({ type: "FROM_PAGE_POP", text: "next episode from the webpage!"}, "*");\n        }\n  \n        var reloadInteraction = function(e) {\n          // send message to content script w next episode\n          window.postMessage({ type: "FROM_PAGE", text: "next episode from the webpage!"}, "*");\n        }\n        window.onpopstate = popInteraction;\n        history.onreplacestate = history.onpushstate = reloadInteraction;\n      }\n    '));
    var replaceStateInteraction = function(event) {
        if (event.source == window) if (event.data.type && "FROM_PAGE_POP" == event.data.type) teardown(); else if (event.data.type && "FROM_PAGE" == event.data.type) {
            if (console.log("Replace Called: " + JSON.stringify(event)), replaceRunning) return void console.log("REPLACE CALLED TWICE " + JSON.stringify(event));
            replaceRunning = !0, logMessage(), logMessage(event.data.text);
            var episodePage = "none" !== getHBOVideoType(window.location.href);
            if (logMessage(window.location.href), !episodePage || window.location.href.indexOf("page:home") > -1) logMessage(), 
            teardown(); else {
                if ("episode" !== videoType || "episode" !== getHBOVideoType(window.location.href)) return showButtonMessage(changingVideo ? invalidNextEpisodeModal : wrongScreenModal, getPartyUrl()), 
                void teardown();
                if ((changingVideo || simulClick) && !upNextClick) return void (replaceRunning = !1);
                changingVideo = !0, upNextClick = !1;
                var currentTitle = getVideoTitle();
                Promise.resolve().then(delayUntil(isVideoReady, 1 / 0)).then(delayUntil((() => null != (currentTitle = getVideoTitle()) && currentTitle !== videoTitle && (console.log("New current Title: " + currentTitle), 
                videoTitle = currentTitle, !0)), 1e4)).then(delayUntil(isVideoReady, 1 / 0)).then(updateVideoId).then((() => {
                    videoId != nextEpisodeId ? (console.log("Sent next episode"), socket.emit("nextEpisode", {
                        nextEpisode: videoId,
                        simulClick: !1,
                        otherEpisode: !1
                    }, (function(data) {
                        null != data && null != data.errorMessage && "Locked Session" == data.errorMessage ? delayUntil((function() {
                            return nextEpisodeId == videoId;
                        }), 5e3)().catch((err => {
                            showButtonMessage(ownerOnlyNextEpisodeModal, getPartyUrl()), teardown();
                        })) : null != data && null != data.errorMessage && teardown();
                    }))) : console.log("Did not sendNextEpisode");
                })).catch((err => {
                    console.log(err), videoId !== nextEpisodeId ? (showButtonMessage(changingVideo ? failedNextEpisodeModal : invalidNextEpisodeModal, getPartyUrl()), 
                    replaceRunning = !1, teardown()) : changingVideo = !1;
                })), replaceRunning = !1;
            }
        }
    };
    window.addEventListener("message", replaceStateInteraction, !1);
    jQuery(".button-nfplayerNextEpisode").click((function(e) {
        logMessage();
    })), jQuery(document).on("click", ".nfp-episode-preview.expanded.can-play", (function() {
        logMessage(), !0;
    }));
    var episodeDataInteraction = function(event) {
        if (event.source == window && event.data.type && "EPISODE_ID" == event.data.type) {
            if (event.data.videoIds) try {
                JSON.parse(event.data.videoIds);
            } catch (e) {
                console.error("Parse Error");
            }
            event.data.videoId && (parseVideoId = event.data.videoId, markerUpdatedAt = (new Date).getTime());
        }
    };
    window.addEventListener("message", episodeDataInteraction, !1);
    var onVideoChange = function() {
        logMessage(), hostOnly ? pushTask(sync) : uiEventsHappening <= 0 && sessionId && !changingVideo && pushTask(broadcast);
    }, removeVideoCover = function() {
        if (jQuery("[style*='btn_play_large_initial']").length && jQuery("[style*='btn_play_large_initial']").is(":visible")) jQuery("[style*='btn_play_large_initial']").addClass("startPlay"); else {
            if (!jQuery("[style*='icn_tile_play_max_large_3']").length || !jQuery("[style*='icn_tile_play_max_large_3']").is(":visible")) return !1;
            jQuery("[style*='icn_tile_play_max_large_3']").addClass("startPlay");
        }
        var startPlay = document.querySelector(".startPlay");
        return !!startPlay && (console.log("Removing play cover"), clickAtProgress(startPlay, "0.5", "mousedown"), 
        clickAtProgress(startPlay, "0.5", "mouseup"), !0);
    }, getVideoTitle = function() {
        try {
            if (window.location.href.includes("hbomax")) return document.querySelector('[role="heading"]').innerText;
        } catch (e) {
            return;
        }
    }, triggerEpisodeId = function(attempts) {
        return new Promise((async (resolve, reject) => {
            try {
                var startTime = (new Date).getTime();
                const playEvent = new CustomEvent("tpVideoNode", {
                    detail: {
                        type: "trigger"
                    }
                });
                window.dispatchEvent(playEvent), await delayUntil((() => null != markerUpdatedAt && markerUpdatedAt > startTime || null == videoId && null != parseVideoId), 4e3)(), 
                videoId = parseVideoId, console.log("Got Marker episode ID: " + videoId), resolve();
            } catch (e) {
                if (attempts < 5) {
                    console.log("Attempting trigger again");
                    try {
                        await triggerEpisodeId(attempts + 1), resolve();
                    } catch (err) {
                        reject();
                    }
                } else reject();
            }
        }));
    }, updateVideoId = function() {
        return new Promise((async (resolve, reject) => {
            try {
                console.log("Trying to update Video iD"), await delayUntil((() => parseVideoId != videoId && (videoId = parseVideoId, 
                !0)), 1e4)(), console.log("UPDATED VIDEO ID: " + videoTitle + "|" + videoId), resolve();
            } catch (e) {
                reject("Couldn't get new videoId in time.");
            }
        }));
    }, sessionId = null, lastKnownTime = null, lastKnownTimeUpdatedAt = null, lastUpdateEvent = null, ownerId = null, hostOnly = !1, state = null, videoId = null, parseVideoId = null, nextEpisodeId = null, markerUpdatedAt = null, videoTitle = null, videoType = null, videoDuration = null, videoChangeStartTime = null, roundTripTimeRecent = (window.location.href, 
    []), roundTripTimeMedian = 0, localTimeMinusServerTimeRecent = [], localTimeMinusServerTimeMedian = 0, ping = function() {
        return new Promise((function(resolve, reject) {
            var startTime = (new Date).getTime();
            socket.emit("getServerTime", {
                version: null
            }, (function(serverTime) {
                var now = new Date;
                shove(roundTripTimeRecent, now.getTime() - startTime, 5), roundTripTimeMedian = median(roundTripTimeRecent), 
                shove(localTimeMinusServerTimeRecent, now.getTime() - Math.round(roundTripTimeMedian / 2) - new Date(serverTime).getTime(), 5), 
                localTimeMinusServerTimeMedian = median(localTimeMinusServerTimeRecent);
            })), resolve();
        }));
    }, sync = function() {
        return null === sessionId || uiEventsHappening > 0 || changingVideo ? Promise.resolve() : (fixPromo(), 
        onCoverChanged(), delayUntil((() => "loading" !== getState()), 2e3)().then((function() {
            if (changingVideo) return Promise.resolve();
            if ("paused" === state) {
                var promise = Promise.resolve();
                return "paused" !== getState() && (promise = pause()), promise.then((function() {
                    if (Math.abs(lastKnownTime - getPlaybackPosition()) > 2500) return seek(lastKnownTime);
                }));
            }
            var localTime = getPlaybackPosition(), serverTime = lastKnownTime + ("playing" === state ? (new Date).getTime() - (lastKnownTimeUpdatedAt.getTime() + localTimeMinusServerTimeMedian) : 0);
            promise = Promise.resolve();
            return "paused" === getState() && (promise = play()), promise.then((function() {
                if (Math.abs(localTime - serverTime) > 2500) return seek(serverTime).then((function() {
                    var milliseconds, localTime = getPlaybackPosition(), serverTime = lastKnownTime + ("playing" === state ? (new Date).getTime() - (lastKnownTimeUpdatedAt.getTime() + localTimeMinusServerTimeMedian) : 0);
                    return localTime > serverTime && localTime <= serverTime + 2500 ? (milliseconds = localTime - serverTime, 
                    function() {
                        uiEventsHappening += 1;
                        var video = jQuery("video")[0];
                        return video.pause(), delay(milliseconds)().then((function() {
                            video.play();
                        })).then(hideControls).ensure((function() {
                            uiEventsHappening -= 1;
                        }));
                    })() : play();
                }));
            }));
        })));
    };
    const getPlayItemEvent = new CustomEvent("tpVideoNode", {
        detail: {
            type: "getPlayItem"
        }
    });
    var skipPromo = function() {
        return new Promise((async (resolve, reject) => {
            var src;
            console.log("Skip Promo called: "), (src = jQuery("video")[0]) && ((video = src).onwaiting = onBuffer, 
            video.oncanplay = onCanPlay, video.onplay = onVideoChange, video.onpause = onVideoChange, 
            video.onseeking = onVideoChange), resolve();
        }));
    }, playCheckRunning = !1, fixPromo = async function() {
        if (!playCheckRunning && !changingVideo) {
            playCheckRunning = !0;
            try {
                await delayUntil((function() {
                    return window.dispatchEvent(getPlayItemEvent), playItem && "PROMO" === playItem.type;
                }), 1500)(), console.log("DETECTED PLAY ITEM CHANGE"), changingVideo ? playCheckRunning = !1 : (pushTask(skipPromo), 
                pushTask(sync));
            } catch (e) {
                playCheckRunning = !1;
            }
        }
    }, waitTillUpdate = function() {
        return new Promise((async (resolve, reject) => {
            await delayUntil((() => lastUpdateEvent > videoChangeStartTime), 3e3), console.log("Update happend"), 
            resolve();
        }));
    }, broadcast = function() {
        return new Promise((async (resolve, reject) => {
            console.log("Broadcast called"), changingVideo && resolve();
            getState();
            var newState, now = new Date, serverTime = lastKnownTime + ("playing" === state ? now.getTime() - (lastKnownTimeUpdatedAt.getTime() + localTimeMinusServerTimeMedian) : 0), newLastKnownTime = getPlaybackPosition(), newLastKnownTimeUpdatedAt = new Date(now.getTime() - localTimeMinusServerTimeMedian);
            newState = "loading" == getState() ? video.paused ? "paused" : "playing" : "playing" === getState() ? "playing" : "paused", 
            state === newState && Math.abs(newLastKnownTime - serverTime) < 1 ? resolve() : socket.emit("updateSession", {
                lastKnownTime: newLastKnownTime,
                lastKnownTimeUpdatedAt: newLastKnownTimeUpdatedAt.getTime(),
                state: newState,
                lastKnownTimeRemaining: getRemainingTime(),
                lastKnownTimeRemainingText: getRemainingTimeText(),
                videoDuration
            }, (function(data) {
                null != data && null != data.errorMessage ? reject() : resolve();
            }));
        }));
    }, receive = function(data) {
        return logMessage(JSON.stringify(data)), lastKnownTime = data.lastKnownTime, lastKnownTimeUpdatedAt = new Date(data.lastKnownTimeUpdatedAt), 
        state = data.state, sync;
    }, tasks = null, taskArray = [], tasksInFlight = 0, pushTask = function(task) {
        0 === tasksInFlight && (tasks = Promise.resolve(), taskArray = []), tasksInFlight += 1, 
        taskArray.push(task), tasks = tasks.then((function() {
            "idle" === getState() && swallow(wakeUp)();
        })).then(swallow(task)).then((function() {
            taskArray.shift(), tasksInFlight -= 1;
        }));
    }, mouseupListener = function() {
        logMessage();
        logMessage(), null == sessionId || 0 !== uiEventsHappening || changingVideo || (fixPromo(), 
        onCoverChanged()), interactionsCount += 1;
    };
    jQuery(window).mouseup(mouseupListener);
    var scriptInterval = null, teardown = function() {
        console.log("Tearing down"), window.postMessage({
            type: "teardown"
        }, "*"), window.removeEventListener("message", replaceStateInteraction, !1), window.removeEventListener("message", episodeDataInteraction, !1), 
        window.removeEventListener("unload", unloadInteraction, !0), window.removeEventListener("FromNode", nodeListener), 
        window.removeEventListener("resize", resizeListener), window.document.removeEventListener("webkitfullscreenchange", resizeListener), 
        jQuery("[tpInjected]").remove(), jQuery(window).off("mouseup", mouseupListener), 
        sessionId && (sessionId = null), videoId = null, video = null, window.telepartyLoaded = !1, 
        chrome.runtime.onMessage.removeListener(popupInteraction), socket && socket.disconnect(), 
        scriptInterval && clearInterval(scriptInterval), coverObserver.disconnect(), tasks = Promise.resolve(), 
        setChatVisible(!1), clearUnreadCount(), jQuery("#chat-container").remove(), jQuery("#chat-wrapper").remove(), 
        !1;
    };
    getState();
    socket.on("connect", (function() {
        pushTask(ping), logMessage(), scriptInterval || (scriptInterval = setInterval((function() {
            0 === tasksInFlight && null != sessionId && (pushTask(ping), pushTask(sync));
        }), 5e3));
    })), socket.on("reconnect", (function() {
        null != sessionId && (logMessage(), socket.emit("reboot", {
            sessionId,
            lastKnownTime,
            lastKnownTimeUpdatedAt: lastKnownTimeUpdatedAt.getTime(),
            messages,
            userSettings,
            state,
            videoService: "hbo",
            ownerId,
            userId,
            videoId,
            videoType: getHBOVideoType(window.location.href),
            videoDuration,
            permId
        }, (function(data) {
            data.errorMessage ? (showButtonMessage(lostConnectionModal, getPartyUrl()), teardown()) : data.videoIds && data.videoIds.pop() !== videoId ? (showButtonMessage(failedNextEpisodeModal, getPartyUrl()), 
            teardown()) : (logMessage(), lastUpdateEvent = new Date(data.lastKnownTimeUpdatedAt), 
            pushTask(receive(data)));
        })));
    })), socket.on("sendMessage", (function(data) {
        logMessage(), addMessage(data, !1);
    })), socket.on("setPresence", (function(data) {
        setPresenceVisible(data.anyoneTyping);
    })), socket.on("setBufferingPresence", (function(data) {
        var visible;
        visible = data.anyoneBuffering, jQuery("#presence-indicator").data("buffering", visible), 
        setPresenceText(), othersAreBuffering = data.anyoneBuffering;
        var time = new Date;
        time.getHours(), time.getMinutes(), time.getMilliseconds();
        logMessage(data.anyoneBuffering), othersAreBuffering && logMessage(othersAreBuffering);
    })), socket.on("update", (function(data) {
        lastUpdateEvent = new Date(data.lastKnownTimeUpdatedAt), pushTask(receive(data));
    }));
    var waitUserIdReady = function() {
        return logMessage(), function() {
            return new Promise((function(resolve, reject) {
                return delay(250)().then(delayUntil((function() {
                    return null != userId;
                }), 1 / 0)).then(delayUntil((function() {
                    return !function(obj) {
                        for (var key in obj) if (obj.hasOwnProperty(key)) return !1;
                        return !0;
                    }(userSettings);
                }), 1 / 0)).then((function() {
                    logMessage(), resolve();
                }));
            }));
        };
    }, popupInteraction = function(request, sender, sendResponse) {
        return "getInitData" === request.type ? (console.log("Get Init data called"), "episode" != getHBOVideoType(window.location.href) && null == videoId && (videoId = request.data.videoId), 
        sendResponse({
            sessionId,
            serverId,
            chatVisible: getChatVisible()
        }), !0) : "createSession" === request.type ? (removeVideoCover(), waitUserIdReady()().then((() => {
            return requestId = request.data.videoId, new Promise((async (resolve, reject) => {
                try {
                    null === videoId ? document.querySelector("video") && document.querySelector("video").paused ? (await skipPromo(), 
                    await play(), await triggerEpisodeId(0), await pause(), resolve()) : (await skipPromo(), 
                    await play(), await triggerEpisodeId(0), resolve()) : resolve();
                } catch (error) {
                    console.log("Give up and use request id"), videoId = requestId, resolve();
                }
            }));
            var requestId;
        })).then(skipPromo).then((function() {
            socket.emit("createSession", {
                controlLock: request.data.controlLock,
                videoId,
                videoType: getHBOVideoType(window.location.href),
                videoDuration,
                videoService: "hbo",
                permId,
                userSettings
            }, (function(data) {
                logMessage(JSON.stringify(data)), data.errorMessage ? sendResponse({
                    errorMessage: data.errorMessage
                }) : (initChat(), setChatVisible(!0), lastKnownTime = data.lastKnownTime, lastKnownTimeUpdatedAt = new Date(data.lastKnownTimeUpdatedAt), 
                lastUpdateEvent = new Date(data.lastKnownTimeUpdatedAt), messages = [], sessionId = data.sessionId, 
                ownerId = request.data.controlLock ? userId : null, hostOnly = !1, state = data.state, 
                videoType = getHBOVideoType(window.location.href), videoTitle = getVideoTitle(), 
                pushTask(broadcast), sessionStartTime = new Date, sendResponse({
                    sessionId
                }));
            }));
        })), !0) : "joinSession" === request.type ? (removeVideoCover(), waitUserIdReady()().then(skipPromo).then((function() {
            var joinData = {
                sessionId: request.data.sessionId,
                permId,
                userSettings,
                videoService: "hbo",
                videoId: request.data.videoId
            };
            logMessage(JSON.stringify(joinData)), socket.emit("joinSession", joinData, (function(data) {
                if (data.errorMessage) return sendResponse({
                    errorMessage: data.errorMessage
                }), !0;
                initChat(), setChatVisible(!0), messages = [];
                for (var i = 0; i < data.messages.length; i += 1) addMessage(data.messages[i], !0);
                lastKnownTime = data.lastKnownTime, lastKnownTimeUpdatedAt = new Date(data.lastKnownTimeUpdatedAt), 
                lastUpdateEvent = new Date(data.lastKnownTimeUpdatedAt), sessionId = request.data.sessionId, 
                ownerId = data.ownerId, hostOnly = null != data.ownerId && data.ownerId !== userId, 
                state = data.state, videoType = getHBOVideoType(window.location.href), videoId = request.data.videoId, 
                videoTitle = getVideoTitle(), pushTask(receive(data)), sendResponse({});
            }));
        })), !0) : "leaveSession" === request.type ? (socket.emit("leaveSession", null, (function(_) {
            logSummary(), sessionId = null, videoId = null, video = null, hostOnly = !1, changingVideo = !1, 
            setChatVisible(!1), sendResponse({});
        })), !0) : void ("showChat" === request.type && (request.data.visible ? setChatVisible(!0) : setChatVisible(!1), 
        sendResponse({})));
    };
    (console.log("user Id promise called: " + userId), delayUntil((function() {
        return userId;
    }), 25e3)()).then((function() {
        return new Promise((function(resolve, reject) {
            userSettings.userId && userSettings.userIcon && resolve(userSettings), chrome.storage.local.get(null, (function(data) {
                data.userId || (data.userId = userId, permId = userId), console.log("icons:" + JSON.stringify(oldIcons)), 
                console.log("user icon:" + JSON.stringify(data.userIcon));
                var userIconFix = !1;
                if (userIconFix = data.userIcon && data.userIcon.includes("?newIconUrl=") ? !(newIcons.includes(data.userIcon.split("?newIconUrl=")[1]) && oldIcons.includes(data.userIcon.split("?newIconUrl=")[0])) : !oldIcons.includes(data.userIcon), 
                console.log("userIconFix: " + userIconFix), console.log("get chrome storage finished userID: " + userId), 
                console.log("get chrome storage finished: " + JSON.stringify(data)), !userIconFix && data.userId && data.userIcon) userSettings = data, 
                defaultIcon = data.userIcon.split("?newIconUrl=")[0]; else if (userIconFix || data.userId && !data.userIcon) {
                    var dataUserId = data.userId;
                    setUserIcon((userSettings = {
                        userId: dataUserId,
                        userIcon: defaultIcon
                    }).userId, userSettings.userIcon, !0), console.log("get chrome storage creating new icon: " + JSON.stringify(userSettings)), 
                    resolve(userSettings);
                }
                resolve(userSettings);
            }));
        }));
    })).then((function() {
        chatHtml2 = `\n      <style>\n      @import"https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap";.r-m{margin:0 !important}.r-m-t{margin-top:0 !important}.r-p-t{padding-top:0 !important}.r-m-l{margin-left:0 !important}.r-p-l{padding-left:0 !important}.r-m-r{margin-right:0 !important}.r-p-r{padding-right:0 !important}.r-m-b{margin-bottom:0 !important}.r-p-b{padding-bottom:0 !important}.r-b-r{border-radius:0px !important}.r-boxshadow{box-shadow:none !important}:root{--patreon: #F96854;--base-red: #EF3E3A;--active-red: #ea0f0a;--base-blue: #4da9ff;--base-orange: #ff8d4c;--base-green: #24D154;--base-white: #FAFAFA;--white-5: #F0F0F0;--white-10: #DCDCDC;--white-15: #C8C8C8;--white-20: #B4B4B4;--white-25: #A0A0A0;--white-30: #8C8C8C;--white-35: #787878;--base-black: #191919;--black-5: #5A5A5A;--black-10: #464646;--black-15: #323232;--black-20: #282828;--black-25: #1e1e1e;--black-30: #0a0a0a}.base-white-bg{background-color:var(--base-white)}.white-5-bg{background-color:var(--white-5)}.white-10-bg{background-color:var(--white-10)}.white-15-bg{background-color:var(--white-15)}.white-20-bg{background-color:var(--white-20)}.white-25-bg{background-color:var(--white-25)}.white-30-bg{background-color:var(--white-30)}.white-35-bg{background-color:var(--white-35)}.base-black-bg{background-color:var(--base-black)}.black-5-bg{background-color:var(--black-5)}.black-10-bg{background-color:var(--black-10)}.black-15-bg{background-color:var(--black-15)}.black-20-bg{background-color:var(--black-20)}.black-25-bg{background-color:var(--black-25)}.black-30-bg{background-color:var(--black-30)}.black-35-bg{background-color:var(--black-35)}.base-red-bg{background-color:var(--base-red)}.active-red-bg{background-color:var(--active-red)}.base-orange-bg{background-color:var(--base-orange)}.base-blue-bg{background-color:var(--base-blue)}.base-green-bg{background-color:var(--base-green)}.patreon-bg{background-color:var(--patreon)}.txt-blue{color:var(--base-blue) !important}.txt-red{color:var(--base-red) !important}.txt-white{color:var(--base-white) !important}div,p,span,a,h1,h2,h3,h4,h5,h6,li,ul,button{word-wrap:break-word}:root{--regular: 400;--medium: 500;--semi-bold: 600;--bold: 700;--extra-bold: 800;--black: 900}.extension-title{font-family:"Poppins",sans-serif;font-weight:var(--medium);color:var(--base-red);font-size:16px;letter-spacing:.2px}.extension-txt{font-family:"Poppins",sans-serif;font-weight:var(--regular);color:#fff;font-size:14px}.extension-txt-indicator{font-family:"Poppins",sans-serif;font-weight:var(--regular);color:var(--white-35);font-size:11px}.extension-description{font-family:"Poppins",sans-serif;font-weight:var(--medium);color:var(--white-10);font-size:13px}.extension-border-bot{border-bottom:1px solid var(--black-10)}.extension-border-top{border-top:1px solid var(--black-10)}.extension-btn{width:100%;margin-top:10px;background:var(--base-red);color:var(--base-white);padding:10px 0px;border-radius:2px;font-family:"Poppins",sans-serif;font-weight:var(--medium);transition:background .3s ease;display:flex;flex-flow:wrap row;justify-content:center;font-size:14px}.extension-btn:hover{background:var(--active-red)}.extension-btn a{font-family:"Poppins",sans-serif;font-weight:var(--medium);color:var(--base-white)}#alert,#alert-dialog-wrapper{display:flex;flex-flow:wrap row;position:fixed;width:100%;height:100%;z-index:9999999999;align-items:center;box-shadow:8px 6px 20px 1px rgba(0,0,0,.2)}#alert-dialog-container{background:var(--base-black);max-width:400px;margin:0 auto;border-radius:4px}#alert-title-wrapper{padding:20px 20px 0px 20px}#alert-title-wrapper .alert-title{display:flex;flex-flow:wrap row;justify-content:space-between;align-items:center}#alert-title-wrapper .alert-title .alert-x{color:var(--base-white)}#alert-title-wrapper .extension-border-bot{padding-top:10px}#alert-description{padding:10px 20px 20px 20px}#alert-x-btn{background:none !important;border:none !important}#alert-content-txt{margin:0 !important}#alert-title-txt{margin:0 !important}#alert-return-btn{border:none !important}/*# sourceMappingURL=alert.min.css.map */\n      </style>\n      <style tpInjected>\n        #chat-wrapper {\n          width: 288px !important;\n          height: calc(100% - 126px) !important;\n          background: #1a1a1a;\n          position: absolute !important;\n          top: 0 !important;\n          left: auto !important;\n          right: 0 !important;\n          bottom: 0 !important;\n          cursor: auto;\n          user-select: text;\n          -webkit-user-select: text;\n          z-index: 9999999999 !important;\n        }\n  \n        #chat-wrapper #chat-container {\n          // width: 228px;\n          height: 100%;\n          position: relative;\n          left: 0;\n          right: 0;\n          margin: 0 auto;\n        }\n  \n        .with-chat {\n          right: 288px !important;\n          width: calc(100% - 288px) !important;\n        }\n  \n  // Raymond's Styling Code\n @import url(https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800;900&display=swap);body,html{font-size:16px;-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale}*{box-sizing:border-box}a,body,button,h1,h2,h3,h4,h5,h6,html,li,ol,p,ul{padding:0}a,body,button,h1,h2,h3,h4,h5,h6,html,li,ol,p,ul{margin:0}a,li,ol,ul{text-decoration:none;list-style:none}button,input{border:none}body,h1,h2,h3,h4,h5,h6,html,p,span{user-select:text!important;cursor:auto!important}img{user-select:none!important}article,button,div,form,input,section{outline:0}a{display:block;width:fit-content}button,fieldset,form,input{background:0 0}button:hover{cursor:pointer}.r-m{margin:0!important}.r-m-t{margin-top:0!important}.r-p-t{padding-top:0!important}.r-m-l{margin-left:0!important}.r-p-l{padding-left:0!important}.r-m-r{margin-right:0!important}.r-p-r{padding-right:0!important}.r-m-b{margin-bottom:0!important}.r-p-b{padding-bottom:0!important}.r-b-r{border-radius:0!important}.r-boxshadow{box-shadow:none!important}:root{--patreon:#f96854;--base-red:#ef3e3a;--active-red:#ea0f0a;--base-blue:#4da9ff;--base-orange:#ff8d4c;--base-green:#24d154;--base-white:#fafafa;--white-5:#f0f0f0;--white-10:#dcdcdc;--white-15:#c8c8c8;--white-20:#b4b4b4;--white-25:#a0a0a0;--white-30:#8c8c8c;--white-35:#787878;--base-black:#191919;--black-5:#5a5a5a;--black-10:#464646;--black-15:#323232;--black-20:#282828;--black-25:#1e1e1e;--black-30:#0a0a0a}.base-white-bg{background-color:var(--base-white)}.white-5-bg{background-color:var(--white-5)}.white-10-bg{background-color:var(--white-10)}.white-15-bg{background-color:var(--white-15)}.white-20-bg{background-color:var(--white-20)}.white-25-bg{background-color:var(--white-25)}.white-30-bg{background-color:var(--white-30)}.white-35-bg{background-color:var(--white-35)}.base-black-bg{background-color:var(--base-black)}.black-5-bg{background-color:var(--black-5)}.black-10-bg{background-color:var(--black-10)}.black-15-bg{background-color:var(--black-15)}.black-20-bg{background-color:var(--black-20)}.black-25-bg{background-color:var(--black-25)}.black-30-bg{background-color:var(--black-30)}.black-35-bg{background-color:var(--black-35)}.base-red-bg{background-color:var(--base-red)}.active-red-bg{background-color:var(--active-red)}.base-orange-bg{background-color:var(--base-orange)}.base-blue-bg{background-color:var(--base-blue)}.base-green-bg{background-color:var(--base-green)}.patreon-bg{background-color:var(--patreon)}.txt-blue{color:var(--base-blue)!important}.txt-red{color:var(--base-red)!important}.txt-white{color:var(--base-white)!important}a,button,div,h1,h2,h3,h4,h5,h6,li,p,span,ul{word-wrap:break-word}:root{--regular:400;--medium:500;--semi-bold:600;--bold:700;--extra-bold:800;--black:900}.extension-title{font-family:Poppins,sans-serif;font-weight:var(--medium);color:var(--base-red);font-size:16px;letter-spacing:.2px}.extension-txt{font-family:Poppins,sans-serif;font-weight:var(--regular);color:var(--white-15);font-size:14px}.extension-txt-indicator{font-family:Poppins,sans-serif;font-weight:var(--regular);color:var(--white-35);font-size:11px}.extension-description{font-family:Poppins,sans-serif;font-weight:var(--medium);color:var(--white-10);font-size:13px}.extension-border-bot{border-bottom:1px solid var(--black-10)}.extension-border-top{border-top:1px solid var(--black-10)}.extension-btn{width:100%;margin-top:10px;background:var(--base-red);color:var(--base-white);padding:10px 0;border-radius:2px;font-family:Poppins,sans-serif;font-weight:var(--medium);transition:background .3s ease;display:flex;flex-flow:wrap row;justify-content:center;font-size:14px}.extension-btn:hover{background:var(--active-red)}.extension-btn a{font-family:Poppins,sans-serif;font-weight:var(--medium);color:var(--base-white)}::-webkit-scrollbar{width:2px}::-webkit-scrollbar-thumb{background:var(--base-red);border-radius:10px}#chat-wrapper{position:fixed;right:0;width:288px;height:100%;background:var(--base-black)}#chat-container{width:250px;height:100%;margin:0 auto;padding:12px 0}#chat-container .chat-header-container-active{height:100%}#chat-menu-container{display:flex;flex-flow:wrap row;justify-content:space-between;align-items:center}#chat-menu-container #title h1{font-family:Poppins,sans-serif;font-weight:var(--medium);color:var(--base-red);font-size:16px;letter-spacing:.5px}#chat-menu-container #function-user{display:flex;flex-flow:wrap row}#chat-menu-container #function-user #link-icon{display:flex;flex-flow:wrap row;align-items:center;padding-right:10px;cursor:pointer}#chat-menu-container #function-user #link-icon .chat-link{color:var(--base-white);width:18px;height:18px;transform:scale(1);transition:color .3s ease}#chat-menu-container #function-user #link-icon .chat-link:hover{color:var(--base-red);transform:scale(1.05)}#chat-menu-container #function-user #user-icon img{width:38px;height:38px;transform:scale(1);transition:transform .3s ease}#chat-menu-container #function-user #user-icon img:hover{transform:scale(1.05)}#chat-history-container{display:flex;flex-flow:wrap column;justify-content:flex-end;height:calc(100% - 136px)}#chat-history-container #chat-history{overflow:auto;width:100%;height:auto;padding-top:10px}#chat-history-container #chat-history .msg,#chat-history-container #chat-history .msg-container{display:flex;flex-flow:wrap row;justify-content:space-between;padding:5px 0;align-items:center}#chat-history-container #chat-history .msg-container{align-items:flex-start}#chat-history-container #chat-history .msg .icon img,#chat-history-container #chat-history .msg .icon-name img,#chat-history-container #chat-history .msg-container .icon img,#chat-history-container #chat-history .msg-container .icon-name img{width:36px;height:36px}#chat-history-container #chat-history .msg .msg-txt,#chat-history-container #chat-history .msg-container .msg-txt{display:flex;flex-flow:wrap column;width:80%}#chat-history-container #chat-history .msg .message,#chat-history-container #chat-history .msg .message-system,#chat-history-container #chat-history .msg .message-txt,#chat-history-container #chat-history .msg-container .message,#chat-history-container #chat-history .msg-container .message-system,#chat-history-container #chat-history .msg-container .message-txt{width:80%}#chat-history-container #chat-history .msg .message h3,#chat-history-container #chat-history .msg .message-system h3,#chat-history-container #chat-history .msg .message-txt h3,#chat-history-container #chat-history .msg-container .message h3,#chat-history-container #chat-history .msg-container .message-system h3,#chat-history-container #chat-history .msg-container .message-txt h3{font-family:Poppins,sans-serif;font-weight:var(--semi-bold);color:var(--base-white);font-size:14px;line-height:1.2;letter-spacing:.2px}#chat-history-container #chat-history .msg .message p,#chat-history-container #chat-history .msg .message-system p,#chat-history-container #chat-history .msg .message-txt p,#chat-history-container #chat-history .msg-container .message p,#chat-history-container #chat-history .msg-container .message-system p,#chat-history-container #chat-history .msg-container .message-txt p{font-family:Poppins,sans-serif;font-weight:var(--regular);font-size:14px;line-height:normal}#chat-history-container #chat-history .msg .message-txt p,#chat-history-container #chat-history .msg-container .message-txt p{color:#fff;word-break:break-word!important;line-height:normal}#chat-history-container #chat-history .msg .message-system p,#chat-history-container #chat-history .msg-container .message-system p{color:var(--white-35);font-style:italic;line-height:normal}#chat-input-container input{padding-top:5px;width:100%}#chat-input-container input:hover{cursor:auto!important}#chat-icon-container{display:flex;flex-flow:wrap column;flex-flow:column;height:100%;padding-top:10px}#chat-icon-container #icon-title-container{padding-bottom:10px}#chat-icon-container #icon-holder{display:flex;flex-flow:wrap row}#chat-icon-container #icon-holder .image-button{width:25%;padding:1px 3.75px}#chat-icon-container #icon-holder .image-button .img-class{width:100%;height:100%;transform:scale(.95);transition:transform .3s ease}#chat-icon-container #icon-holder .image-button .img-class:hover{transform:scale(1)}#icon-holder-container{height:calc(100% - 74px);overflow:auto}.icon-holder-wrap{padding:10px 0}.icon-holder-wrap:first-child{padding:0}.icon-holder-wrap p{padding-bottom:5px}.setting,.setting-container{display:flex;flex-flow:wrap column;display:none}.setting-usericon{width:100%;display:flex;flex-flow:wrap row;justify-content:center;padding-top:10px}.setting-usericon img{width:80px;height:80px;transform:scale(1);transition:transform .3s ease}.setting-usericon img:hover{transform:scale(1.05)}.setting-nickname{margin-top:10px}.setting-nickname .nickname,.setting-nickname .nickname-input,.setting-nickname .nickname-wrap{width:100%}.setting-nickname .nickname-wrap{display:flex;flex-flow:wrap column}.setting-nickname .nickname-input{margin-top:5px}.setting-nickname .nickname-input input{border-radius:2px;padding:8px 10px;width:100%;background:var(--black-15)}.setting-nickname .nickname-input input:hover{cursor:auto!important}#presence-indicator{display:block;padding-bottom:5px;height:20px}#patreon,#patreon-container,#patreon-link{display:flex;flex-flow:wrap row;justify-content:space-between;align-items:center;width:100%}#patreon-container{padding-top:10px}#patreon-link img{border-radius:20px;width:130px}#teleparty-blog-container{display:flex;flex-flow:wrap row;padding-top:10px;z-index:10}#teleparty-blog-btn{display:flex;flex-flow:wrap row;align-items:center;justify-content:space-between;width:100%;height:36px}#teleparty-blog-btn img{height:32px}#teleparty-blog-btn p{display:flex;flex-flow:wrap row;align-items:center;font-family:Poppins,sans-serif;font-weight:var(--medium);background:var(--base-red);color:var(--base-white);padding:6px 20px;border-radius:20px;height:100%}#teleparty-blog-btn p:hover{cursor:pointer!important}\n  // Raymond's Styling Code\n  \n      </style>\n  \n      <script tpInjected>\n      var script = document.createElement('script');\n      script.src = 'https://code.jquery.com/jquery-1.11.0.min.js';\n      document.getElementsByTagName('head')[0].appendChild(script);\n  \n  \n      <\/script>\n      <div id="notification-link" class="notification-links" tpInjected>\n  \n      </div>\n  \n      <div id="chat-wrapper" tpInjected>\n        <div id="chat-container">\n  \n          <div id="chat-header-container">\n  \n            <ul id="chat-menu-container">\n              <li id="function-title">\n                <div id="title">\n                  <p class="extension-title">Teleparty</p>\n                </div>\n              </li>\n              <li id="function-user">\n                <div id="link-icon">\n                  <img class="chat-link" src='${chrome.runtime.getURL("img/Link.svg")}'>\n                  <input id="share-url" type="text" readonly="true" autocomplete="off" autofocus style="display:none;" />\n                </div>\n                <a id="user-icon">\n                  <img src='${getUserIconURL(userSettings.userId, userSettings.userIcon)}'>\n                </a>\n              </li>\n            </ul>\n  \n            <div id="chat-link-container" style='display:none;'>\n              <div id="chat-link">\n                <div id="chat-link-url">\n                  <p>The url link goes here.</p>\n                </div>\n                <div id="chat-link-icon">\n                  <img src='${chrome.runtime.getURL("img/Link.svg")}'>\n                </div>\n              </div>\n            </div>\n  \n            <div id="chat-icon-container" style="display:none">\n              <div id="icon-title-container">\n                <div id="icon-title">\n                  <p class="extension-description">Click to switch icon</p>\n                </div>\n              </div>\n              <div id="icon-holder-container">\n                <div id="icon-holder-template">\n                  <div id="icon-holder-wrap">\n                    <p class="extension-txt-indicator"></p>\n                    <ul id="icon-holder"></ul>\n                  </div>\n                </div>\n              </div>\n            </div>\n  \n          </div>\n  \n          <div id="setting-edit" class="chat-settings-container setting-container" style="display:none">\n  \n            <div class="setting-usericon">\n              <div class="section-b-inner section-inner">\n                <a class="user-icon">\n                  <img src='${getUserIconURL(userSettings.userId, userSettings.userIcon)}' />\n                </a>\n              </div>\n            </div>\n  \n            <div class="section-c setting-nickname">\n              <div class="section-c-inner section-inner">\n                <div class="nickname-section row-wrap">\n                  <div class="nickname-wrap row-one">\n                    <p class="extension-description">Nickname</p>\n                  </div>\n                  <div class="nickname-input row-two">\n                    <input id="nickname-edit" class="extension-txt" type="text" placeholder='${userSettings.userNickname ? escapeStr(userSettings.userNickname) : "Add a nickname"}'/>\n                  </div>\n                </div>\n              </div>\n            </div>\n  \n          </div>\n  \n          <div id="settings-save" class="chat-settings-container setting-container" style="display:none">\n            <div class="section-d">\n              <div class="section-d-inner section-inner">\n  \n                <div class="btns">\n                  <button class='extension-btn'>Save Changes</button>\n                </div>\n              </div>\n            </div>\n          </div>\n  \n          <div id="chat-history-container">\n            <div id="chat-history">\n            </div>\n          </div>\n  \n          <div id="presence-indicator" class="extension-txt-indicator">\n            <p class="extension-txt-indicator">People are currently typing...</p>\n          </div>\n  \n          <div id="chat-input-container" class="extension-border-top">\n            <input id="chat-input" class="extension-txt" type="text" placeholder="Type a message..." autocomplete="off"></input>\n          </div>\n  \n          <div id="teleparty-blog-container">\n            <a id="teleparty-blog-btn" target="none" href="https://www.netflixparty.com/introducing-teleparty">\n                <img src="${escapeStr(chrome.runtime.getURL("img/tp_logo.svg"))}" alt="">\n                <p class="extension-txt-indicator">Introducing Teleparty</p>\n            </a>\n          </div>\n  \n        </div>\n      </div>\n    `;
    })).then(chrome.runtime.onMessage.addListener(popupInteraction));
};

window.telepartyLoaded || (console.log("Teleparty: Injecting Content Script"), window.telepartyLoaded = !0, 
injectContentScript());