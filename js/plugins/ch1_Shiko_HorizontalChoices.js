/*:
* @plugindesc Changes the choices commands so they are presented in horizontal order.
* @author Shiko
*
*
* @help
* Simple plugin. Just turn it ON for it to work.
*/

Window_ChoiceList.prototype.updatePlacement = function() {
    var positionType = $gameMessage.choicePositionType();
    var messageY = this._messageWindow.y;
    this.width = this.windowWidth();
    this.height = this.windowHeight();
    switch (positionType) {
    case 0:
        this.x = 0;
        break;
    case 1:
        this.x = (Graphics.boxWidth - this.width) / 2;
        break;
    case 2:
        this.x = Graphics.boxWidth - this.width;
        break;
    }
    if (messageY >= Graphics.boxHeight / 2) {
        this.y = messageY - this.height;
    } else {
        this.y = messageY + this._messageWindow.height;
    }
};

Window_ChoiceList.prototype.windowWidth = function() {
    var choices = $gameMessage.choices();
    var numLines = choices.length;
    var width = (this.maxChoiceWidth() + this.padding * 2)*choices.length;
    return Math.min(width, Graphics.boxWidth*2);
};



Window_ChoiceList.prototype.numVisibleRows = function() {
    return 1;
};

Window_ChoiceList.prototype.maxCols = function() {
    var choices = $gameMessage.choices();
    numCols = choices.length;
    switch (numCols) {
    case 1:
        return 1;
    case 2:
        return 2;
    case 3:
        return 3;
    case 4:
        return 4;
    case 5:
        return 5;
    case 6:
        return 6;
    }
};


Window_ChoiceList.prototype.drawItem = function(index) {
    var rect = this.itemRectForText(index);
    var text = this.commandName(index);
    this.drawTextEx(text, rect.x, rect.y);
};