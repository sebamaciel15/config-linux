"use strict";

var runOldPopupScript = function() {
    console.log("Using old extension logic");
    const StreamingService_NETFLIX = "netflix", StreamingService_HULU = "hulu", StreamingService_DISNEY_PLUS = "disney", StreamingService_HBO_EPISODE = "hbo_episode", StreamingService_HBO_FEATURE = "hbo_feature", StreamingService_HBO_EXTRA = "hbo_extra", StreamingService_HBO_NOW = "hbo_now", unsupportedSites = [ ".hotstar.", ".hbogola." ];
    var getHBOVideoType = function(url) {
        return url.includes("urn:hbo:feature") ? (console.log("this is an hbo feature"), 
        "feature") : url.includes("urn:hbo:episode") ? (console.log("this is an hbo episode"), 
        "episode") : url.includes("urn:hbo:extra") ? (console.log("this is an hbo extra"), 
        "extra") : "none";
    }, getURLParameter = function(url, key) {
        var searchString = "?" + url.split("?")[1];
        if (void 0 === searchString) return null;
        var escapedKey = key.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"), match = new RegExp("[?|&]" + escapedKey + "=([^&]*)(&|$)").exec(searchString);
        return null === match ? null : decodeURIComponent(match[1]);
    };
    function UserSite(urlString, id) {
        this.url = new URL(urlString);
        const url = this.url;
        if (this.id = id, this.serverId = "", function(url) {
            return url.hostname.includes(".hulu.") && url.pathname.includes("/watch");
        }(url)) this.videoId = url.pathname.match(/^.*\/([a-z\-0-9]+)\??.*/)[1], this.serviceType = StreamingService_HULU; else if (function(url) {
            return (url.hostname.includes(".hbomax.") || url.hostname.includes(".hbonow.")) && "none" !== getHBOVideoType(url.pathname);
        }(url)) {
            const videoType = getHBOVideoType(url.pathname);
            this.serviceType = "feature" === videoType ? StreamingService_HBO_FEATURE : "episode" === videoType ? StreamingService_HBO_EPISODE : StreamingService_HBO_EXTRA, 
            url.hostname.includes(".hbonow.") && (this.serviceType = StreamingService_HBO_NOW);
            var videoUrnType = "urn:hbo:" + getHBOVideoType(url.pathname) + ":", hboQueryString = url.pathname.split(videoUrnType), hboParseIds = hboQueryString != null ** hboQueryString.length > 1 && null != hboQueryString[1] ? hboQueryString[1].match(/^([a-zA-Z\-\_0-9]+)\??.*/) : null, hboVideoId = null != hboParseIds && 0 !== hboParseIds.length ? url.pathname.split(videoUrnType)[1].match(/^([a-zA-Z\-\_0-9]+)\??.*/)[1] : null;
            this.videoId = hboVideoId;
        } else if (function(url) {
            return url.hostname.includes(".netflix.") && url.pathname.includes("/watch");
        }(url)) this.videoId = parseInt(url.pathname.match(/^.*\/([0-9]+)\??.*/)[1]), this.serviceType = StreamingService_NETFLIX; else {
            if (!function(url) {
                return url.hostname.includes(".disneyplus.") && url.pathname.includes("/video");
            }(url)) return;
            this.videoId = url.pathname.match(/^.*\/([a-z\-0-9]+)\??.*/)[1], this.serviceType = StreamingService_DISNEY_PLUS;
        }
        switch (this.joinSessionId = getURLParameter(url.search, "npSessionId"), this.serviceType) {
          case StreamingService_NETFLIX:
            this.contentScripts = [ "content_scripts/netflix/netflix_content_script.js" ];
            break;

          case StreamingService_HULU:
            this.contentScripts = [ "content_scripts/hulu/hulu_content_script_netflix.js" ];
            break;

          case StreamingService_HBO_NOW:
            this.contentScripts = [ "content_scripts/hbo_now/hbo_browse.js", "content_scripts/hbo_now/hbo_content_script.js" ];
            break;

          case StreamingService_HBO_EPISODE:
          case StreamingService_HBO_FEATURE:
          case StreamingService_HBO_EXTRA:
            this.contentScripts = [ "content_scripts/hbo_max/hbo_browse.js", "content_scripts/hbo_max/hbo_content_script.js" ];
            break;

          case StreamingService_DISNEY_PLUS:
            this.contentScripts = [ "content_scripts/disney/disney_content_script.js" ];
        }
        this.urlWithSessionId = function(sessionId) {
            switch (this.serviceType) {
              case StreamingService_HULU:
                return `https://www.tele.pe/hulu/${sessionId}?s=${this.serverId}`;

              case StreamingService_HBO_FEATURE:
              case StreamingService_HBO_EPISODE:
              case StreamingService_HBO_EXTRA:
                return `https://www.tele.pe/hbomax/${sessionId}?s=${this.serverId}`;

              case StreamingService_HBO_NOW:
                return `https://www.tele.pe/hbonow/${sessionId}?s=${this.serverId}`;

              case StreamingService_DISNEY_PLUS:
                return `https://www.tele.pe/disney/${sessionId}?s=${this.serverId}`;

              case StreamingService_NETFLIX:
                return `https://www.tele.pe/netflix/${sessionId}?s=${this.serverId}`;
            }
        };
    }
    var permId, _gaq = _gaq || [];
    function logEvent(eventType, sessionId, serviceName) {
        try {
            if (permId) {
                var data = {
                    userId: permId,
                    eventType,
                    sessionId,
                    serviceName
                };
                console.log("event: " + JSON.stringify(data));
                var xmlhttp = new XMLHttpRequest;
                xmlhttp.open("POST", "https://data3.netflixparty.com/log-event"), xmlhttp.setRequestHeader("Content-Type", "application/json"), 
                xmlhttp.send(JSON.stringify(data));
            }
        } catch (e) {
            console.log("log event error");
        }
    }
    _gaq.push([ "_setAccount", "UA-71812070-2" ]), _gaq.push([ "_trackPageview" ]), 
    _gaq.push([ "_setSampleRate", "2.5" ]), function() {
        var ga = document.createElement("script");
        ga.type = "text/javascript", ga.async = !0, ga.src = "https://ssl.google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
    }(), chrome.runtime.onUpdateAvailable.addListener((function(details) {
        chrome.runtime.reload();
    })), chrome.runtime.onMessage.addListener((function(request, sender, sendResponse) {
        console.log(sender.tab ? "from a content script:" + sender.tab.url : "from the extension"), 
        request.test && (console.log(JSON.stringify(request.summary)), sendResponse({
            farewell: "goodbye"
        }));
    })), chrome.storage.local.get([ "userId" ], (function(data) {
        data.userId && (permId = data.userId);
    })), window.loadedUrl = !1;
    var $ = jQuery;
    $((function() {
        chrome.tabs.query({
            active: !0,
            currentWindow: !0
        }, (function(tabs) {
            chrome.runtime.sendMessage({
                tab: tabs[0]
            }, (function() {
                console.log("popup -> background script received active tab");
            }));
            var showError = function(err, showButton = !0) {
                $(".some-error").removeClass("hidden"), $(".no-error").addClass("hidden"), $("#error-msg").html(err), 
                showButton ? $("#close-error").removeClass("hidden") : $("#close-error").addClass("hidden");
            }, sendMessage = function(type, data, callback) {
                $("#control-lock").prop("disabled", !0), $("#create-session").prop("disabled", !0), 
                $("#leave-session").prop("disabled", !0), chrome.tabs.executeScript(userSite.id, {
                    file: "lib/tp_libraries_min.js"
                }, (() => {
                    Promise.all(userSite.contentScripts.map((script => (script = "pre_refactor/" + script, 
                    chrome.tabs.executeScript(userSite.id, {
                        file: script
                    }))))).then((() => {
                        chrome.tabs.sendMessage(userSite.id, {
                            type,
                            data
                        }, (function(response) {
                            return chrome.runtime.lastError ? (console.log("Eror contacting content script"), 
                            void sendInitialMessage()) : ($("#control-lock").prop("disabled", !1), $("#create-session").prop("disabled", !1), 
                            $("#leave-session").prop("disabled", !1), response.errorMessage ? null != response.showButton ? (console.log(response), 
                            void showError(response.errorMessage, response.showButton)) : (console.log(response), 
                            void showError(response.errorMessage)) : void (callback && callback(response)));
                        }));
                    }));
                }));
            };
            $("#close-error").click((function() {
                $(".no-error").removeClass("hidden"), $(".some-error").addClass("hidden");
            })), $("#create-session").click((function() {
                sendMessage("createSession", {
                    controlLock: $("#control-lock").is(":checked"),
                    videoId: userSite.videoId
                }, (function(response) {
                    showConnected(response.sessionId), _gaq.push([ "_trackEvent", "create-session", "clicked", userSite.serviceType ]), 
                    logEvent("create-session", response.sessionId, userSite.serviceType);
                }));
            })), $("#learn-more").click((function() {
                chrome.tabs.create({
                    url: "https://www.netflixparty.com/support"
                });
            })), $("#learn-more-teleparty").click((function() {
                chrome.tabs.create({
                    url: "https://www.netflixparty.com/introducing-teleparty"
                });
            })), $("#leave-session").click((function() {
                sendMessage("leaveSession", {}, (function() {
                    window.close();
                }));
            })), $("#show-chat").change((function() {
                sendMessage("showChat", {
                    visible: $("#show-chat").is(":checked")
                }, null);
            })), $("#share-url").click((function(e) {
                var sessionIdFromShareUrl = getURLParameter($("#share-url").val(), "npSessionId");
                sessionIdFromShareUrl && showConnected(sessionIdFromShareUrl), e.stopPropagation(), 
                e.preventDefault(), $("#share-url").select();
            })), $("#copy-btn").click((function(e) {
                console.log("click");
                var sessionIdFromShareUrl = getURLParameter($("#share-url").val(), "npSessionId");
                sessionIdFromShareUrl && showConnected(sessionIdFromShareUrl), e.stopPropagation(), 
                e.preventDefault(), $("#share-url").select(), document.execCommand("copy"), $("#copy-btn").parent().css("background", "#24D154"), 
                $("#copy-btn").text("Copied!");
            }));
            var userSite, url, showConnected = function(sessionId) {
                $(".disconnected").addClass("hidden"), $(".connected").removeClass("hidden"), $("#show-chat").prop("checked", !0), 
                $("#share-url").val(userSite.urlWithSessionId(sessionId)).focus().select();
            }, sendInitialMessage = function() {
                sendMessage("getInitData", {
                    version: chrome.app.getDetails().version,
                    videoId: userSite.videoId
                }, (function(initData) {
                    null != initData.videoId && (userSite.videoId = initData.videoId), console.log("videoId: " + userSite.videoId), 
                    userSite.serverId = initData.serverId, null === initData.sessionId ? (initData.referrer && (console.log("join checking for referrer: " + initData.referrer), 
                    userSite.joinSessionId = function(url) {
                        if (url.includes("hulu/")) {
                            var sessionId = url.split("hulu/")[1].split("?")[0];
                            if ("string" == typeof (id = sessionId) && 16 === id.length) return sessionId;
                        }
                        var id;
                        return null;
                    }(initData.referrer), console.log("join session id: " + userSite.joinSessionId)), 
                    userSite.joinSessionId && (console.log("Join Session Id: " + userSite.joinSessionId), 
                    sendMessage("joinSession", {
                        sessionId: userSite.joinSessionId,
                        videoId: userSite.videoId
                    }, (function(response) {
                        showConnected(userSite.joinSessionId), _gaq.push([ "_trackEvent", "join-session", "clicked", userSite.serviceType ]), 
                        logEvent("join-session", userSite.joinSessionId, userSite.serviceType);
                    })))) : showConnected(initData.sessionId), $("#show-chat").prop("checked", initData.chatVisible);
                }));
            };
            try {
                if (!(userSite = new UserSite(tabs[0].url, tabs[0].id)).serviceType) return url = userSite.url, 
                unsupportedSites.some((str => url.hostname.includes(str))) ? $(".unsupportedSite").removeClass("hidden") : $(".wrongSite").removeClass("hidden"), 
                void $(".disconnected").addClass("hidden");
                sendInitialMessage();
            } catch (e) {
                return $(".wrongSite").removeClass("hidden"), void $(".disconnected").addClass("hidden");
            }
        }));
    }));
};