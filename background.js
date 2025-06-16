// Right Click Context Menu

chrome.runtime.onInstalled.addListener(() => {

    chrome.contextMenus.create({
        id: "osint",
        title: "OSINT Lookup: \"%s\"",
        contexts: ["selection"]
    })


    chrome.contextMenus.create({
        id: "scan",
        title: "Scan : \"%s\"",
        contexts: ["selection"]
    });
});


// Left Clicked Menu ( Main Popup )

chrome.contextMenus.onClicked.addListener((info, tab) => {
    
    const selection = info.selectionText.trim();

    if (info.menuItemId === "scan") {
        chrome.storage.local.set({ osintData: selection});
        chrome.action.openPopup();
    }

    if (info.menuItemId === "osint") {
        chrome.storage.local.get("dorkFilters", (res) => {
            const { filetype, inurl, intitle } = res.dorkFilters || {} ;

            let queryParts = [];

            if (filetype) queryParts.push(`filetype:${filetype}`);
            if (inurl) queryParts.push(`inurl:${inurl}`);
            if (intitle) queryParts.push(`intitle:${intitle}`);

            queryParts.push(selection)

            const dorkQuery = queryParts.join(" ");
            const url = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`;

            
            chrome.tabs.create({ url });
        });
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