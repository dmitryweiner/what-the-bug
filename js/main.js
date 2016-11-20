
$(document).ready(function () {

    Game.init(
        $('#gameField').width(),
        $('#gameField').height()
    );

    window.setInterval(Game.run, Game.quant);

    $(document).keydown(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode > 40 || keyCode < 37) {
            return;
        }
        Game.keyDown(keyCode);
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

    $(document).keyup(function (e) {
        var keyCode = e.keyCode || e.which;
        if (keyCode > 40 || keyCode < 37) {
            return;
        }
        Game.keyUp(keyCode);
        e.preventDefault(); // prevent the default action (scroll / move caret)
    });

});
