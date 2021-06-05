const domains = [
    "www.megajatek.hu",
    "www.jeuxjeuxjeux.fr",
    "www.1001oyun.com",
    "poki.ro",
    "www.megaspel.se",
    "poki.de",
    "www.paisdelosjuegos.com.ar",
    "poki.it",
    "poki.dk",
    "www.123pelit.com",
    "poki.no",
    "www.moiteigri.com",
    "poki.pl",
    "www.hrajhry.sk",
    "poki.gr",
    "poki.com.br",
    "poki.cz",
    "www.trochoi.net",
    "poki.nl",
    "poki.be",
    "poki.pt",
    "www.paisdelosjuegos.cl",
    "www.paisdelosjuegos.com.mx",
    "www.paisdelosjuegos.com.co",
    "www.paisdelosjuegos.es",
    "www.jeuxjeuxjeux.ch",
    "www.spielyeti.ch",
    "poki.at",
    "www.paisdelosjuegos.com.uy",
    "www.paisdelosjuegos.com.pe",
    "www.paisdelosjuegos.com.ec",
    "www.paisdelosjuegos.co.ve",
    "www.paisdelosjuegos.com.do",
    "poki.by",
    "www.paisdelosjuegos.cr",
    "www.paisdelosjuegos.com.pa",
    "poki.cn",
    "poki.jp",
    "poki.co.il",
    "poki.com",
    "stage.poki.com",
    "acc.poki.com",
];

function pushEvent(eventNoun, eventVerb, eventData) {
    window.dataLayer.push({
        event: `${eventNoun}-${eventVerb}`,
        eventNoun,
        eventVerb,
        eventData,

        // Clear older values from the eventData object.
        //
        // By default GTM merges objects added to the Data Layer, but we don't want that.
        //
        // This does not clear other values added to the Data Layer in other places.
        //
        // This is an undocumented API that other people also use.
        // This is the best and fastest way to clear all unused values from the dataLayer.
        // Another option would be to call window['google_tag_manager']['GTM-XXXXXX'].dataLayer.reset();
        // which is as far as I can see also an undocumented API.
        // Pushing null really has a bad effect on performance.
        _clear: true,
    });
}

const chromeContextMenuClick = (info, tab) => {
    if (!info.hasOwnProperty("selectionText") || info.selectionText === undefined) {
        chrome.tabs.create({ url: "https://poki.com/" });
    } else {
        let target = info.selectionText;
        target = target.toLowerCase();
        chrome.tabs.create({ url: "https://poki.com/#search=" + target });
    }
};

const enableFlashPlugin = () => {
    domains.forEach(domain => {
        chrome.contentSettings.plugins.set(
            {
                primaryPattern: "*://" + domain + "/*",
                setting: "allow",
                scope: "regular",
            },
            () => {
                // debugger;
            }
        );
    });
};

let wasJustInstalled = false;

const chromeInstalled = ({ reason }) => {
    // creating context menu
    chrome.contextMenus.create({
        title: "Poki",
        id: "open",
        contexts: ["page", "selection", "image", "link"],
    });

    enableFlashPlugin();

    // refresh all the poki tabs
    if (reason !== "install") return;

    wasJustInstalled = true;
    pushEvent("lifecycle", "install");
};

chrome.runtime.onMessageExternal.addListener((request, sender, sendResponse) => {
    // check if Extension is enabled
    sendResponse({
        extension: true,
        flash: true,
        wasJustInstalled,
    });

    // only send this once
    wasJustInstalled = false;
});

chrome.runtime.onInstalled.addListener(chromeInstalled);
chrome.contextMenus.onClicked.addListener(chromeContextMenuClick);

//
chrome.permissions.contains(
    {
        permissions: ["gcm", "storage", "notifications", "identity"],
    },
    result => {
        if (result) {
            console.log('Listening...');
            OneSignal.init({ appId: "e16320b0-eb95-4fad-b8f0-1e4ca4793eca", googleProjectNumber: "1085303717283" });
        } else {
            console.log('Not listening...');
        }
    }
);

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {

        if (request.init){
            // init
            OneSignal.init({ appId: "e16320b0-eb95-4fad-b8f0-1e4ca4793eca", googleProjectNumber: "1085303717283" });
            sendResponse({init: "done"});
        }
  });
