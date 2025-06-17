// Right Click Context Menu

chrome.runtime.onInstalled.addListener(() => {

    chrome.contextMenus.create({
        id: "osint",
        title: "OSINT Lookup: \"%s\"",
        contexts: ["selection"]
    });

});


// Left Clicked Menu ( Main Popup )

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selection = info.selectionText.trim();

    if (info.menuItemId === "osint") {
        // Save the selection text into local storage for the popup to access
        chrome.storage.local.set({ osintData: selection }, () => {
            // Optionally, you can open the popup or notify the user here
            console.log("Selection stored for popup.");
        });

        // Open the extension popup (optional, or guide user to click extension icon)
        chrome.action.openPopup(); // Optional, available in MV3
    }
});


// onInstalled → Runs once when extension is installed.
// contextMenus.create → Adds a nenu item when right clicked on selected text
// onClicked → When the menu is clicked, store the text and open the popup.

/*
    "icons": {
        "16": "iconSS.png",
        "48": "iconS.png",
        "128": "icon.png"
    }
*/