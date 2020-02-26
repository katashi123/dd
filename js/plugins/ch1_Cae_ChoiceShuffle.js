//=========================================================
// Cae_ChoiceShuffle.js
//=========================================================

/*:
 * @plugindesc v1.1 - Randomly reorder choices of Show Choices commands.
 * @author Caethyril
 *
 * @help Plugin Commands:
 *     ChoiceShuffle On
 *       - Show Choices after this will be ordered randomly.
 *     ChoiceShuffle Off
 *       - Show Choices after this will be ordered as seen in the editor.
 *     ChoiceShuffle Toggle
 *       - Toggles shuffle on <-> off.
 *     ChoiceShuffle Reset
 *       - Resets shuffle to default value (set by plugin parameter).
 *   Plugin commands are case-insensitive and customisable via plugin parameters.
 *
 *   This plugin uses the Durstenfeld shuffle algorithm.
 *
 * Compatibility:
 *   Load this plugin after any other plugins you're using that affect choices.
 *   Aliases:
 *      Game_Interpreter: setupChoices
 *      DataManager: createGameObjects, makeSaveContents, extractSaveContents
 *   Optionally adds an extra boolean to save files (customisable property name).
 *
 * Terms of use:
 *   Free to use and modify.
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Update log:
 *   1.1: Fixed shuffle routine: self-swaps now possible, excess loop removed.
 *        Added explicit check for non-choice selection callback (compatibility).
 *   1.0: Initial release.
 *
 * @param Shuffle
 * @text Shuffle
 * @type boolean
 * @desc If true, choices will get shuffled by default.
 * Default: false
 * @default false
 *
 * @param Add Save Data
 * @text Add Save Data
 * @type boolean
 * @desc If false, choice shuffle will revert to default when continuing from a save.
 * @default false
 *
 * @param Save Property
 * @text Save Property
 * @parent Add Save Data
 * @type text
 * @desc Name of the property under which the shuffle value will be saved, if Add Save Data is enabled.
 * @default ChoiceShuffle
 *
 * @param Plugin Command
 * @text Plugin Command
 * @type text
 * @desc Name of the plugin command.
 * Default: ChoiceShuffle
 * @default ChoiceShuffle
 */

var Imported = Imported || {};			// Import namespace, var can redefine
Imported.Cae_ChoiceShuffle = 1.1;		// Import declaration

var CAE = CAE || {};				// Author namespace, var can redefine
CAE.ChoiceShuffle = CAE.ChoiceShuffle || {};	// Plugin namespace

(function(_) {

'use strict';

	const PLUGIN_NAME  = 'Cae_ChoiceShuffle';
	const ERR_PRE      = PLUGIN_NAME + '.js ';
	const ERR_NOPARAMS = ERR_PRE + 'could not find its parameters!\nCheck you have named the plugin correctly and try again.';
	const ERR_NONSAVE  = ERR_PRE + 'could not save data to file under property name \'%1\'.';
	const ERR_BADSAVE  = ERR_PRE + 'encountered conflict when attempting to save property \'%1\' to file: property already exists!';
	const WARN_WATCOM  = ERR_PRE + 'encountered unrecognised arg0 \'%1\' in plugin command.';

// ========== Parameter stuff ========== //

	_.params = PluginManager.parameters(PLUGIN_NAME);
	if (_.params === undefined) throw new Error(ERR_NOPARAMS);

	// Get default flag value from plugin parameters
	_.defaultShuffle = function() { return _.params['Shuffle'] === 'true'; };

	// Initialise plugin variables
	_.pluginCommand = _.params['Plugin Command'].split(' ')[0].toUpperCase();
	_.save          = _.params['Add Save Data'] === 'true';
	_.saveProp      = _.params['Save Flag'] || 'choiceShuffle';
	_.shuffle       = _.defaultShuffle();

// ============== Utility ============== //

	// Changes shuffle flag according to input string
	_.changeShuffle = function(arg0) {
		switch (String(arg0).toUpperCase()) {
			case 'ON': case 'TRUE':
				_.shuffle = true;
				return true;
			case 'OFF': case 'FALSE':
				_.shuffle = false;
				return true;
			case 'TOGGLE': case 'INVERT':
				_.shuffle = !_.shuffle;
				return true;
			case 'RESET': case 'DEFAULT':
				_.shuffle = _.defaultShuffle();
				return true;
			default:
				console.warn(WARN_WATCOM.format(arg0));
				return false;
		}
	};

	// Randomly sorts array of indices 0 ~ len-1 (Durstenfeld)
	_.doShuffleIx = function(len) {
		let out = [];					// Initialise
		for (let n = len; n--;) { out.push(n); };	// Populate (len-1 to 0)
		for (let n = len; --n;) {			// Iterate  (len-1 to 1)
			let ix = Math.randomInt(n + 1);		// Select   (0 to n)
			let tmp = out[n];			// Store
			out[n] = out[ix];			// Swap ->
			out[ix] = tmp;				// Swap <-
		}
		return out;
	};

	// Randomly shuffles input array, returns shuffled array & indices
	_.doShuffle = function(arr) {
		let ix = _.doShuffleIx(arr.length);
		let out = ix.map(function(i) { return arr[i]; });
		return [out, ix];
	};

	// Context Game_Interpreter; returns choice callback that maps shuffled index to original index
	_.genCallback = function(ix) {
		return function(n) { this._branch[this._indent] = ix[n] === undefined ? n : ix[n]; }.bind(this);
	};

	// Checks for valid save property name and conflict with any existing value from another source
	_.checkSaveProp = function(contents) {
		if (!_.saveProp) {
			console.error(ERR_NONSAVE.format(_.saveProp));
			return false;
		} else if (contents[_.saveProp] !== undefined) {
			console.error(ERR_BADSAVE.format(_.saveProp));
			return false;
		}
		return true;
	};

// ============ Alterations ============ //

	// Re-order choices if appropriate before callback
	_.Game_Interpreter_setupChoices = Game_Interpreter.prototype.setupChoices;
	Game_Interpreter.prototype.setupChoices = function(params) {
		let mem = _.shuffle ? _.doShuffle(params[0]) : undefined;			// Get array/indices
		let newParams = mem ? [mem[0]].concat(params.slice(1)) : params;		// Do not mutate existing params
		_.Game_Interpreter_setupChoices.call(this, newParams);				// Callback
		if (mem) $gameMessage.setChoiceCallback(_.genCallback.call(this, mem[1]));	// Adjust callback indices to match
	};

	// Flag setup for new game
	_.DataManager_createGameObjects = DataManager.createGameObjects;
	DataManager.createGameObjects = function() {
		_.DataManager_createGameObjects.call(this);
		_.shuffle = _.defaultShuffle();
	}

	// Add to save data if flag set
	_.DataManager_makeSaveContents = DataManager.makeSaveContents;
	DataManager.makeSaveContents = function() {
		let contents = _.DataManager_makeSaveContents.call(this);
		if (_.save && _.checkSaveProp(contents)) contents[_.saveProp] = _.shuffle;
		return contents;
	};

	// Extract from save data if flag set, else set default
	_.DataManager_extractSaveContents = DataManager.extractSaveContents;
	DataManager.extractSaveContents = function(contents) {
		_.DataManager_extractSaveContents.call(this, contents);
		let prop = contents[_.saveProp];
		_.shuffle = (_.save && prop !== undefined) ? prop : _.defaultShuffle();
	};

	// Plugin command~
	_.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
	Game_Interpreter.prototype.pluginCommand = function(command, args) {
		_.Game_Interpreter_pluginCommand.call(this, command, args);
		if (command.toUpperCase() === _.pluginCommand) _.changeShuffle(args[0]);
	};

})(CAE.ChoiceShuffle);