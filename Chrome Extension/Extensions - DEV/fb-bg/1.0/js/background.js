function reloadpage(){
    chrome.tabs.query({
        "url": "*://*.facebook.com/*"
    }, function (tabs) {
        for (let tab in tabs) {
            chrome.tabs.reload(tabs[tab].id)
        }
    })
}
reloadpage();
var language;
if (window.navigator.languages) {
    language = window.navigator.languages[0];
} else {
    language = window.navigator.userLanguage || window.navigator.language;
}
console.log(language);

class background {
    constructor() {
        chrome.storage.local.get('fbtheme', function (options) {
            this.fbtheme = options.fbtheme;
        }.bind(this));
    }
    setOptionKey(name, key, value) {
        chrome.storage.local.get('fbtheme', function (options) {
            this.fbtheme = options.fbtheme;
        }.bind(this));

        if(!this.fbtheme){
            chrome.storage.local.get('fbtheme', function (options) {
                this.fbtheme = options.fbtheme;
                this.fbtheme.picture = value;

                chrome.storage.local.set({fbtheme: this.fbtheme}, function (options) {});

            }.bind(this));
        } else {
            this.fbtheme.picture = value;
            chrome.storage.local.set({fbtheme: this.fbtheme}, function (options) {});
        }
    }

    run() {
        chrome.runtime.onMessage.addListener(function (message, sender, callback) {
            let command = message.command,
                send = null;

            if (message.message == "import") {
                let image = message.image;
                this.setOptionKey("fbtheme", "picture", image);
                callback({response: "imported"});
                return;
            }
            if (callback) {
                callback(send)
            }
        }.bind(this));
    }
};
var bg = new background();
bg.run();

