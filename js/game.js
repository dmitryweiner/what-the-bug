var Game = (function () {
    var item_size = 30; //size of sprite in pixels
    var score;
    var start_time;

    var collision = new Audio('sounds/collision.mp3');

    var max_x = null;
    var max_y = null;
    var x = null;
    var y = null;

    var v = 0.0;
    var v_decr = 0.05; // decrement of the velocity with time
    var v_acc = 0.2; // increment of the velocity with pressing accelerator
    var v_max = 3.0;

    var dt = 5; // step
    var quant = 50;

    var bugs = [];
    var player;
    var max_ttl = 12000;

    //keys
    var isArrowUpPressed = false;
    var isArrowDownPressed = false;
    var isArrowLeftPressed = false;
    var isArrowRightPressed = false;

    function keyUp(code) {
        switch (code) {
            case 37: // left
                isArrowLeftPressed = false;
                break;

            case 38: // up
                isArrowUpPressed = false;
                break;

            case 39: // right
                isArrowRightPressed = false;
                break;

            case 40: // down
                isArrowDownPressed = false;
                break;
        }
    }

    function keyDown(code) {
        switch (code) {
            case 37: // left
                isArrowLeftPressed = true;
                break;

            case 38: // up
                isArrowUpPressed = true;
                break;

            case 39: // right
                isArrowRightPressed = true;
                break;

            case 40: // down
                isArrowDownPressed = true;
                break;
        }
    }

    function mouseDown(element) {
        if ($(element).hasClass('left')) {
            isArrowLeftPressed = true;
        }

        if ($(element).hasClass('right')) {
            isArrowRightPressed = true;
        }

        if ($(element).hasClass('up')) {
            isArrowUpPressed = true;
        }

        if ($(element).hasClass('down')) {
            isArrowDownPressed = true;
        }

    }

    function mouseUp(element) {
        if ($(element).hasClass('left')) {
            isArrowLeftPressed = false;
        }

        if ($(element).hasClass('right')) {
            isArrowRightPressed = false;
        }

        if ($(element).hasClass('up')) {
            isArrowUpPressed = false;
        }

        if ($(element).hasClass('down')) {
            isArrowDownPressed = false;
        }

    }

    function handleKeys() {

        if (isArrowDownPressed) {
            v = v - v_brake;
            if (v < 0) {
                v = 0;
            }
        } else if (isArrowUpPressed) {
            v = v + v_acc;
            if (v > v_max) {
                v = v_max;
            }
        }

        if (isArrowLeftPressed) {
            angle = angle - delta_angle;
            if (angle < 0) {
                angle = 360 + angle;
            }
        } else if (isArrowRightPressed) {
            angle = angle + delta_angle;
            if (angle > 359) {
                angle = angle - 360;
            }
        }

    }

    function init(maxX, maxY) {
        max_x = maxX;
        max_y = maxY;
        score = 0;
        start_time = new Date();
        createBug();
        player = new Player(max_x / 2, max_y / 2);
    }

    function toRadians(angle) {
        return angle * (Math.PI / 180);
    }


    function byteToHex(b) {
        var hexChar = ["0", "1", "2", "3", "4", "5", "6", "7","8", "9", "A", "B", "C", "D", "E", "F"];
        return hexChar[(b >> 4) & 0x0f] + hexChar[b & 0x0f];
    }

  /**
   * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
   */

    function MovingObject(x, y) {
        this.id = makeid();
        this.x = x;
        this.y = y;
        this.direction = 1;
        this.mass = 1;
    }

    MovingObject.prototype = {
        doTurn: function() {
            console.log('turn');
        }
    };

    function Player(x, y) {
        MovingObject.call(this, x, y);
        this.lives = 5;
    }

    Player.prototype = Object.create(MovingObject.prototype);
    Player.prototype.constructor = Player;

    function Bug(x, y) {
        MovingObject.call(this, x, y);
        this.ttl = 12000 - Math.random() * 6000;
    }
    Bug.prototype = Object.create(MovingObject.prototype);
    Bug.prototype.constructor = Bug;

    function makeid()
    {
        var text = "";
        var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

        for( var i=0; i < 5; i++ )
            text += possible.charAt(Math.floor(Math.random() * possible.length));

        return text;
    }

    function createBug() {
        var nextTime = Math.random() * 2000 + 3000;

        var bug = new Bug(
            (max_x - item_size) * Math.random(),
            (max_y - item_size) * Math.random()
        );

        bugs.push(bug);
        window.setTimeout(createBug, nextTime);
    }


    function redrawBugs() {
        for (var i = 0; i < bugs.length; i++) {
            var bug = bugs[i];
            var bugElement = $('#' + bug.id);
            if (bugElement.length == 0) {//create if not exists
                bugElement = $('<div id="' + bug.id + '" class="bug"><p></p></div>');
                bugElement.css({
                    left: bug.x,
                    top: bug.y
                    /* TODO: show size according to mass*/
                });
                $('#gameField').append(bugElement);
            } else {
                // TODO: change coords
                bugElement.css({opacity: bug.ttl / max_ttl});
            }
        }
    }

    function handleBugs() {
/*
        var newBugs = [];
        for (var i = 0; i < bugs.length; i++) {
            bugs[i].ttl -= quant;

            //handle collision
            if ((Math.abs(bugs[i].x - x) < item_size) && (Math.abs(bugs[i].y - y) < item_size)) {
                collision.play();
                score++;
                $('#' + bugs[i].id).remove();
                continue;
            }

            if (bugs[i].ttl > 0) {
                newBugs.push(bugs[i]);
            } else {
                $('#' + bugs[i].id).remove();
            }

        }
        bugs = newBugs;
*/
        redrawBugs();
    }

    function redrawScreenMessages() {
        $('#score span').html(score);

        var currentTime = new Date();
        $('#time span').html(Math.floor((currentTime.getTime() - start_time.getTime()) / 1000));
    }

    function run() {
        handleKeys();
        handleBugs();
        redrawScreenMessages();

        var x_old = x;
        var y_old = y;

        var vx = parseFloat(v * Math.sin(toRadians(180 - angle)));
        var vy = parseFloat(v * Math.cos(toRadians(180 - angle)));
        x = x + vx * dt;
        y = y + vy * dt;

        v = v - v_decr;
        if (v < 0) {
            v = 0;
        }

        //collision with border
        if (x > (max_x - 5) || x < 0) {
            x = x_old;
            v = 0;
        }
        if (y > (max_y - 5) || y < 0) {
            y = y_old;
            v = 0;
        }

        $('#car').css({ left: x, top: y, transform: 'rotate(' + angle + 'deg)' });
    }

    return {
        init: init,
        quant: quant,
        run: run,
        keyUp: keyUp,
        keyDown: keyDown,
        createBug: createBug,
        mouseDown: mouseDown,
        mouseUp: mouseUp
    }
})();