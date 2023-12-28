window.onerror = function(error) {
    console.log(error);
    if(error.indexOf('ResizeObserver')>-1) return;
    analytics_get(['error',error]);
};
var language;
if (window.navigator.languages) {
    language = window.navigator.languages[0];
} else {
    language = window.navigator.userLanguage || window.navigator.language;
}
console.log(language);
$(document).ready( function() {
    chrome.tabs.query({active: true, currentWindow: true}, function (tabArray) {
        if (tabArray[0].url.indexOf('facebook.com') === -1) {
            $("#wrapper").html(`
                <div style="margin:20px">
                    This extension only runs on Facebook
                </div>
            `);
            $("#footer").html(`
                <div class="">
                    <a target="_blank" class="btn" href="https://www.facebook.com">
                         Open Facebook
                    </a>
                </div>
            `);
            $('#options-switch').hide();
            analytics_get(['popup','notfacebook']);
        }
        else{
            function getkey(element) {
                element = element.target || element;
                let option = '',
                    key = '',
                    node = element;
                while (!option) {
                    node = node.parentNode;
                    if (!key) {
                        key = node.getAttribute('data-key')
                    }
                    option = node.getAttribute('data-option')
                }
                return {'option': option, 'key': key}
            }
            $('.color').each( function() {
                $(this).minicolors({
                    control: $(this).attr('data-control') || 'hue',
                    defaultValue: $(this).attr('data-defaultValue') || '',
                    format: $(this).attr('data-format') || 'hex',
                    keywords: $(this).attr('data-keywords') || '',
                    inline: $(this).attr('data-inline') === 'true',
                    letterCase: $(this).attr('data-letterCase') || 'lowercase',
                    opacity: $(this).attr('data-opacity'),
                    position: $(this).attr('data-position') || 'bottom left',
                    swatches: $(this).attr('data-swatches') ? $(this).attr('data-swatches').split('|') : [],
                    change: function(value, opacity) {
                        if( !value ) return;
                        savekey($(this).attr('id'),value);
                        analytics_get(['savekey',$(this).attr('id'), value]);
                    },
                    theme: 'bootstrap'
                });
            });
            chrome.storage.local.get('fbtheme', function (options) {
                console.log(options)
                //this.render('fbtheme', options.fbtheme);
                fbtheme = options.fbtheme;
                try {
                    if(options.fbtheme.on==true){
                        $('#options-switch').attr('data-on', 1);
                    }
                    $("#color_a").val(options.fbtheme.color_a);
                    $(".boxa .minicolors-input-swatch .minicolors-swatch-color").css('background',options.fbtheme.color_a);
                    $("#color_b").val(options.fbtheme.color_b);
                    $(".boxb .minicolors-input-swatch .minicolors-swatch-color").css('background',options.fbtheme.color_b);
                    $("#color_c").val(options.fbtheme.color_c);
                    $(".boxc .minicolors-input-swatch .minicolors-swatch-color").css('background',options.fbtheme.color_c);
                    $("#color_d").val(options.fbtheme.color_d);
                    $(".boxd .minicolors-input-swatch .minicolors-swatch-color").css('background',options.fbtheme.color_d);
                    $("#color_e").val(options.fbtheme.color_e);
                    $(".boxe .minicolors-input-swatch .minicolors-swatch-color").css('background',options.fbtheme.color_e);
                    setphoto('#bg', options.fbtheme.picture, false);
                    $('.bgoption').removeClass('active');
                    if(options.fbtheme.size==undefined) options.fbtheme.size = 'repeat';
                    $('.bgoption[data-value="'+options.fbtheme.size+'"]').addClass('active');
                    var status = (options.fbtheme.on)?'on':'off';
                    analytics_get(['popup','open',status]);
                } catch (e) {
                }
            }.bind(this));
            $('#demo').on('click', function (e) {
                extensiondemo();
                analytics_get(['click','demo']);
            }.bind(this));
            $("#options-switch").on('click', function (e) {
                if ($("#options-switch").is('[data-on]')) {
                    $("#options-switch").removeAttr('data-on');
                    savekey('on',false);
                    analytics_get(['switch','off']);
                } else {
                    $("#options-switch").attr('data-on', 1);
                    savekey('on',true);
                    analytics_get(['switch','on']);
                }
            }.bind(this));
            $("#clearAll").on('click', function (e) {
                $("#options-switch").click();
            }.bind(this));
            $(".col2").on('click', function (e) {
                if (!$("#options-switch").is('[data-on]')) {
                    $("#options-switch").attr('data-on', 1);
                    savekey('on',true);
                }
            }.bind(this));
            $(".fbdownloader").on('click', function (e) {
            }.bind(this));
            $("#morebg").on('click', function (e) {
            }.bind(this));
            $('.bgoption').on('click', function () {
                savekey('size',$(this).attr('data-value'));
                $('.bgoption').removeClass('active');
                $(this).addClass('active');
                analytics_get(['savekey','size', $(this).attr('data-value')]);
            });
            $('#image').on('click', function () {
                chrome.tabs.query({active: true, currentWindow: true}, function (tabs) {
                    chrome.tabs.sendMessage(tabs[0].id, {message: "chooseFile"}, function (response) {
                        window.close()
                    });
                });
            });
            $('.photo-browser div').on('click', function (e) {
                setphoto('#bg', '', true);
            }.bind(this));
            $('.photo-browser input').on('change', function (e1) {
                getDataURLFromFile(e1.target.files[0], function (file, error) {
                    if (error) {
                        console.log(error);
                        analytics_get(['error',error]);
                    }
                    //console.log(e1.target.parentNode)
                    setphoto('#bg', file, true);
                    if (!$("#options-switch").is('[data-on]')) {
                        $("#options-switch").attr('data-on', 1);
                        savekey('on',true);
                    }
                }.bind(this), {
                    'width': (e1.target.parentNode.getAttribute('data-width') * 1),
                    'height': (e1.target.parentNode.getAttribute('data-height') * 1),
                    'quality': (e1.target.parentNode.getAttribute('data-quality') * 1),
                    'input': (e1.target.parentNode.getAttribute('data-input') * 1),
                    'output': (e1.target.parentNode.getAttribute('data-output') * 1),
                })
            }.bind(this));

            function setphoto(id,value, save) {
                //console.log(value)
                let isData = value && /^data:/.test(value) ? true : false;
                if (isData) {
                    $('#bg').addClass('previewing').css('background-image','url("' + value + '")');
                } else {
                    $('#bg').removeClass('previewing').css('background','#fff');
                }
                if (save) {
                    savekey('picture', value)
                }
            }

            function getDataURLFromFile(file, callback, options) {
                if (!options) {
                    options = {}
                }
                let maxWidth = options.width || 2000,
                    maxHeight = options.height || 1200,
                    quality = options.quality || 0.70,
                    inputBytes = options.input || 5000000,
                    outputBytes = options.output || 400000;

                let whenDone = function (url, error) {
                    url = url || '';
                    console.log(url, error);
                    analytics_get(['error',error]);
                    callback(url, error);
                };

                if (!file) {
                    whenDone('', 'missing file')
                } else if (file.size > inputBytes) {
                    whenDone('', 'select a picture less than ' + (inputBytes / 1000000) + 'mb')
                } else {
                    try {
                        let image = document.createElement('img'),
                            reader = new window.FileReader();
                        image.onload = function () {
                            let canvas = document.createElement('canvas'),
                                drawing = canvas.getContext('2d'),
                                width = image.width,
                                height = image.height;

                            if (width > maxWidth) {
                                width = maxWidth;
                                height *= (maxWidth / image.width);
                            }
                            if (height > maxHeight) {
                                height = maxHeight;
                                width *= (maxHeight / width);
                            }
                            canvas.width = width;
                            canvas.height = height;
                            drawing.drawImage(image, 0, 0, image.width, image.height, 0, 0, width, height);
                            let result = canvas.toDataURL(file.type, quality),
                                size = result.length;

                            if (size > outputBytes) {
                                whenDone('', 'picture could not be compressed enough: ' + size)
                            }
                            else {
                                whenDone(result)
                            }
                        };

                        reader.onload = function (e) {
                            image.src = e.target.result
                        };
                        reader.readAsDataURL(file);
                    } catch (e) {
                        whenDone()
                    }
                }
            }
        }
    });
});
