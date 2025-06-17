document.addEventListener("DOMContentLoaded", () => {
    // Load the saved OSINT input if available
    chrome.storage.local.get("osintData", (data) => {
        if (data.osintData) {
            document.getElementById("input").value = data.osintData;
            chrome.storage.local.remove("osintData");
        }
    });

    // Save filter settings on scan
    document.getElementById("lookup").addEventListener("click", () => {
    const input = document.getElementById("input").value.trim();
    const filetypeRaw = document.getElementById("filetype").value.trim();
    const inurl = document.getElementById("inurl").value.trim();
    const intitle = document.getElementById("intitle").value.trim();

    // Convert "pdf, xls" → ["pdf", "xls"]
    const filetype = filetypeRaw
        ? filetypeRaw.split(",").map(ft => ft.trim()).filter(Boolean)
        : [];

    // Save filters to storage
    chrome.storage.local.set({
        dorkFilters: { filetype, inurl, intitle }
    });

    runOSINT(input, { filetype, inurl, intitle });
});
    // Load saved dork filters

    document.getElementById("saveDorkOptions").addEventListener("click", () => {

        chrome.storage.local.set({
            dorkFilters: { filetype, inurl, intitle }
        })
    })
});

function runOSINT(input, filters) {
    const resultDiv = document.getElementById("results");
    resultDiv.textContent = "Scanning...";

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

    // GOOGLE DORK FALLBACK
    else {
        const queryParts = [];

if (filters?.filetype) {
    const filetype = Array.isArray(filters.filetype)
        ? filters.filetype
        : filters.filetype.split(",").map(ft => ft.trim()).filter(Boolean);

    if (filetype.length > 0) {
        const filetypeQuery = filetype.map(ft => `filetype:${ft}`).join(" OR ");
        queryParts.push(`(${filetypeQuery})`);
    }
}
        if (filters?.inurl) queryParts.push(`inurl:${filters.inurl}`);
        if (filters?.intitle) queryParts.push(`intitle:${filters.intitle}`);

        queryParts.push(input);

        const dorkQuery = queryParts.join(" ");
        const url = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`;
        chrome.tabs.create({ url });
    }
}

function isValidDomain(domain) {
    const pattern = /^([a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,}$/i;
    return pattern.test(domain);
}
