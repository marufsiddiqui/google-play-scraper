var Promise = require("promise");
var request = require("request-promise");
var cheerio = require("cheerio");


function GooglePlay(id, lang) {
    var lang = lang || "en";

    return new Promise(function (resolve, reject) {
        var url = "https://play.google.com/store/apps/details?id=" + id + "&hl=" + lang;
        request(url)
            .then(cheerio.load, requestError)
            .then(parseFields)
            .then(function(app) {
                app.url = url;
                resolve(app);
            })
            .catch(reject);
    });
}

function requestError() {
    //TODO improve details
    throw Error("Error retrieving application");
}

function parseFields($) {
    var installs = $("[itemprop='numDownloads']").text().trim();
    var minInstalls = cleanInt(installs.split(" - ")[0]);
    var maxInstalls = cleanInt(installs.split(" - ")[1]) || undefined;

    //for other languages
    var score = parseFloat($(".score").text().replace(",", "."));

    return {
        title: $(".document-title").text().trim(),
        icon: $(".cover-image").attr("src"),
        minInstalls: minInstalls,
        maxInstalls: maxInstalls,
        score: score,
        reviews: cleanInt($(".reviews-num").text()),
        description: $(".id-app-orig-desc").text(),
        descriptionHTML: $(".id-app-orig-desc").html()
    };
}

function cleanInt(number) {
    var number = number || "0";
    //removes thousands separator
    number = number.replace(",", "").replace(".", "");
    return parseInt(number);
}

module.exports = GooglePlay;
