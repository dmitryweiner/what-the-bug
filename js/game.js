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

    var quant = 500;

    var bugs = [];
    var player;
    var max_ttl = 12000;

    //keys
    var isArrowUpPressed = false;
    var isArrowDownPressed = false;
    var isArrowLeftPressed = false;
    var isArrowRightPressed = false;

    /* ============= MODELS =============== */
    /**
     * @see https://developer.mozilla.org/en/docs/Web/JavaScript/Inheritance_and_the_prototype_chain
     */

    function MovingObject(x, y) {
        this.id = makeid();
        this.x = x;
        this.y = y;
        this.direction = 0;
        this.mass = 1;
    }

    MovingObject.prototype = {
        doTurn: function() {
            console.log('turn');
        }
    };

    function Player(x, y) {
        MovingObject.call(this, x, y);
        this.id = 'player';
        this.lives = 5;
        this.step = $('#' + this.id).width(); // pixels in each step
    }

    Player.prototype = Object.create(MovingObject.prototype, {
        doTurn: {
            value: function(direction){
                MovingObject.prototype.doTurn.apply(this, arguments); // call super

                if (this.direction) {
                    this.direction = direction;
                    switch(this.direction) {
                        case 1:
                            if (direction == 3) {
                                this.direction = 0;
                            }
                            break;
                        case 2:
                            if (direction == 4) {
                                this.direction = 0;
                            }
                            break;
                        case 3:
                            if (direction == 1) {
                                this.direction = 0;
                            }
                            break;
                        case 4:
                            if (direction == 2) {
                                this.direction = 0;
                            }
                            break;
                    }
                } else {
                    this.direction = direction;
                }

                switch(this.direction) {
                    case 1:
                        this.y -= this.step;
                        break;
                    case 2:
                        this.x += this.step;
                        break;
                    case 3:
                        this.y += this.step;
                        break;
                    case 4:
                        this.x -= this.step;
                        break;
                }

                //check borders
                if (this.x < 0) {
                    this.x = 0;
                    this.direction = 0;
                }

                if (this.y < 0) {
                    this.y = 0;
                    this.direction = 0;
                }

                if (this.x > max_x) {
                    this.x = max_x;
                    this.direction = 0;
                }

                if (this.y > max_y) {
                    this.y = max_y;
                    this.direction = 0;
                }

                var element = $('#player');
                element.css({
                    left: this.x,
                    top: this.y
                });
            },
            enumerable: true,
            configurable: true,
            writable: true
        }
    });
    Player.prototype.constructor = Player;

    function Bug(x, y) {
        MovingObject.call(this, x, y);
        this.ttl = 12000 - Math.random() * 6000;
    }

    Bug.prototype = Object.create(MovingObject.prototype, {
        doTurn: {
            value: function(){
                MovingObject.prototype.doTurn.apply(this, arguments); // call super

                this.need_delete = false;

                //handle collision
                if ((Math.abs(bugs[i].x - x) < item_size) && (Math.abs(bugs[i].y - y) < item_size)) {
                    collision.play();
                    score++;
                    this.need_delete = true;
                }

                if (bugs[i].ttl > 0) {
                    newBugs.push(bugs[i]);
                } else {
                    $('#' + bugs[i].id).remove();
                }

                var bugElement = $('#' + this.id);
                if (bugElement.length == 0) {//create if not exists
                    bugElement = $('<div id="' + this.id + '" class="bug"><p></p></div>');
                    bugElement.css({
                        left: bug.x,
                        top: bug.y
                        /* TODO: show size according to mass*/
                    });
                    $('#gameField').append(bugElement);
                } else {
                    bugElement.css({opacity: this.ttl / max_ttl});
                }
            },
            enumerable: true,
            configurable: true,
            writable: true
        }
    });
    Bug.prototype.constructor = Bug;

    /* ============= /MODELS =============== */

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

        var direction;
        if (isArrowDownPressed) {
            direction = 3;
        } else if (isArrowUpPressed) {
            direction = 1;
        } else if (isArrowLeftPressed) {
            direction = 4;
        } else if (isArrowRightPressed) {
            direction = 2;
        }
        player.doTurn(direction);

    }

    function init(maxX, maxY) {
        max_x = maxX;
        max_y = maxY;
        score = 0;
        start_time = new Date();
        createBug();
        player = new Player(max_x / 2, max_y / 2);
    }

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