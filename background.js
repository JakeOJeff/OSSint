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