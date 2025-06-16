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

function runOSINT(input){

    const resultDiv = document.getElementById("results");
    resultDiv.textContent = "Scanning";


    //IP CHECK
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(input)) {
        fetch(`https://ipapi.co/${input}/json/`)
            .then(res => res.json())
            .then(data => resultDiv.textContent = JSON.stringify(data, null, 2));
    }

    //EMAIL CHECK\
    else if (input.includes("@")) {
        resultDiv.textContent = "Checking for breaches... (UNAVAILABLE)";
    }

    //DOMAIN CHECK
    else if(input.includes(".")){
        fetch(`https://api.hackertarget.com/whois/?q=${input}`)
            .then(res => res.text())
            .then(data => resultDiv.textContent = data);
    }

    //ERROR fallback
    else {
        resultDiv.textContent = "Enabling"
        chrome.storage.local.get("dorkFilters", (res) => {
            const { filetype, inurl, intitle } = res.dorkFilters || {} ;

            let queryParts = [];

            if (filetype) queryParts.push(`filetype:${filetype}`);
            if (inurl) queryParts.push(`inurl:${inurl}`);
            if (intitle) queryParts.push(`intitle:${intitle}`);

            queryParts.push(selection)

            const dorkQuery = queryParts.join(" ");
            const url = `https://www.google.com/search?q=${encodeURIComponent(dorkQuery)}`;

            
            chrome.tabs.create({ url })
        })
    }
}

