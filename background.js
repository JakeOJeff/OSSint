// Right Click Context Menu

chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: "osint-lookup",
        title: "Run OSINT on \"%s\"",
        contexts: ["selection"]
    });
});


// Left Clicked Menu ( Main Popup )

chrome.contextMenus.onClicked.addListener((info, tab) => {
    const selected = info.selectionText.trim();
    chrome.storage.local.set({ osintData: selected });
    chrome.action.openPopup(); // Popup Open
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