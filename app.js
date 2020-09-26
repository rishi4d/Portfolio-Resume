//Loader
function execloader(){
    setTimeout(showPage, 1600);
    setTimeout(loadjq, 1600);
}

//JS Driver
function showPage(){
    
    document.getElementById("loader").style.display = "none";
    document.getElementById("main").style.display = "block";
    document.getElementById("intro").style.display = "block";

    //Canvas Animation
    (function () {
        var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            };
        window.requestAnimationFrame = requestAnimationFrame;
    })();

    // Terrain stuff.
    var background = document.getElementById("bgCanvas"),
        bgCtx = background.getContext("2d"),
        width = window.innerWidth,
        height = document.body.offsetHeight;

    (height < 400) ? height = 400 : height;

    background.width = width;
    background.height = height;

    function Terrain(options) {
        options = options || {};
        this.terrain = document.createElement("canvas");
        this.terCtx = this.terrain.getContext("2d");
        this.scrollDelay = options.scrollDelay || 90;
        this.lastScroll = new Date().getTime();

        this.terrain.width = width;
        this.terrain.height = height;
        this.fillStyle = options.fillStyle || "#191D4C";
        this.mHeight = options.mHeight || height;

        // generate
        this.points = [];

        var displacement = options.displacement || 140,
            power = Math.pow(2, Math.ceil(Math.log(width) / (Math.log(2))));

        // set the start height and end height for the terrain
        this.points[0] = this.mHeight;//(this.mHeight - (Math.random() * this.mHeight / 2)) - displacement;
        this.points[power] = this.points[0];

        // create the rest of the points
        for (var i = 1; i < power; i *= 2) {
            for (var j = (power / i) / 2; j < power; j += power / i) {
                this.points[j] = ((this.points[j - (power / i) / 2] + this.points[j + (power / i) / 2]) / 2) + Math.floor(Math.random() * -displacement + displacement);
            }
            displacement *= 0.6;
        }

        document.body.appendChild(this.terrain);
    }

    Terrain.prototype.update = function () {
        // draw the terrain
        this.terCtx.clearRect(0, 0, width, height);
        this.terCtx.fillStyle = this.fillStyle;
        
        if (new Date().getTime() > this.lastScroll + this.scrollDelay) {
            this.lastScroll = new Date().getTime();
            this.points.push(this.points.shift());
        }

        this.terCtx.beginPath();
        for (var i = 0; i <= width; i++) {
            if (i === 0) {
                this.terCtx.moveTo(0, this.points[0]);
            } else if (this.points[i] !== undefined) {
                this.terCtx.lineTo(i, this.points[i]);
            }
        }

        this.terCtx.lineTo(width, this.terrain.height);
        this.terCtx.lineTo(0, this.terrain.height);
        this.terCtx.lineTo(0, this.points[0]);
        this.terCtx.fill();
    }


    // Second canvas used for the stars
    bgCtx.fillStyle = '#05004c';
    bgCtx.fillRect(0, 0, width, height);

    // stars
    function Star(options) {
        this.size = Math.random() * 2;
        this.speed = Math.random() * .05;
        this.x = options.x;
        this.y = options.y;
    }

    Star.prototype.reset = function () {
        this.size = Math.random() * 2;
        this.speed = Math.random() * .05;
        this.x = width;
        this.y = Math.random() * height;
    }

    Star.prototype.update = function () {
        this.x -= this.speed;
        if (this.x < 0) {
            this.reset();
        } else {
            bgCtx.fillRect(this.x, this.y, this.size, this.size);
        }
    }

    function ShootingStar() {
        this.reset();
    }

    ShootingStar.prototype.reset = function () {
        this.x = Math.random() * width;
        this.y = 0;
        this.len = (Math.random() * 60) + 8;
        this.speed = (Math.random() * 5) + 5;
        this.size = (Math.random() * 1) + 0.1;
        // this is used so the shooting stars arent constant
        this.waitTime = new Date().getTime() + (Math.random() * 3000) + 500;
        this.active = false;
    }

    ShootingStar.prototype.update = function () {
        if (this.active) {
            this.x -= this.speed;
            this.y += this.speed;
            if (this.x < 0 || this.y >= height) {
                this.reset();
            } else {
                bgCtx.lineWidth = this.size;
                bgCtx.beginPath();
                bgCtx.moveTo(this.x, this.y);
                bgCtx.lineTo(this.x + this.len, this.y - this.len);
                bgCtx.stroke();
            }
        } else {
            if (this.waitTime < new Date().getTime()) {
                this.active = true;
            }
        }
    }

    var entities = [];

    // init the stars
    for (var i = 0; i < height-350; i++) {
        entities.push(new Star({
            x: Math.random() * width,
            y: Math.random() * height
        }));
    }

    // Add 2 shooting stars that just cycle.
    entities.push(new ShootingStar());
    entities.push(new ShootingStar());
    entities.push(new Terrain({mHeight : (height/2)-120}));
    entities.push(new Terrain({displacement : 120, scrollDelay : 50, fillStyle : "rgb(17,20,40)", mHeight : (height/2)-60}));
    entities.push(new Terrain({displacement : 100, scrollDelay : 20, fillStyle : "rgb(0,0,0)", mHeight : height/2}));

    //animate background
    function animate() {
        bgCtx.fillStyle = '#110E19';
        bgCtx.fillRect(0, 0, width, height);
        bgCtx.fillStyle = '#ffffff';
        bgCtx.strokeStyle = '#ffffff';

        var entLen = entities.length;

        while (entLen--) {
            entities[entLen].update();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

//Autotyper Function
(function(window, document) {
    // define the plugin in global variable to make it accessible from outside
    window.autoTyper = function(opts) {
      // default options
      var options = {
        selector: ".typerTarget",
        words: [],
        charSpeed: 85,
        delay: 2100,
        loop: true,
        flipflop: true,
        position: 0,
        currentWord: "",
        element: null,
        isStopped: false
      };
  
      // apply new options to existing one
      var applyNewOptions = function(opts) {
        // if given parameter is not valid, exit
        if (!opts) return;
  
        // change old values with new ones
        for (var opt in opts) {
          if (opts.hasOwnProperty(opt)) {
            options[opt] = opts[opt];
          }
        }
      };
      applyNewOptions(opts);
  
      // character putting synchronously
      var putChar = function*() {
        // if current character is last or its stopped
        if (options.position === options.currentWord.length || options.isStopped) {
          // check if flip flop is activated
          if (options.flipflop) {
            yield setTimeout(function() {
              // after the delay, start removing chars one by one
              remChar().next();
            }, options.delay);
          }
      
          // exit looping characters
          yield null;
        }
      
        // append the char into the element
        options.element.innerHTML += options.currentWord[options.position++];
      
        // loop the function for other remained chars
        yield setTimeout(function() {
          putChar().next();
        }, (options.position < options.currentWord.length) ? options.charSpeed : 0);
      };
  
      // character removing synchronously
      var remChar = function*() {
        // if all chars is removed or its stopped, exit function
        if (options.position === 0 || options.isStopped) yield null; 
      
        // remove the char from the element
        options.element.innerHTML = options.currentWord.substr(0, --options.position);
      
        // loop the function for other remained chars
        yield setTimeout(function() {
          remChar().next();
        }, (options.position > 0) ? options.charSpeed : 0);
      };
  
      // prepare word to type synchronously
      var processWord = function*(word, delay) {
        yield setTimeout(function() {
          // reset processing options
          options.position = 0;
          options.currentWord = word;
          // clear element text
          options.element.innerHTML = "";
      
          // start to put characters
          putChar().next();
        }, delay);
      };
  
      // autoTyper execution
      var exec = function*() {
        // if its stopped, exit function
        if (options.isStopped) yield null;
  
        var timeoutDelay = 0;
  
        for (var i = 0; i < options.words.length; i++) {
          // get current iteration
          var theWord = options.words[i];
  
          // if it is not valid, continue the loop
          if (!theWord) continue;
  
          processWord(options.words[i], timeoutDelay).next();
      
          var tmp = options.words[i].length * options.charSpeed;
          if (options.flipflop) tmp *= 2;
  
          timeoutDelay += (tmp + options.delay);
        }
      
        yield setTimeout(function() {
          options.loop ? exec().next() : "";
        }, timeoutDelay);
      };
  
      // start the autoTyper instance
      this.start = function() {
        // option validations
        if (typeof options.selector !== "string" || !options.selector) return;
        if (!Array.isArray(options.words) || !options.words.length) return;
  
        // get element
        var el = document.querySelector(options.selector);
  
        // if given element does not exist, exit
        if (!el) return;
  
        // setup options before start
        options.element = el;
        options.isStopped = false;
  
        // start autoTyper
        exec().next();
      };
  
      // stop the autoTyper instance
      this.stop = function() {
        // reset options
        options.isStopped = true;
        options.position = 0;
        options.currentWord = "";
      };
    };
  })(window, document);

var options = {
    selector: ".typerTarget", // target element selector
    words: ["Web Developer", "Android Developer", "Geek", "Student", "Astrophile"], // words/sentences that will be auto typed
    charSpeed: 85, // letter typing animation speed
    delay: 2100, // word/sentence typing animation delay
    loop: true, // if loop is activated, autoTyper will start over
    flipflop: true // if flipflop is activated, letters which are typed animated will be removed ony by one animated
};

var typer = new autoTyper(options);
typer.start();  
  

//jQuery
function loadjq(){
    $(document).ready(function(){
        $("#intro").css({top:'82%'}).animate({top:'75%', opacity:'1'}, 800, "swing", function(){
        });
    });

    $(window).scroll(function () {
        $(".aos").each(function () {
            var imagePos = $(this).offset().top;
            var windowHeight = $(window).height() * 0.9;
            var topOfWindow = $(window).scrollTop();
    
            if (imagePos < topOfWindow + windowHeight) {
                $(this).addClass("slup");
            }
        });
    });

    $(document).ready(function(){
        $('[data-toggle="tooltip"]').tooltip();
    });

}

/* CUSTOM TYPING CODE
(function typer(write = false, current = 1){

    var cursor = true;
    var temp = new Array();
    var spec = ["Geek ", "Student ", "Astrophile "];
    var span = '<span id="cursor">|</span>';

    if(write){
        var stg = spec[current];

        if(current === 2)
            current = 0;
        else
            current++;
        
        var i =0;
        var s = stg.split("");

        var interval2 = setInterval(() => {
            temp.push(s[i]);
            var temp2 = temp.join("");
            document.getElementById("text_3").innerHTML = temp2.concat(span);
            if(i+1 == s.length){
                clearInterval(interval2);
            }
            i++;
        }, 200);

        write = false;
        invoke();
    }
    else{

        var stg = document.getElementById("text_3").innerText;
        var s = stg.split("");
        var j = s.length;
        console.log(j);
        j--;

        var interval = setInterval(() => {
            s.splice(j, 1);
            temp = s.join("");
            document.getElementById("text_3").innerHTML = temp.concat(span);
            if(j == 0){
                clearInterval(interval);
            }
            j--;
        }, 200);

        write = true;
        invoke();
    }

    function invoke(){
        setTimeout(() => {
            typer(write, current);
        }, 2000);
    }

})();
*/
