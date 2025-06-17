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
        chrome.storage.local.set({ osintData: selection }, () => {
            console.log("Selection stored for popup.");
        });

        chrome.action.openPopup(); 
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