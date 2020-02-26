//=============================================================================
// KeepTitleMusic.js
//=============================================================================

/*:
 * @plugindesc Keep the title screen music going after it closes.
 * @author pareidolon
 * @help If you have automatic BGM for your game's first screen, it will begin
 * without fadeout. This plugin will also stop the fadeout for continuing files
 * unless you change the parameter to true.
 * 
 * This plugin may cause conflicts with other plugins that alter the title scene.
 * 
 * All new content is free to use under CC BY-SA 4.0
 * Please credit the contributor pareidolon at rpgmaker.net
 * 
 * @param ContinueFade
 * @desc Always fade the music on continue?
 * @default false
 */

(function() {

var parameters = PluginManager.parameters('KeepTitleMusic');
if (parameters['ContinueFade'] == "false" || "FALSE" || "off" || "OFF" || "no" || "NO" || "N"){
    var KeepTitleMusic_ContinueFade = false
    } else{
    var KeepTitleMusic_ContinueFade = true
};


//Note: Can I read the music to be played, and determine if a fadeout is necessary (if to be played BGM = title BGM OR nothing)?
//      Can I modify scene_map to audio fade out if necessary before playing?

//Do not fade out music and sounds on new game
Scene_Title.prototype.commandNewGame = function() {
    DataManager.setupNewGame();
    this._commandWindow.close();
    //this.fadeOutAll();
    var time = this.slowFadeSpeed() / 60;
    this.startFadeOut(this.slowFadeSpeed());
    //end replacement content
    SceneManager.goto(Scene_Map);
};


//Do not fade out music and sounds on continue / load
//unless ContinueFade parameter is true
var _Scene_Load_OnLoadSuccess = Scene_Load.prototype.onLoadSuccess;
Scene_Load.prototype.onLoadSuccess = function() {
    if (KeepTitleMusic_ContinueFade){
        _Scene_Load_OnLoadSuccess.call(this);
    } else {
    SoundManager.playLoad();
    //this.fadeOutAll();
    var time = this.slowFadeSpeed() / 60;
    this.startFadeOut(this.slowFadeSpeed());
    //end replacement content
    this.reloadMapIfUpdated();
    SceneManager.goto(Scene_Map);
    this._loadSuccess = true;
    };
};


//If the map music exists and is other than current, fade out before transition
var _Game_System_OnAfterLoad = Game_System.prototype.onAfterLoad;
Game_System.prototype.onAfterLoad = function() {
    if ($dataSystem.titleBgm.name !== this._bgmOnSave.name && this._bgmOnSave !== null && this._bgmOnSave.name !== ''){
        var time = 48 / 60;
        AudioManager.fadeOutBgm(time);
        AudioManager.fadeOutBgs(time);
        AudioManager.fadeOutMe(time);
    };
    _Game_System_OnAfterLoad.call(this);
};


})();
