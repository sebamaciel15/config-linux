(() => {
    "use strict";
    var _gaq = _gaq || [];
    function logEvent(eventType) {
        var permId, recentlyUpdated, numTries = 0, logEventInterval = setInterval((function() {
            try {
                if (numTries > 5 && clearInterval(logEventInterval), chrome.storage.local.get(null, (function(data) {
                    data.userId && (permId = data.userId), data.recentlyUpdated && (recentlyUpdated = data.recentlyUpdated);
                })), permId && recentlyUpdated) {
                    var data = {
                        userId: permId,
                        eventType
                    };
                    console.log("event: " + JSON.stringify(data));
                    var xmlhttp = new XMLHttpRequest;
                    xmlhttp.open("POST", "https://data3.netflixparty.com/log-event"), xmlhttp.setRequestHeader("Content-Type", "application/json"), 
                    xmlhttp.send(JSON.stringify(data)), clearInterval(logEventInterval);
                } else numTries += 1;
            } catch (e) {
                console.log("log event error");
            }
        }), 5e3);
    }
    _gaq.push([ "_setAccount", "UA-71812070-2" ]), _gaq.push([ "_trackPageview" ]), 
    function() {
        var ga = document.createElement("script");
        ga.type = "text/javascript", ga.async = !0, ga.src = "https://ssl.google-analytics.com/ga.js";
        var s = document.getElementsByTagName("script")[0];
        s.parentNode.insertBefore(ga, s);
    }(), chrome.runtime.onInstalled.addListener((function(details) {
        if ("install" == details.reason) {
            console.log("This is a first install!");
            var thisVersion = chrome.runtime.getManifest().version;
            _gaq.push([ "_trackEvent", "install: " + thisVersion, "clicked" ]), logEvent("install"), 
            chrome.tabs.create({
                url: "https://www.netflixparty.com/tutorial"
            }, (function() {
                console.log("created new tab after install");
            }));
        } else if ("update" == details.reason) {
            thisVersion = chrome.runtime.getManifest().version;
            console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!"), 
            _gaq.push([ "_trackEvent", "update: " + details.previousVersion + " -> " + thisVersion, "clicked" ]), 
            logEvent("update-" + thisVersion);
        }
    })), chrome.storage.onChanged.addListener((function(changes, areaName) {
        console.log("storage change: " + JSON.stringify(changes) + " for " + JSON.stringify(areaName));
    })), chrome.runtime.onUpdateAvailable.addListener((function(details) {
        _gaq.push([ "_trackEvent", "auto-update ->" + details.version, "clicked" ]), chrome.runtime.reload();
    }));
    try {
        function validateId(id) {
            return "string" == typeof id && 16 === id.length;
        }
        var browser = navigator.userAgent.toLowerCase().indexOf("edg") > -1 ? "edge" : "chrome";
        console.log("browser: " + browser);
        var queryParams = "?browser=" + browser;
        function resetUserId3(oldUserId2, oldUserId1) {
            var xhr = new XMLHttpRequest;
            oldUserId1 && (queryParams = queryParams + "&oldUserId1=" + oldUserId1), queryParams = queryParams + "&oldUserId2=" + oldUserId2, 
            console.log("query params: " + queryParams), xhr.onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var userId = xhr.responseText;
                    if (validateId(userId)) {
                        var date = new Date, userIdSettings = {
                            userId,
                            oldUserId2,
                            recentlyUpdated: !0,
                            recentlyUpdated3: !0
                        };
                        oldUserId1 && (userIdSettings.oldUserId1 = oldUserId1), console.log("query params: " + queryParams), 
                        userIdSettings.date = date.toString(), chrome.storage.local.set(userIdSettings, (function() {
                            console.log("Settings saved");
                        })), chrome.runtime.setUninstallURL("https://www.netflixparty.com/uninstall?userId=" + userId);
                    }
                }
            }, console.log(), xhr.open("GET", "https://data3.netflixparty.com/create-userId" + queryParams, !0), 
            xhr.send(null);
        }
        chrome.storage.local.get(null, (function(data) {
            var xhr;
            data.userId ? (data.recentlyUpdated3 || (console.log("userId not recently updated 3 -> now resetting"), 
            data.oldUserId ? resetUserId3(data.userId, data.oldUserId) : resetUserId3(data.userId)), 
            data.recentlyUpdated ? (console.log("chrome storage local has user id: " + data.userId), 
            chrome.runtime.setUninstallURL("https://www.netflixparty.com/uninstall?userId=" + data.userId)) : (console.log("userId not recently updated 1 -> now resetting"), 
            function(oldUserId) {
                var xhr = new XMLHttpRequest;
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == XMLHttpRequest.DONE) {
                        var userId = xhr.responseText;
                        validateId(userId) && (chrome.storage.local.set({
                            userId,
                            oldUserId,
                            recentlyUpdated: !0
                        }, (function() {
                            console.log("Settings saved");
                        })), chrome.runtime.setUninstallURL("https://www.netflixparty.com/uninstall?userId=" + userId));
                    }
                }, xhr.open("GET", "https://data3.netflixparty.com/create-userId" + queryparams, !0), 
                xhr.send(null);
            }(data.userId))) : (console.log("userId undefined in local storage -> now setting"), 
            (xhr = new XMLHttpRequest).onreadystatechange = function() {
                if (xhr.readyState == XMLHttpRequest.DONE) {
                    var userId = xhr.responseText, date = new Date;
                    validateId(userId) && (chrome.storage.local.set({
                        userId,
                        recentlyUpdated: !0,
                        recentlyUpdated3: !0,
                        date: date.toString()
                    }, (function() {
                        console.log("Settings saved");
                    })), chrome.runtime.setUninstallURL("https://www.netflixparty.com/uninstall?userId=" + userId));
                }
            }, xhr.open("GET", "https://data3.netflixparty.com/create-userId" + queryParams, !0), 
            xhr.send(null));
        }));
    } catch (e) {
        console.log("user auth error");
    }
    chrome.runtime.onMessage.addListener((function(request, sender, sendResponse) {
        if (request.summary) {
            var xmlhttp = new XMLHttpRequest;
            return xmlhttp.open("POST", "https://data3.netflixparty.com/log-summary", !0), xmlhttp.setRequestHeader("Content-Type", "application/json"), 
            xmlhttp.send(JSON.stringify(request.summary)), sendResponse({
                farewell: "goodbye"
            }), !0;
        }
        if ("getIconMap" == request.type) {
            var iconMap = {};
            return chrome.runtime.getPackageDirectoryEntry((async root => {
                root.getDirectory("img/icons/", null, (dir => {
                    dir.createReader().readEntries((async results => {
                        if (results.length) {
                            const iconPromises = results.map((async category => async function(directory, iconMap) {
                                return new Promise(((resolve, reject) => {
                                    var dirReader = directory.createReader(), name = directory.name, entries = [];
                                    dirReader.readEntries((function(results) {
                                        if (results.length) {
                                            for (var icon of results) entries = entries.concat(icon.name);
                                            iconMap[name] = entries, resolve();
                                        }
                                    }), (function(error) {}));
                                }));
                            }(category, iconMap)), (err => {}));
                            await Promise.all(iconPromises), sendResponse(iconMap);
                        }
                    }), (err => {}));
                }));
            })), !0;
        }
    }));
})();