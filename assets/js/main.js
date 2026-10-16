"use strict";
(function () {
    var update_image = function () {
        var images = document.querySelectorAll('.refresh-images img');
        Array.prototype.slice.call(images).forEach(function (img) {
            if (img && img.src) {
                img.src = img.src.split('?')[0] + '?_ts=' + (new Date().getTime() / 1000).toFixed(0);
            }
        });
    };
    setInterval(update_image, 20 * 1000);
    update_image();
})();


// document.addEventListener("DOMContentLoaded",function(){(function(){
//     var update_image = function () {
//         var images = document.querySelectorAll('.refresh-images img');
//         Array.prototype.slice.call(images).forEach(function (img) {
//             if (img && img.src) {
//                 img.src = img.src.split('?')[0] + '?_ts=' + (new Date().getTime() / 1000).toFixed(0);
//             }
//         });
//     };
//     setInterval(update_image, 20 * 1000);
//     update_image();})();});
