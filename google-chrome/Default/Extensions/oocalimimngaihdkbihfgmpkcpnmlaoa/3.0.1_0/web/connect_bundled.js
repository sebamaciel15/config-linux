(() => {
    "use strict";
    const ChromeStorageReadError = "Failed to read chrome storage. Please refresh the page and try again";
    const ChromeStorageReader = new class {
        async getItemsAsync(items) {
            return new Promise(((resolve, reject) => {
                chrome.storage.local.get(items, (result => {
                    chrome.runtime.lastError ? reject(new Error(ChromeStorageReadError)) : resolve(result);
                }));
            }));
        }
        async getAllItemsAsync() {
            return new Promise(((resolve, reject) => {
                chrome.storage.local.get(null, (result => {
                    chrome.runtime.lastError ? reject(new Error(ChromeStorageReadError)) : resolve(result);
                }));
            }));
        }
    };
    Object.freeze(ChromeStorageReader);
    const ChromeStorage_ChromeStorageReader = ChromeStorageReader;
    const ChromeStorageWriter = new class {
        async setItemsAsync(items) {
            return new Promise(((resolve, reject) => {
                chrome.storage.local.set(items, (() => {
                    chrome.runtime.lastError ? reject(new Error("Failed to write to chrome storage. Please refresh the page and try again")) : resolve();
                }));
            }));
        }
    };
    Object.freeze(ChromeStorageWriter);
    const ChromeStorage_ChromeStorageWriter = ChromeStorageWriter;
    chrome.runtime.id;
    const SessionMap = new class {
        async getRedirectDataForTabAsync(tabId) {
            const redirectDataMap = (await ChromeStorage_ChromeStorageReader.getItemsAsync([ "redirectDataMap" ])).redirectDataMap, sessionDataKey = this._getKeyForSessionData(tabId);
            if (redirectDataMap && redirectDataMap[sessionDataKey]) {
                const redirectData = redirectDataMap[sessionDataKey];
                if (this._isRedirectDataValid(redirectData)) return redirectData;
                await this.deleteRedirectDataForTabAsync(tabId);
            }
        }
        async deleteRedirectDataForTabAsync(tabId) {
            const redirectDataMap = (await ChromeStorage_ChromeStorageReader.getItemsAsync([ "redirectDataMap" ])).redirectDataMap, redirectDataKey = this._getKeyForSessionData(tabId);
            redirectDataMap && redirectDataMap[redirectDataKey] && delete redirectDataMap[redirectDataKey], 
            await ChromeStorage_ChromeStorageWriter.setItemsAsync({
                redirectDataMap
            });
        }
        _getKeyForSessionData(tabId) {
            return tabId;
        }
        filterPhaseScriptData(phaseData) {
            return this._removeInvalidSessionDataInMap(phaseData);
        }
        async storeRedirectDataForTabAsync(redirectData, tabId) {
            const dataKey = this._getKeyForSessionData(tabId);
            let redirectDataMap = await ChromeStorage_ChromeStorageReader.getItemsAsync([ "redirectDataMap" ]);
            redirectDataMap[dataKey] = redirectData, redirectDataMap = this._removeInvalidSessionDataInMap(redirectDataMap), 
            await ChromeStorage_ChromeStorageWriter.setItemsAsync({
                redirectDataMap
            });
        }
        _removeInvalidSessionDataInMap(sessionMap) {
            return function(obj, predicate) {
                const result = {};
                let key;
                for (key in obj) obj.hasOwnProperty(key) && predicate(obj[key]) && (result[key] = obj[key]);
                return result;
            }(sessionMap, this._isRedirectDataValid);
        }
        _isRedirectDataValid(redirectData) {
            const storedDate = redirectData.date;
            return void 0 !== storedDate && "number" == typeof storedDate && storedDate <= Date.now() && Date.now() - storedDate < 108e5;
        }
    };
    Object.freeze(SessionMap);
    const ChromeStorage_SessionMap = SessionMap;
    function sendResolve(message) {
        window.top.postMessage(message, "https://staging.tele.pe"), window.top.postMessage(message, "https://www.tele.pe");
    }
    async function getCurrentTabIdAsync() {
        return new Promise((resolve => {
            chrome.tabs.query({
                active: !0,
                currentWindow: !0
            }, (function(tabs) {
                const tabId = tabs[0].id;
                resolve(tabId);
            }));
        }));
    }
    console.log("Here"), window.addEventListener("message", (function(event) {
        console.log("Got event"), "https://staging.tele.pe" !== event.origin && "https://www.tele.pe" !== event.origin || (event.data && event.data.sessionId ? async function(sessionData) {
            const tabId = await getCurrentTabIdAsync();
            tabId && await ChromeStorage_SessionMap.storeRedirectDataForTabAsync(sessionData, tabId);
            sendResolve("resolveRedirect");
        }(event.data) : event.data && "SetOldScript" == event.data.type ? async function() {
            const tabId = await getCurrentTabIdAsync();
            tabId ? chrome.storage.local.get("oldScriptMap", (res => {
                var _res$oldScriptMap;
                let oldScriptMap = null !== (_res$oldScriptMap = res.oldScriptMap) && void 0 !== _res$oldScriptMap ? _res$oldScriptMap : {};
                oldScriptMap[tabId] = {
                    date: Date.now()
                }, oldScriptMap = ChromeStorage_SessionMap.filterPhaseScriptData(oldScriptMap), 
                chrome.storage.local.set({
                    oldScriptMap
                }, (() => {
                    sendResolve("resolvePhase");
                }));
            })) : sendResolve("resolvePhase");
        }() : event.data && "SetNewScript" === event.data.type && async function() {
            const tabId = await getCurrentTabIdAsync();
            tabId ? chrome.storage.local.get("newScriptMap", (res => {
                var _res$newScriptMap;
                let newScriptMap = null !== (_res$newScriptMap = res.newScriptMap) && void 0 !== _res$newScriptMap ? _res$newScriptMap : {};
                newScriptMap[tabId] = {
                    date: Date.now()
                }, newScriptMap = ChromeStorage_SessionMap.filterPhaseScriptData(newScriptMap), 
                chrome.storage.local.set({
                    newScriptMap
                }, (() => {
                    sendResolve("resolvePhase");
                }));
            })) : sendResolve("resolvePhase");
        }());
    }), !1);
})();