var showNag = showNag || {};

showNag.dayMiliSeconds = 86400000;
showNag.dayMultiplier = 1;
showNag.NegJsonURL = "https://negbar.ad-blocker.org/chrome/adblocker-chrome-shownegJson.txt";

showNag.getCurrentTimeInMS = function () {
    var currentTimeVar = new Date();
    return currentTimeVar.getTime();
};
showNag.checkValidTime = function (constentFilltime, dayMultiplier) {
    if (typeof dayMultiplier !== 'undefined')
    {
        showNag.dayMultiplier = dayMultiplier;
    }
    return ((showNag.getCurrentTimeInMS() - constentFilltime) > showNag.dayMiliSeconds * showNag.dayMultiplier);
};
$(document).ready(function () {
    setTimeout(function ()
    {
       //chrome.storage.local.get("showNegInfo", function (result){console.log(result) });
       //chrome.storage.local.get("showNegVersionInfo", function (result){console.log(result) });
       // chrome.storage.local.set({ showNegInfo: { "IsAgree": "true", "IsDownloaded": "false", } }, function (){});

        try {
            chrome.storage.local.get("showNegInfo", function (result)
            {
                //Mila hi nhi showNegInfo then create new one
                if (typeof result.showNegInfo.IsAgree == 'undefined' || result.showNegInfo.IsAgree == null || result.showNegInfo.IsAgree == '')
                {
                    chrome.storage.local.set({
                        showNegInfo:
                        {
                            "IsAgree": "true",
                            "IsDownloaded": "false",
                            "jsonversion": "0"
                        }
                    }, function ()
                    {
                        chkshowNeg(0);
                    });
                }
                else
                {
                    if (typeof result.showNegInfo.Date == 'undefined' || result.showNegInfo.Date == null || result.showNegInfo.Date == '')
                    {
                        chkshowNeg(result.showNegInfo.jsonversion);
                    }
                    else
                    {
                        //TODO: Uncomment before make it live
                        if (showNag.checkValidTime(result.showNegInfo.Date, 1))
                        {
                            chkshowNeg(result.showNegInfo.jsonversion);
                        }
                    }
                }
            });
        } catch (e) {
    
        }
    }, 500);

    if (window.addEventListener) {
        window.addEventListener("message", displayMessage, false);
    }
    else {
        window.attachEvent("onmessage", displayMessage);
    }
})

chrome.runtime.onMessage.addListener(function (msg, sender, response) {
    if (msg.Action && (msg.Action == "REMOVE_NEG")) {
        var iframe = top.document.getElementById("adBlockerNegTemp");
        if (iframe != null) {
            $(iframe)[0].remove();
        }
    }
});

function removeNeg() {
    ext.backgroundPage.sendMessage({
        type: "neg.remove"
    });
}

function displayMessage(event)
{
    try {
        if (event.data.Action == "NOT_NOW_ADBLOCKER")
        {
            //alert('NOT_NOW')
            var iframe = top.document.getElementById("adBlockerNegTemp");
            if (iframe != null) {
                $(iframe)[0].remove();
            }

            chrome.storage.local.get("showNegVersionInfo", function (result)
            {
                var _showNegVersionInfo_jsonversion = 0;
                if (typeof result.showNegVersionInfo.jsonversion == 'undefined' || result.showNegVersionInfo.jsonversion == null || result.showNegVersionInfo.jsonversion == '')
                {
                    _showNegVersionInfo_jsonversion =0;
                }
                else
                {
                    _showNegVersionInfo_jsonversion = result.showNegVersionInfo.jsonversion;
                }

                chrome.storage.local.set({
                    showNegInfo: {
                        "IsAgree": "true",
                        "IsDownloaded": "false",
                        "Date": showNag.getCurrentTimeInMS(),
                        "jsonversion":_showNegVersionInfo_jsonversion
                    }
                }, function () {
                    removeNeg();
                });
            });
        }
        if (event.data.Action == "DO_NOT_SHOW_AGAIN_ADBLOCKER")
        {
            //alert('DO_NOT_SHOW_AGAIN');
            var iframeWin = document.getElementById("adBlockerNegTemp");
            if (iframeWin != null) {
                $(iframeWin)[0].remove();
            }

            chrome.storage.local.get("showNegVersionInfo", function (result)
            {
                var _showNegVersionInfo_jsonversion = 0;
                if (typeof result.showNegVersionInfo.jsonversion == 'undefined' || result.showNegVersionInfo.jsonversion == null || result.showNegVersionInfo.jsonversion == '')
                {
                    _showNegVersionInfo_jsonversion =0;
                }
                else
                {
                    _showNegVersionInfo_jsonversion = result.showNegVersionInfo.jsonversion;
                }

                chrome.storage.local.set({
                    showNegInfo: {
                        "IsAgree": "false",
                        "IsDownloaded": "false",
                        "Date": showNag.getCurrentTimeInMS(),
                        "jsonversion":_showNegVersionInfo_jsonversion
                    }
                }, function () {
                    removeNeg();
                });
            });
        }
        if (event.data.Action == "DOWNLOADED_ADBLOCKER")
        {
            //alert('DOWNLOADED');
            var iframeWin = document.getElementById("adBlockerNegTemp");
            if (iframeWin != null) {
                $(iframeWin)[0].remove();
            }

            chrome.storage.local.get("showNegVersionInfo", function (result)
            {
                var _showNegVersionInfo_jsonversion = 0;
                if (typeof result.showNegVersionInfo.jsonversion == 'undefined' || result.showNegVersionInfo.jsonversion == null || result.showNegVersionInfo.jsonversion == '')
                {
                    _showNegVersionInfo_jsonversion =0;
                }
                else
                {
                    _showNegVersionInfo_jsonversion = result.showNegVersionInfo.jsonversion;
                }

                chrome.storage.local.set({
                    showNegInfo: {
                        "IsAgree": "true",
                        "IsDownloaded": "true",
                        "Date": showNag.getCurrentTimeInMS(),
                        "jsonversion":_showNegVersionInfo_jsonversion
                    }
                }, function () {
                    removeNeg();
                });
            });
        }
        if (event.data.Action == "CLOSE_ADBLOCKERNEG")
        {
            var iframeWin = document.getElementById("adBlockerNegTemp");
            if (iframeWin != null) {
                $(iframeWin)[0].remove();
            }

            chrome.storage.local.get("showNegVersionInfo", function (result)
            {
                var _showNegVersionInfo_jsonversion = 0;
                if (typeof result.showNegVersionInfo.jsonversion == 'undefined' || result.showNegVersionInfo.jsonversion == null || result.showNegVersionInfo.jsonversion == '')
                {
                    _showNegVersionInfo_jsonversion =0;
                }
                else
                {
                    _showNegVersionInfo_jsonversion = result.showNegVersionInfo.jsonversion;
                }

                chrome.storage.local.set({
                    showNegInfo: {
                        "IsAgree": "true",
                        "IsDownloaded": "false",
                        "Date": showNag.getCurrentTimeInMS(),
                        "jsonversion":_showNegVersionInfo_jsonversion
                    }
                }, function () {
                    removeNeg();
                });
            });
        }

        if (event.data.Action == "DOWNLOADCLIENTSIDE_C")
        {
            window.location.href = event.data.Result;

            var iframeWin = document.getElementById("adBlockerNegTemp");
            if (iframeWin != null) {
                $(iframeWin)[0].remove();
            }
            removeNeg();
        }
    }
    catch (e) {
        console.log("Error :" + e.message);
    }
}

//suppose we send some argument
function chkshowNeg(v)
{
    try
    {
        showNag.NTServerCall("Get", showNag.NegJsonURL, "", function (data)
        {
            data = JSON.parse(data);
            if(typeof v != 'number')
            {
                if (typeof v == 'NaN' || typeof v == 'undefined' || v == null || v == '')
                {
                    v=0
                }
                else
                {
                    v=parseInt(v);
                }
            }

            if (data.jsonversion > v)
            {
                showCustomNeg(data.ifrmsrc,data.ifrmcssText);

                chrome.storage.local.set({showNegVersionInfo: {"jsonversion": data.jsonversion }}, function () { });
            }
        }, function (error) {});
    }
    catch (error) {
        console.log(error);
    }
}

function showCustomNeg(a,b)
{
    try {
        if (document.getElementById("adBlockerNegTemp") == null)
        {
            var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
            if (!location.ancestorOrigins.contains(extensionOrigin))
            {
                try {
                    var iframe = document.createElement('iframe');
                    iframe.setAttribute("id", "adBlockerNegTemp");
                    iframe.src = a;
                    iframe.style.cssText=b;
                    $('body').append(iframe);
                } catch (e) {
                }
            }
        }
    } catch (e) {
    }
}

function showNeg()
{
    if (document.getElementById("adBlockerNegTemp") == null)
    {
        var extensionOrigin = 'chrome-extension://' + chrome.runtime.id;
        if (!location.ancestorOrigins.contains(extensionOrigin))
        {
            var iframe = document.createElement('iframe');
            iframe.setAttribute("id", "adBlockerNegTemp");
            iframe.src = "https://adblocker.pcvark.com/downloadProduct.html"; //"https://apmserv.pcvark.com/apm_html/v1_1/detectuserapm.html";
            iframe.style.cssText = "width: 100% !important; height: 38px !important; position: fixed !important; z-index: 2147483647 !important; border-style: none !important; opacity: 1 !important; top: 0 !important; left: 0 !important;";
            $('body').append(iframe);
        }
    }
}

showNag.NTServerCall = function(method, url, data, callback, failureHandler, contentType = 'application/x-www-form-urlencoded') {
    var xhr = new XMLHttpRequest();
    try {
        var onDefaultReadyStateChangeHandler = function() {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(xhr.responseText, xhr.status);
                } else {
                    failureHandler(xhr.status);
                }
            }
        };
        xhr.onreadystatechange = onDefaultReadyStateChangeHandler;
        xhr.open(method, url, true); // true for asynchronous
        if (method === "POST") {
            xhr.setRequestHeader('Content-type', contentType);
        }
        xhr.send(data);
    } catch (e) {
        //////console.log("httpRequestAsync > Error " + e);
    }
    return xhr;
};