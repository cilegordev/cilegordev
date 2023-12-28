class App {
    constructor() {
        this.self = this;
        this.options = {};
        this.changer = {};
    }
    run() {
        chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
            if (request.message == "chooseFile") {
                let imageLoad = document.createElement('input');
                imageLoad.type = 'file';
                imageLoad.accept = "image/png,image/gif,image/jpg,image/jpeg";
                imageLoad.addEventListener('change', function () {
                    let file = imageLoad.files[0],
                        reader = new FileReader();
                    reader.onloadend = function () {
                        chrome.runtime.sendMessage({message: "import", image: reader.result}, function (response) {});
                        sendResponse({})
                    }
                    reader.readAsDataURL(file);
                    form.reset();
                });

                let form = document.createElement('form');
                form.appendChild(imageLoad);

                imageLoad.click();
                sendResponse({response: "imageLoad clicked"});
            }
        }.bind(this));
        for (let i in this.changer) {
            try {
                this.changer[i].run();
            } catch (e) {
            }

        }
    }
}

class changer {
    constructor(){}
    run(){}
    addCSS(styleObject, id){

        if (!this.cover) {
            var x =   setTimeout(function () {
                let div = document.createElement('div');
                div.id = 'fbion_bg';
                try{
                    document.getElementsByTagName('body')[0].appendChild(div);
                    this.cover = div;
                    clearTimeout(x);
                } catch (e){
                }
            }.bind(this), 1000);
        }

        let element = null;
        if (typeof(styleObject) == 'string') {
            element = document.createElement('link');
            element.rel = 'stylesheet';
            element.type = 'text/css';
            element.href = styleObject;
            element.id = id;
        } else {
            let text = '';
            for (let i in styleObject) {
                text += i + '{'
                for (let j in styleObject[i]) {
                    let rule = styleObject[i][j]
                    if (/important/.test(rule)) {
                        throw Error('rules cannot have important in them')
                    }
                    text += j + ':' + rule + ' !important;'
                }
                text += '}'
            }
            element = document.createElement('style');
            element.id = id;
            element.innerHTML = text;
         }
        document.getElementsByTagName('head')[0].appendChild(element);
        return element;
    }
    removeCSS(id){
        var style = document.getElementById(id);
        if(style){
            style.remove();
            style.textContent = "";
        } else {}
    }
}
class fbtheme extends changer{
    constructor(){
        super();
        this.style = null;
        this.picture = null;
        this.cover = false;
        this.size = '';
        this.colors = {};
        this.on = true;
        this.id = 'fbtheme';
    }

    getStorage(){
        chrome.storage.local.get('fbtheme', function(items) {
            this.change(items.fbtheme);
        }.bind(this));
    }
    change(items){
        this.on = items.on;
        if(this.on == true){
            this.colors = {
                a: items.color_a,
                b: items.color_b,
                c: items.color_c,
                d: items.color_d,
                e: items.color_e
            };
            this.picture = items.picture;
            this.size = items.size;
            super.removeCSS(this.id);
            if(this.on == true){
                this.style = this.cssBuilder();
                super.addCSS(this.style, this.id);
            }
        } else {
            super.removeCSS(this.id);
        }
    }
    run(){
        chrome.storage.onChanged.addListener(function(changes, namespace) {
            this.getStorage();
        }.bind(this));
        this.getStorage();
    }
    cssBuilder() {
        var backgroundSize = 'cover';
        var backgroundRepeat = 'no-repeat';
        var backgroundPosition = 'center center';
        if (this.size == 'fit') {
            backgroundSize = 'contain';
        }
        else if (this.size == 'center') {
            backgroundSize = 'auto';
        }
        else if (this.size == 'repeat') {
            backgroundRepeat = 'repeat';
            backgroundSize = 'auto';
        }
        var obj = {
        	'#globalContainer *': {
                'border-color': 'transparent',
            },
            '#navFacebar > *:first-child': {
                'border': 'none',
                'background': 'none',
            },
            '#blueBar, .fbNubFlyoutTitlebar, #pagelet_bluebar, #blueBarDOMInspector, #blueBarNAXAnchor, #blueBarDOMInspector > *:first-child, #blueBarDOMInspector > *:first-child > *:first-child': {
                'background': this.colors.a,
                'border-bottom': 'none'
            },
            '#blueBar:after': {
                'background-image': 'none',
            },
            '#fbion_bg': {
                'background': ( this.picture ? 'url(\'' + this.picture.replace(/'/g, "\'") + '\') ' : '' ) + this.colors.b,
                'background-size': backgroundSize,
                'background-repeat': backgroundRepeat,
                'background-position': backgroundPosition,
                'height': '100%',
                'width': '100%',
                'position': 'fixed',
                'z-index': '-9999',
                'top': '0px',
                'left': '0px',
            },
            '#globalContainer .userContentWrapper .mtm,#globalContainer #pagelet_navigation #sideNav,#globalContainer #SettingsPage_Content ul.uiList li>div,#globalContainer ._63jc table.uiGrid td>div,#globalContainer .uiFutureSideNav .stat_elem,#globalContainer #bookmarksSeeAllEntSection .stat_elem,#globalContainer #leftCol .stat_elem,#globalContainer #rightCol .fixed_elem,#globalContainer #pagelet_timeline_main_column .userContentWrapper,#globalContainer .fb_content *,#globalContainer .uiContextualLayerParent div,a[role="button"],#contentCol, #rightCol .pagelet div, #pagelet_rhc_footer .uiContextualLayerParent div,div[role="article"] *,.UFIComment,#feedx_sprouts_container *,#watch_feed *,#entity_sidebar div,#content_container div': {
                'background-color': 'transparent',
            },
            '#globalContainer #rightCol #pagelet_reminders>div>div,#globalContainer .mtm a[rel="theater"],#globalContainer #sideNav,#globalContainer .uiHeaderPage,#globalContainer #SettingsPage_Content,#globalContainer div[section="[object Object]"],#globalContainer ._oj1 .mtm:first-child,#globalContainer ._nb_,#globalContainer ._63jc,#globalContainer ._2tip,#globalContainer #job_browser>div:first-child,#globalContainer #job_browser ul.uiList:first-child,#globalContainer ._vl2>div,#globalContainer div[aria-describedby="pageTitle"]>div:first-child,#globalContainer div[aria-describedby="pageTitle"] .userContentWrapper,#globalContainer ._p9q,#globalContainer #goodwill_weather_permalink>div,#globalContainer #stories_pagelet_rhc,#globalContainer #pagelet_ego_pane .egoOrganicColumn>div>div,#globalContainer #games_hub_root_content>div>div>div>div,#globalContainer ul.uiList li>div,#globalContainer div[data-testid="pageCreationHeaderBannerContainer"],#globalContainer table.uiGrid td>div,#globalContainer .stat_elem,#globalContainer #page_browser_liked,#globalContainer #goodwill_throwback_permalink_content>div>div,#globalContainer #pagelet_group_rhc .pagelet>div,#globalContainer #leftCol ._r_m,#globalContainer ._r_m,#globalContainer ._2xaj,#globalContainer .fixed_elem,#globalContainer #pagelet_timeline_medley_notes,#globalContainer #pagelet_timeline_medley_reviews,#globalContainer #pagelet_timeline_medley_did_you_know,#globalContainer #pagelet_timeline_medley_events,#globalContainer #pagelet_timeline_medley_games,#globalContainer #pagelet_timeline_medley_likes,#globalContainer #pagelet_timeline_medley_books,#globalContainer #pagelet_timeline_medley_tv,#globalContainer #pagelet_timeline_medley_movies,#globalContainer #pagelet_timeline_medley_music,#globalContainer #pagelet_timeline_medley_sports,#globalContainer #pagelet_timeline_medley_map,#globalContainer #pagelet_timeline_medley_videos,#globalContainer #pagelet_timeline_medley_photos,#globalContainer #pagelet_timeline_medley_about,#globalContainer #pagelet_timeline_medley_friends,#globalContainer #profile_timeline_overview_switcher_pagelet,#globalContainer #fbTimelineHeadline,#globalContainer .stickyHeaderWrap,#globalContainer .fbTimelineTwoColumn,#globalContainer #timeline_story_column .userContentWrapper,#globalContainer .uiScrollableAreaBody,#globalContainer .navigationFocus,#globalContainer div[direction="both"],#globalContainer .fbNubButton,#globalContainer button,.pagelet a[rel="async-post"],#feedx_sprouts_container,#globalContainer #pagelet_navigation,#pagelet_rhc_footer .uiContextualLayerParent,#globalContainer #watch_feed ._7gpu,#globalContainer #watch_feed ._7gsp,#globalContainer #watch_feed ._7gpb,#globalContainer ._50zm,#globalContainer ._20nr,#globalContainer #watch_feed video,#globalContainer #entity_sidebar,#content_container ._77by,#content_container ._4-u8': {
                'background-color': this.colors.e,
            },
            '#globalContainer ._oj1 .mtm:first-child,#globalContainer #sideNav,#globalContainer #job_browser ul.uiList:first-child,#globalContainer #leftCol ._r_m,#globalContainer ._r_m,#globalContainer ._50zm,#globalContainer #profile_timeline_overview_switcher_pagelet,#globalContainer #pagelet_navigation,#globalContainer #entity_sidebar,#globalContainer .navigationFocus,#globalContainer .uiScrollableAreaBody': {
                'padding': '10px',
                'border-radius': '8px',
                'box-sizing': 'border-box',
                'margin-bottom': '10px'
            },
            '#mainContainer': {
                'background': 'none',
                'border': 'none',
                'margin-top': '-1px',
            },
            '#content': {
                'background-color': this.colors.b
            },
            '#pageFooter': {
                'display': 'none',
            },
            '.genericStreamStory, .uiStreamHeader, #contentCol, #leftCol .item': {
                'border': 'none'
            },
            '#boulder_fixed_header > *, .UFIRow': {
                'background-color': 'transparent'
            },
            '.uiStreamEdgeStoryLine > hr': {
                'visibility': 'hidden'
            },
            '#pageLogo > a:hover, .jewelButton:hover, .navItem > * > a:hover, .navItem > a:hover': {
                'background-color': 'transparent',
                'opacity': '0.2',
            },
            '#globalContainer div[role="dialog"] div[role="article"],.fbPhotosSnowliftFeedbackForm div[role="article"],#globalContainer #sideNav .selectedItem,.fbNubFlyoutTitlebar,.UFIContainer .UFIList .UFIComment,#fbDockChatBuddylistNub .fbNubButton,#globalContainer .uiContextualLayerBelowRight .uiScrollableAreaBody,#globalContainer .uiContextualLayerBelowRight .uiScrollableAreaWrap':{
                'background': '#fff'
            },
            '#globalContainer a[data-testid="UFI2ViewOptionsSelector/link"]':{
                'color': '#000'
            },
            '#globalContainer .uiScrollableAreaContent div[aria-label][role="button"],#globalContainer i.img,#globalContainer a[testid="UFI2CommentLink"]::before,#globalContainer .InsertEmoji,#globalContainer span[data-hover="tooltip"]>a[role="button"]>div,#globalContainer a._2nj7::before':{
                'background-color': '#fff',
                'border': '1px solid '+this.colors.c,
                'padding': '0',
                'border-radius': '12px'
            },
            '#globalContainer svg,#globalContainer svg *':{
                'fill': this.colors.c,
                'stroke': this.colors.e
            },
            '#globalContainer .uiPopover a[role="button"],#globalContainer a[data-href="https://www.facebook.com/new"],#globalContainer div[role="presentation"] a[role="button"],#globalContainer div[data-testid="photo_upload_button"] i':{
                'background-color': '#fff',
                'padding': '0',
                'border-radius': '24px'
            }
        };
        if (this.colors.c) {
            obj['#globalContainer *'] = {'color': this.colors.c}
        }
        if (this.colors.d) {
            obj['#globalContainer a,#globalContainer input'] = {'color': this.colors.d}
        }
        obj['#globalContainer .gradientContent *,#globalContainer .uiContextualLayerPositioner *,.fbChatSidebar *,#globalContainer .sideNavItem.selectedItem *,#globalContainer .sideNavItem:hover *,#globalContainer #entity_sidebar div:hover'] = {'color':'black'}
        obj['#globalContainer .btn-primary'] = {
            'color': 'rgb(255, 255, 255)',
            'background-color': 'rgb(66, 103, 178)',
            'margin-left': '5px',
            'border-color': 'rgb(66, 103, 178)'
        }
        obj['#globalContainer .btn-primary span'] = {
            'color': 'rgb(255, 255, 255)'
        }
        obj['.UIPage_LoggedOut #pagelet_bluebar div,.UIPage_LoggedOut #pagelet_bluebar .loggedout_menubar'] = {
            'background-color': '#3578E5',
        }
        return obj
    }
}
(function () {
    var app = new App();
    app.changer = {
        fbtheme: new fbtheme()
    };
    app.run();

})();