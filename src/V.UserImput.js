/**   _   _____ _   _   
*    | | |_   _| |_| |
*    | |_ _| | |  _  |
*    |___|_|_| |_| |_|
*    @author l.th / http://lo-th.github.io/labs/
*/

V.UserImput = function(parent){
	this.root = parent;
	this.key = { up:0, down:0, left:0, right:0, ctrl:0, action:0, space:0, shift:0 };
    //this.gamepads = navigator.getGamepads?() || navigator.webkitGetGamepads?() || [];
    this.gamepads = [];
    //this.gamepadSupportAvailable = navigator.getGamepads || !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
}

V.UserImput.prototype = {
    constructor: V.UserImput,
    bindKeys:function(){
    	window.onkeydown = function(e) {
            e = e || window.event;
            switch ( e.keyCode ) {
                case 38: case 87: case 90: this.key.up = 1;     break; // up, W, Z
                case 40: case 83:          this.key.down = 1;   break; // down, S
                case 37: case 65: case 81: this.key.left = 1;   break; // left, A, Q
                case 39: case 68:          this.key.right = 1;  break; // right, D
                case 17: case 67:          this.key.ctrl = 1;   break; // ctrl, C
                case 69:                   this.key.action = 1; break; // E
                case 32:                   this.key.space = 1;  break; // space
                case 16:                   this.key.shift = 1;  break; // shift
            }
        }.bind(this);
        window.onkeyup = function(e) {
            e = e || window.event;
            switch( e.keyCode ) {
                case 38: case 87: case 90: this.key.up = 0;     break; // up, W, Z
                case 40: case 83:          this.key.down = 0;   break; // down, S
                case 37: case 65: case 81: this.key.left = 0;   break; // left, A, Q
                case 39: case 68:          this.key.right = 0;  break; // right, D
                case 17: case 67:          this.key.ctrl = 0;   break; // ctrl, C
                case 69:                   this.key.action = 0; break; // E
                case 32:                   this.key.space = 0;  break; // space
                case 16:                   this.key.shift = 0;  break; // shift
            }
        }.bind(this);
    },
    testGamepad:function(e){
        var isAvailable = navigator.getGamepads || !!navigator.webkitGetGamepads || !!navigator.webkitGamepads;
        window.ongamepadconnected = function(e){
            this.gamepads.push(e.gamepad);
        }.bind(this);
        window.ongamepaddisconnected = function(e){
            for (var i in this.gamepads) {
                if (this.gamepads[i].index == e.gamepad.index){ this.gamepads.splice(i, 1); break;}
            }
        }.bind(this);
    },
    updateGamepad:function(){

    }
}