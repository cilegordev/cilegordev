var fbtheme = {};
function savekey(key, value) {
    //console.log(key+' '+value)
    fbtheme[key] = value;
    chrome.storage.local.set({fbtheme: fbtheme}, function (options) {
    });
    return;
}
function extensiondemo() {
    var demo = {
        color_a: "rgba(0, 0, 255, 0.4)",
        color_b: "rgba(194, 197, 204, 0)",
        color_c: "#0f0",
        color_d: "#ff0",
        color_e: "rgba(0, 0, 0, 0.5)",
        on: true,
        picture: "/demo/image/demo.png",
        size: "full"
    }
    fbtheme = demo;
        savekey('picture', demo.picture);
        savekey('color_a', demo.color_a);
        savekey('color_b', demo.color_b);
        savekey('color_c', demo.color_c);
        savekey('color_d', demo.color_d);
        savekey('color_e', demo.color_e);
        savekey('size', demo.size);
        if ($("#options-switch").is('[data-on]')) {
            //...
        } else {
            $("#options-switch").click();
        }
        $('#bg').addClass('previewing').css('background-image','url("' + demo.picture + '")');
        $("#color_a").val(demo.color_a);
        $(".boxa .minicolors-input-swatch .minicolors-swatch-color").css('background',demo.color_a);
        $("#color_b").val(demo.color_b);
        $(".boxb .minicolors-input-swatch .minicolors-swatch-color").css('background',demo.color_b);
        $("#color_c").val(demo.color_c);
        $(".boxc .minicolors-input-swatch .minicolors-swatch-color").css('background',demo.color_c);
        $("#color_d").val(demo.color_d);
        $(".boxd .minicolors-input-swatch .minicolors-swatch-color").css('background',demo.color_d);
        $("#color_e").val(demo.color_e);
        $(".boxe .minicolors-input-swatch .minicolors-swatch-color").css('background',demo.color_e);
}
