function execAnim(){
    $("#git").animate({opacity: 1}, 800);
    setTimeout(function(){$("#text > p").animate({opacity: 1}, 800);},400);
    setTimeout(function(){$("#connect").fadeIn(800);},800);
}