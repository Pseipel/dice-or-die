
/**
 *      dice-or-die!
 *      https://github.com/bkis/dice-or-die
 *      (MIT-license)
 */



//// GENERAL CONSTANTS
const imgDirPath = "img/";
const imgNamePrefix = "d";
const imgNameSuffix = ".png";


//// TEMPLATE ELEMENTS
const templateDie = $("#templates > .die").first();


//// ROLL ANIMATION (thanks to https://stackoverflow.com/a/15191130)
$.fn.animateRotate = function(angle, duration, easing, complete) {
    var args = $.speed(duration, easing, complete);
    var step = args.step;
    return this.each(function(i, e) {
    args.complete = $.proxy(args.complete, e);
    args.step = function(now) {
        $.style(e, 'transform', 'rotate(' + now + 'deg)');
            if (step) return step.apply(e, arguments);
        };

        $({deg: 0}).animate({deg: angle}, args);
    });
};


//// IMAGES AND IMAGE-PRELOADING
var images = {
    files: {
        d4: "d4.png",
        d6: "d6.png",
        d8: "d8.png",
        d10: "d10.png",
        d12: "d12.png",
        d20: "d20.png",
        d100: "d100.png",
        iconSoundOn: "icon-sound-on.png",
        iconSoundOff: "icon-sound-off.png",
        iconGitHub: "icon-gh.png",
        iconRoll: "icon-roll.png",
        iconRemove: "icon-remove.png",
        iconAdd: "icon-add.png"
    },
    path: function(id){ return imgDirPath + this.files[id]; },
    allPaths: function(){ return Object.keys(this.files).map(k => this.path(k)); }
}

// define and call (!) preloading of images
var preLoadImages = function(imagesArray) {
    $('<div id="loaded-images">').css('display','none').appendTo('body');
    $(imagesArray).each(function () {
        $('<img />').attr('src', this).appendTo('#loaded-images');
    });
}(images.allPaths());


//// preps

var total = 0;
var sound = false;
var rollSound = document.createElement("audio");
rollSound.src = "sounds/roll.ogg";
rollSound.load();

// fnc to toggle sound on/off
function toggleSound(){
    sound = !sound;
    $("#sound-toggle").css(
        "background-image",
        sound
            ? "url(" + images.path("iconSoundOn") + ")"
            : "url(" + images.path("iconSoundOff") + ")"
    );
}

// fnc to play dice rolling sound
function playRollSound(){
    if (sound){
        rollSound.pause();
        rollSound.fastSeek(0);
        rollSound.play();
    }
}

// fnc to reset dice's values to their maximum
// so the types are visually obvious...
function resetDieValues(){
    $(".die").each(function(){
        $(this).find(".rotatable > .die-value").first().text($(this).attr("data-type"));
    });
}


//// ADD DIE FUNCTION
function addDie(type) {
    let die = templateDie.clone();

    // set data attribute
    die.attr("data-type", type);

    // set image
    die.find(".rotatable > .die-image").first().css(
        "background-image",
        "url(" + imgDirPath + imgNamePrefix + type + imgNameSuffix + ")"
    );

    // set initial value text
    die.find(".rotatable > .die-value").first().text(type);

    // button functionality: SELECT
    die.click(function(e) {
        e.stopPropagation();
        die.toggleClass("active");
    });

    // button functionality: ROLL
    die.find(".die-buttons > .btn-roll").first().click(function(e) {
        // prevent click event bubbling up
        event.stopPropagation();
        //play sound
        playRollSound();
        //reset total
        total = 0;
        $("#total-value").text("?").animateRotate(720, 1000, "swing");
        //reset all dice to their natural max value
        resetDieValues();
        // roll this and all active dice
        let toRoll = die.hasClass("active") ? $(".active").add(die) : die;
        toRoll.each(function(){
            let currentDie = $(this);
            currentDie.find(".rotatable > .die-value").first().text("?");
            currentDie.children(".rotatable").first().animateRotate(
                720,
                1000,
                "swing",
                function() {
                    let result = Math.floor(Math.random() * parseInt(currentDie.attr("data-type"))) + 1;
                    total += parseInt(result);
                    currentDie.find(".rotatable > .die-value").first().text(result);
                    $("#total-value").text(total);
                }
            );
        });
    });

    // button functionality: REMOVE
    die.find(".die-buttons > .btn-remove").first().click(function(e) {
        // prevent click event bubbling up
        event.stopPropagation();
        die.remove();
    });

    // hide die buttons initially
    die.children(".die-buttons").first().hide(0);
    // show die buttons on mouse enter
    die.mouseenter(function() {
        die.children(".die-buttons").first().show(100);
    });
    // hide die buttons on mouse leave
    die.mouseleave(function() {
        die.children(".die-buttons").first().hide(100);
    });

    // add die to table
    $("#table").append(die);
};


//// INITIALIZE

$(function() {

    //// INIT UI

    // init stock dice
    $("#stock > .die-stock").each(function(i) {
        // index
        $(this).attr("data-index", i);
        // title
        $(this).attr(
            "title",
            "Add d" + $(this).attr("data-type") + " to the table"
        );
        // bg image
        $(this).css(
            "background-image",
            "url(" +
                imgDirPath +
                imgNamePrefix +
                $(this).attr("data-type") +
                imgNameSuffix +
                ")"
        );
        // label
        $(this).append($(this).attr("data-type"));
        // click handler
        $(this).click(function(e) {
            e.stopPropagation();
            addDie(parseInt($(this).attr("data-type")));
        });
    });

    // EVENT: deselect all dice and hide help
    $("html").click(function(e) {
        e.stopPropagation();
        $(".die").removeClass("active");
        resetDieValues();
    });

    // EVENT: toggle sound
    $("#sound-toggle").click(function(e){
        e.stopPropagation();
        toggleSound();
    });

    // EVENT: show help
    $("#help-button").click(function(e){
        e.stopPropagation();
        $("#help").css("display", "flex");
    });

    // EVENT: hide help
    $("#help").click(function(e){
        e.stopPropagation();
        $("#help").css("display", "none");
    });

});
