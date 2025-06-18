document.addEventListener("DOMContentLoaded", () => {
    // Load the saved OSINT input if available
    chrome.storage.local.get("osintData", (data) => {
        if (data.osintData) {
            document.getElementById("input").value = data.osintData;
            chrome.storage.local.remove("osintData");
        }
    });

    // Attach Scan button handler
    document.getElementById("lookup").addEventListener("click", () => {
        const input = document.getElementById("input").value.trim();
        const filetypeRaw = document.getElementById("filetype").value.trim();
        const inurl = document.getElementById("inurl").value.trim();
        const intitle = document.getElementById("intitle").value.trim();

        const filetype = filetypeRaw
            ? filetypeRaw.split(",").map(ft => ft.trim()).filter(Boolean)
            : [];

        runOSINT(input, { filetype, inurl, intitle });
    });

    document.getElementById("detect").addEventListener("click", () => {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
            if (tabs && tabs.length > 0) {
                const currentURL = tabs[0].url;
                console.log("Current URL:", currentURL);
                document.getElementById("inputTool").value = currentURL;
            }
        });
    });

// Attach Save Dork Settings handler
document.getElementById("saveDorkOptions").addEventListener("click", () => {
    const filetypeRaw = document.getElementById("filetype").value.trim();
    const inurl = document.getElementById("inurl").value.trim();
    const intitle = document.getElementById("intitle").value.trim();

    const filetype = filetypeRaw
        ? filetypeRaw.split(",").map(ft => ft.trim()).filter(Boolean)
        : [];

    chrome.storage.local.set({
        dorkFilters: { filetype, inurl, intitle }
    });

    if (filetype.length || inurl || intitle) {
        alert("Settings have been saved to Session Storage!");
    }
});
});

// Tab switching logic
window.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".tablinks");

    tabButtons.forEach(button => {
        button.addEventListener("click", function (evt) {
            const tabName = this.getAttribute("data-tab");
            openTab(evt, tabName);
        });
    });

    if (tabButtons.length > 0) {
        tabButtons[0].click();
    }
});

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    const tablinks = document.getElementsByClassName("tablinks");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].classList.remove("active");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.classList.add("active");
}

function runOSINT(input, filters) {
    const resultDiv = document.getElementById("results");
    resultDiv.textContent = "Scanning...";

    const HIBP_API_KEY = "nil"; // Replace with real key
    const API_NINJAS_KEY = "nil"; // Replace with real key

    if (!API_NINJAS_KEY) {
        console.error("API_NINJAS_KEY not found in environment variables!");
    }

    // IP CHECK
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(input)) {
        fetch(`https://ipapi.co/${input}/json/`)
            .then(res => res.json())
            .then(data => resultDiv.textContent = JSON.stringify(data, null, 2))
            .catch(err => resultDiv.textContent = "IP lookup failed");
    }

    // EMAIL CHECK
    else if (input.includes("@")) {
        resultDiv.textContent = "Checking for breaches...";
        fetch(`https://haveibeenpwned.com/api/v3/breachedaccount/${encodeURIComponent(input)}?truncateResponse=false`, {
            headers: {
                "hibp-api-key": HIBP_API_KEY,
                "User-Agent": "OSSint Extension"
            }
        })
            .then(res => {
                if (res.status === 404) {
                    resultDiv.textContent = "No breaches found.";
                    return;
                }
                if (!res.ok) throw new Error("Failed to fetch breach data");
                return res.json();
            })
            .then(data => {
                if (data) {
                    resultDiv.textContent = "Breaches Found:\n" + JSON.stringify(data, null, 2);
                }
            })
            .catch(err => resultDiv.textContent = `Error: ${err.message}`);
    }

    // DOMAIN CHECK
    else if (input.includes(".")) {
        if (!isValidDomain(input)) {
            resultDiv.textContent = "Invalid domain format";
            return;
        }

        resultDiv.textContent = "Checking domain info...";
        fetch(`https://api.api-ninjas.com/v1/whois?domain=${input}`, {
            headers: {
                "X-Api-Key": API_NINJAS_KEY
            }
        })
            .then(async res => {
                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`API error: ${res.status} - ${errorText}`);
                }
                return res.json();
            })
            .then(data => {
                if (Object.keys(data).length === 0) {
                    resultDiv.textContent = "No WHOIS data found.";
                } else {
                    resultDiv.textContent = JSON.stringify(data, null, 2);
                }
            })
            .catch(err => {
                resultDiv.textContent = `Error: ${err.message}`;
            });
    }

    // GOOGLE DORK FALLBACK
    else {
        const queryParts = [];

        if (filters?.filetype?.length) {
            const filetypeQuery = filters.filetype.map(ft => `filetype:${ft}`).join(" OR ");
            queryParts.push(`(${filetypeQuery})`);
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
