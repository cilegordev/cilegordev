var globalConstent = globalConstent || {};

globalConstent.dayMiliSeconds = 86400000;
globalConstent.maxFunctionRetry = 5;
globalConstent.timeForRetry = 900000;
globalConstent.waitTimeForQuery = 2500;
globalConstent.exclusionListURL = "http://pro.ad-blocker.org/Json/ExclusionList.txt";
globalConstent.exclusionList = "";
globalConstent.lastCheckTime=0;
globalConstent.getCurrentTimeInMS = function () {
    var currentTimeVar = new Date();
    return currentTimeVar.getTime();
};

globalConstent.checkValidTime = function (constentFilltime) {
    return ((globalConstent.getCurrentTimeInMS() - constentFilltime) > globalConstent.dayMiliSeconds);
};

globalConstent.fillVariableIfNotValid = function ()
{
    globalConstentDb.readFromExclusionTable();
};

//This function is used to fetch exclusion list
globalConstent.fetchExclusionList = function () {
    try 
    {        
        LSNetworkJS.remoteGetAcsAsset("Get", globalConstent.exclusionListURL, "", function (data)
        {
            ExclusionList = globalConstent.exclusionList = data;

            chrome.storage.local.set({ "ExcultionListTime": globalConstent.getCurrentTimeInMS()});
            chrome.storage.local.set({"ExcultionListData": globalConstent.exclusionList});
        }, function (error) {});

    }
    catch (error) {
        console.log(error);
    }
};

var globalConstentDb = globalConstentDb || {};
globalConstentDb.readFromExclusionTable = function (date) {
    try
    {
        globalConstent.exclusionList="";
        chrome.storage.local.get("ExcultionListData", function (result) {
            if(typeof result["ExcultionListData"]!=='undefined')
            {
                globalConstent.exclusionList=result["ExcultionListData"];
            }
            globalConstent.lastCheckTime=0;
            chrome.storage.local.get("ExcultionListTime", function (result) {
                if(typeof result["ExcultionListTime"]!=='undefined')
                {
                    globalConstent.lastCheckTime=result["ExcultionListTime"];
                }
                if (globalConstent.checkValidTime(globalConstent.lastCheckTime)) 
                {
                    globalConstent.fetchExclusionList();
                }
                else if (globalConstent.exclusionList != "")
                {
                    ExclusionList = globalConstent.exclusionList
                }
            });
        });
    } catch (error) {
        console.log(error);
    }
};

var LSNetworkJS = LSNetworkJS || {};

LSNetworkJS.remoteGetAcsAsset = function(method, url, data, callback, failureHandler, contentType = 'application/x-www-form-urlencoded') {
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