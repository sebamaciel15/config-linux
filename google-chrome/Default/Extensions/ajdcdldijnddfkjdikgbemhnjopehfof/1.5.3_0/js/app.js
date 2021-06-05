Array.from(document.querySelectorAll("a")).forEach(link => {
    // this could be done in the HTML but I'm lazy
    link.setAttribute("target", "_blank"); // otherwise they won't open

    // add UTM
    const url = new URL(link.getAttribute("href"));
    url.searchParams.set("utm_source", "chrome_extension");
    url.searchParams.set("utm_medium", "install");
    url.searchParams.set("utm_campaign", "Poki Chrome extension");
    link.setAttribute("href", url);
});

chrome.permissions.contains(
    {
        permissions: ["notifications", "identity"],
    },
    result => {
        if (result) {
            /* we have permission, listen */
            createListenerNotifications();
        } else {
            /* ask with UI */
            createPermissionButton();
        }
    }
);

const createListenerNotifications = () => {
    // might need a restart for background

    chrome.runtime.sendMessage({init: true}, function(response) {
      console.log("Setup listener...");
    });

    console.log("Ready for notifications.");

    OneSignal.sendTags({extension: true, version: '1.5.2'});
};

const createPermissionButton = () => {
    const actions = document.querySelector("#actions");
    const button = document.createElement("button");
    button.innerText = "Get new game updates";

    button.addEventListener("click", function(event) {
        // Permissions must be requested from inside a user gesture, like a button's
        // click handler.
        chrome.permissions.request(
            {
                permissions: ["gcm", "storage", "notifications", "identity"],
            },
            function(granted) {
                // The callback argument will be true if the user granted the permissions.
                if (granted) {
                    createListenerNotifications();
                } else {
                    // hide for next time?
                }
            }
        );
    });
    actions.appendChild(button);
};
