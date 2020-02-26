//=============================================================================
// WhitePaper_PressXManyTimes.js
//=============================================================================

/*:
 * @plugindesc Mini-game
 * @author WhitePaper
 *
 * @help PressXCall - calls mini-game
 */
(function() {
	Window_Base.prototype.drawGauge = function(x, y, width, rate, color1, color2) {
		var fillW = Math.floor(width * rate);
		var gaugeY = y + this.lineHeight() * 2 - 8;
		var height = 100;
		this.contents.fillRect(x, gaugeY, width, height, this.gaugeBackColor());
		this.contents.gradientFillRect(x, gaugeY, fillW, height, color1, color2);
	};
	var PressX_command = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		PressX_command.apply(this);
		SceneManager.push(Scene_PressX);
	};

	function Window_PressX() {
        this.initialize.apply(this, arguments);
		h = 0;
		okPress = 0;
		POWER = $gameVariables.value(3) * 0.01;
    };
	Window_PressX.prototype = Object.create(Window_Base.prototype);
    Window_PressX.prototype.constructor = Window_PressX;
    Window_PressX.prototype.update = function() {
		if (h >=0.01) {
			h -= 0.01;
		};
        this.contents.clear();

		this.drawGauge(0, 0, 500, h, this.hpGaugeColor1(), this.hpGaugeColor2());
		if (Input.isRepeated('ok')) {
            this.onButtonOk();
        };
		if (h >= 1){
			$gameVariables.setValue(2, 1);
			SceneManager.pop();
			//return 1;
		};
		if (okPress !== 0 && h <= 0.01){
			$gameVariables.setValue(2, -1);
			SceneManager.pop();
		};
	};
	Window_PressX.prototype.onButtonOk = function() {
		this.contents.clear();
		h +=POWER;
		okPress = 1;
		if (h >= 1) {
			h = 1;
		}
		this.drawGauge(0, 0, 500, h, this.hpGaugeColor1(), this.hpGaugeColor2());
		
	};
	function Scene_PressX() {
		this.initialize.apply(this, arguments);
	};
	Scene_PressX.prototype = Object.create(Scene_MenuBase.prototype);
	Scene_PressX.prototype.constructor = Scene_PressX;

	Scene_PressX.prototype.initialize = function() {
		Scene_MenuBase.prototype.initialize.call(this);
	};

	Scene_PressX.prototype.create = function() {
		Scene_MenuBase.prototype.create.call(this);
		this.createWindow();
	};
	Scene_PressX.prototype.createWindow = function() {
		this._pressX = new Window_PressX(Graphics.boxWidth / 2 - 250,Graphics.boxHeight / 2 - 60, 500, 120);
        this.addWindow(this._pressX);
	};
	
	Scene_Menu.prototype.start = function() {
		Scene_MenuBase.prototype.start.call(this);
	};
})();

