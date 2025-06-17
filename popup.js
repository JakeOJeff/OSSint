document.addEventListener("DOMContentLoaded", () => { // HTML fully Loaded
    chrome.storage.local.get("osintData", (data) => {
        if (data.osintData) {
            document.getElementById("input").value = data.osintData;
            runOSINT(data.osintData);
        }
    });
    document.getElementById("lookup").addEventListener("click", () => {
        const value = document.getElementById("input").value.trim();
        runOSINT(value);
    });
});

function runOSINT(input) {
    const resultDiv = document.getElementById("results");
    resultDiv.textContent = "Scanning...";

    // Save current input in local storage for fallback
    chrome.storage.local.set({ osintData: input });

    // IP CHECK
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(input)) {
        fetch(`https://ipapi.co/${input}/json/`)
            .then(res => res.json())
            .then(data => resultDiv.textContent = JSON.stringify(data, null, 2))
            .catch(err => resultDiv.textContent = "IP lookup failed");
    }

    // EMAIL CHECK
    else if (input.includes("@")) {
        resultDiv.textContent = "Checking for breaches... (UNAVAILABLE)";
    }

    // DOMAIN CHECK
    else if (input.includes(".")) {
        if (!isValidDomain(input)) {
            resultDiv.textContent = "Invalid domain format";
            return;
        }
        fetch(`https://api.whoxy.com/?key=TEMP&whois=${input}`)
            .then(res => res.json())
            .then(data => resultDiv.textContent = JSON.stringify(data, null, 2))
            .catch(err => resultDiv.textContent = "Domain lookup failed");
    }

    // FALLBACK TO DORK
    else {
        chrome.storage.local.get("dorkFilters", (res) => {
            const { filetype, inurl, intitle } = res.dorkFilters || {};
            let queryParts = [];

            if (filetype) queryParts.push(`filetype:${filetype}`);
            if (inurl) queryParts.push(`inurl:${inurl}`);
            if (intitle) queryParts.push(`intitle:${intitle}`);

            queryParts.push(input);

            const dorkQuery = queryParts.join(" ");
            const url = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`;
            chrome.tabs.create({ url });
        });
    }
}

function isValidDomain(domain) {
    // Simple regex for basic domain validation
    const pattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return pattern.test(domain);
}
