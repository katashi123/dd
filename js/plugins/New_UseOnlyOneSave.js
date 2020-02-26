//=============================================================================
// UseOnlyOneSave.js
// ----------------------------------------------------------------------------
// Copyright (c) 2015-2017 Triacontane
// This software is released under the MIT License.
// http://opensource.org/licenses/mit-license.php
// ----------------------------------------------------------------------------
// Version
// 1.1.4 2018/01/06 Fixed a bug where a game stopped and changed save screen with modification of 1.1.3
// 1.1.3 2018/01/05 Fixed an issue where an error may occur when loading from a map screen with a script
// 1.1.2 2017/12/02 Resolve conflict with MenuCommonEvent.js
// 1.1.1 2017/11/19 Fixed save issue when saved again after loading from an event
// 1.1.0 2017/11/18 Added function to notify when saved in menu screen
// 1.0.2 2017/11/12 Fixed saving error when using online storage
// 1.0.1 2017/11/11 Fixed BGM issue where it won't play when loading successfully
// 1.0.0 2017/11/10 Initial release
// ----------------------------------------------------------------------------
// [Blog]   : https://triacontane.blogspot.jp/
// [Twitter]: https://twitter.com/triacontane/
// [GitHub] : https://github.com/triacontane/
//=============================================================================

/*:
 * @plugindesc UseOnlyOneSavePlugin
 * @author triacontane
 *
 * @param SaveMessage
 * @desc Message displayed when saving on the menu screen.
 * @default Game data saved
 *
 * @help UseOnlyOneSave.js
 *
 * Doesn't go through each screen when loading or saving, only uses 1 file.
 *
 * This plugin is released under the MIT License.
 */
/*:ja
 * @plugindesc 単一セーブデータプラグイン
 * @author トリアコンタン
 *
 * @param セーブメッセージ
 * @desc メニュー画面でのセーブ実行時に表示するメッセージです。指定しない場合は表示されません。
 * @default プレイデータをセーブしました。
 *
 * @help UseOnlyOneSave.js
 *
 * ロードもしくはセーブ時に各画面を経由せず、ファイル1のみを
 * 常に使用するように変更します。
 *
 * このプラグインにはプラグインコマンドはありません。
 *
 * 利用規約：
 *  作者に無断で改変、再配布が可能で、利用形態（商用、18禁利用等）
 *  についても制限はありません。
 *  このプラグインはもうあなたのものです。
 */

(function() {
    'use strict';
    var pluginName    = 'UseOnlyOneSave';

    var getParamString = function(paramNames) {
        if (!Array.isArray(paramNames)) paramNames = [paramNames];
        for (var i = 0; i < paramNames.length; i++) {
            var name = PluginManager.parameters(pluginName)[paramNames[i]];
            if (name !== undefined) return name;
        }
        alert('Fail to load plugin parameter of ' + pluginName);
        return null;
    };

    //=============================================================================
    // Parameter and formatting
    //=============================================================================
    var param       = {};
    param.saveMessage = getParamString(['SaveMessage', 'セーブメッセージ']);

    //=============================================================================
    // SceneManager
    //  Cancel transition to save or load screen.
    //=============================================================================
    var _SceneManager_goto = SceneManager.goto;
    SceneManager.goto = function(sceneClass) {
        var result = this.cutSaveScene(sceneClass);
        if (!result) {
            _SceneManager_goto.apply(this, arguments);
        }
    };

    var _SceneManager_push = SceneManager.push;
    SceneManager.push = function(sceneClass) {
        var result = this.cutSaveScene(sceneClass);
        if (!result) {
            _SceneManager_push.apply(this, arguments);
        }
    };

    SceneManager.cutSaveScene = function(sceneClass) {
        if (sceneClass === Scene_Save || sceneClass === Scene_Load) {
            var sceneFile = new sceneClass();
            sceneFile.onSavefileOk();
            if (sceneClass === Scene_Load && this._scene instanceof Scene_Map) {
                $dataMap.loadFromMap = true;
                $gameSystem.onAfterLoad();
            }
            return true;
        }
        return false;
    };

    //=============================================================================
    // StorageManager
    //  Ignores backup deletion failure errors. (for online storage)
    //=============================================================================
    var _StorageManager_cleanBackup = StorageManager.cleanBackup;
    StorageManager.cleanBackup = function(savefileId) {
        try {
            _StorageManager_cleanBackup.apply(this, arguments);
        } catch (e) {
            if (e.code === 'EBUSY') {
                console.error(e);
            } else {
                throw e;
            }
        }
    };

    //=============================================================================
    // Scene_Menu
    //  Save function implementation
    //=============================================================================
    Scene_Menu.prototype.isExistHelpNotice = function() {
        return !!param.saveMessage;
    };

    var _Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function() {
        _Scene_Menu_create.apply(this, arguments);
        if (this.isExistHelpNotice()) {
            this.createSaveNoticeWindow();
        }
    };

    Scene_Menu.prototype.createSaveNoticeWindow = function() {
        this.createHelpWindow();
        this._helpWindow.y = SceneManager._boxHeight - this._helpWindow.height;
        this._helpWindow.openness = 0;
        this._helpWindow.setText(param.saveMessage);
    };

    var _Scene_Menu_commandSave = Scene_Menu.prototype.commandSave;
    Scene_Menu.prototype.commandSave = function() {
        _Scene_Menu_commandSave.apply(this, arguments);
        if (this.isExistHelpNotice()) {
            this.setupHelpNotice();
        }
        this._commandWindow.activate();
    };

    Scene_Menu.prototype.setupHelpNotice = function() {
        this._savePopDuration = 120;
        this._helpWindow.open();
    };

    // Resolve conflict for plugin to override Scene_MenuBase or Scene_Base
    var _Scene_Menu_update = Scene_Menu.prototype.hasOwnProperty('update') ? Scene_Menu.prototype.update : null;
    Scene_Menu.prototype.update = function() {
        if (_Scene_Menu_update) {
            _Scene_Menu_update.apply(this, arguments);
        } else {
            Scene_MenuBase.prototype.update.apply(this, arguments);
        }
        if (this._savePopDuration > 0) {
            this.updateHelpNotice();
        }
    };

    Scene_Menu.prototype.updateHelpNotice = function() {
        this._savePopDuration--;
        if (this._savePopDuration === 0) {
            this._helpWindow.close();
        }
    };

    //=============================================================================
    // Scene_File
    //  Limit save file ID to 1.
    //=============================================================================
    Scene_File.prototype.savefileId = function() {
        return 1;
    };

    Scene_File.prototype.popScene = function() {
        // do nothing
    };

    //=============================================================================
    // Scene_Title
    //  Play BGM on successful loading
    //=============================================================================
    var _Scene_Title_commandContinue = Scene_Title.prototype.commandContinue;
    Scene_Title.prototype.commandContinue = function() {
        this.fadeOutAll();
        _Scene_Title_commandContinue.apply(this, arguments);
        this._loadSuccess = true;
    };

    var _Scene_Title_terminate = Scene_Title.prototype.terminate;
    Scene_Title.prototype.terminate = function() {
        _Scene_Title_terminate.apply(this, arguments);
        if (this._loadSuccess) {
            $gameSystem.onAfterLoad();
        }
    };

    //=============================================================================
    // Scene_Map
    //  When loading from the map screen, processing stops until map data is loaded
    //=============================================================================
    var _Scene_Map_updateMain = Scene_Map.prototype.updateMain;
    Scene_Map.prototype.updateMain = function() {
        if ($dataMap.loadFromMap) {
            return;
        }
        _Scene_Map_updateMain.apply(this, arguments);
    };

    //=============================================================================
    // Game_Interpreter
    //  Advance index from save from event.
    //=============================================================================
    var _Game_Interpreter_command352 = Game_Interpreter.prototype.command352;
    Game_Interpreter.prototype.command352 = function() {
        // Resolves of being saved again when loading.
        if (!$gameParty.inBattle()) {
            this._index++;
        }
        _Game_Interpreter_command352.apply(this, arguments);
    };
})();