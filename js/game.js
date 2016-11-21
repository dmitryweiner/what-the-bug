var Game = (function () {
    var item_size = 30; //size of sprite in pixels
    var score;
    var start_time;

    var collision = new Audio('sounds/collision.mp3');

    var max_x = null;
    var max_y = null;
    var quant = 250;

    var bugs = [];
    var player;

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
        }
    };

    function Player(x, y) {
        MovingObject.call(this, x, y);
        this.id = 'player';
        this.lives = 5;
        this.step = $('#' + this.id).width(); // pixels in each step
        this.item_size = this.step;
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

                console.log('player', this.direction);
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

                if (this.x > (max_x - this.item_size)) {
                    this.x = max_x - this.item_size;
                    this.direction = 0;
                }

                if (this.y > (max_y - this.item_size)) {
                    this.y = max_y - this.item_size;
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
        this.ttl = 20000 - Math.random() * 6000;
        this.need_delete = false;
        this.step = 30; //should grow with mass
        this.item_size = this.step;
    }

    Bug.prototype = Object.create(MovingObject.prototype, {
        doTurn: {
            value: function(){
                MovingObject.prototype.doTurn.apply(this, arguments); // call super

                //life pass
                this.ttl -= quant;

                //steps
                if (Math.random() > 0.7) {
                    this.direction = Math.round(1 + Math.random() * 3);
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
                console.log('bug', this.id, this.direction);

                //check borders
                if (this.x < 0) {
                    this.x = 0;
                }

                if (this.y < 0) {
                    this.y = 0;
                }

                if (this.x > (max_x - this.item_size)) {
                    this.x = max_x - this.item_size;
                }

                if (this.y > (max_y - this.item_size)) {
                    this.y = (max_y - this.item_size);
                }

                this.need_delete = false;

                //handle collision with player
                //TODO: check mass
                if ((Math.abs(this.x - player.x) < this.item_size) && (Math.abs(this.y - player.y) < this.item_size)) {
                    collision.play();
                    score++;
                    this.need_delete = true;
                }

                if (this.ttl < 0) {
                    this.need_delete = true;
                }

                var angle = (this.direction - 1) * 90;
                var element = $('#' + this.id);
                if (this.need_delete) {
                    element.remove();
                    return;
                }

                var options = {
                    left: this.x,
                    top: this.y,
                    transform: 'rotate(' + angle + 'deg)'
                    /* TODO: show size according to mass*/
                };
                if (element.length == 0) {//create if not exists
                    element = $('<div id="' + this.id + '" class="bug"><p></p></div>');
                    element.css(options);
                    $('#gameField').append(element);
                } else {
                    element.css(options);
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
        var nextTime = Math.random() * 1000 + 1000;

        var bug = new Bug(
            (max_x - item_size) * Math.random(),
            (max_y - item_size) * Math.random()
        );

        bugs.push(bug);
        window.setTimeout(createBug, nextTime);
    }

    function handleBugs() {
        for (var i = 0; i < bugs.length; i++) {
            bugs[i].doTurn();
            if (bugs[i].need_delete) {
                bugs.splice(i, 1);
            }
        }
    }

    function redrawScreenMessages() {
        $('#bugs-fixed span').html(score);
        $('#bugs-total span').html(bugs.length);

        var currentTime = new Date();
        $('#time span').html(Math.floor((currentTime.getTime() - start_time.getTime()) / 1000));
    }

    function run() {
        handleKeys();
        handleBugs();
        redrawScreenMessages();
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