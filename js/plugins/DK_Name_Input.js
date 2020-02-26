/*
Title: Name Input
Author: DK (Denis Kuznetsov)
Site: https://dk-plugins.ru
E-mail: kuznetsovdenis96@gmail.com
Version: 1.1
Release: 10.11.2016
First release: 18.06.2016
Supported languages: Russian, English
*/

/*ru
Название: Ввод Имени
Автор: DK (Денис Кузнецов)
Сайт: https://dk-plugins.ru
E-mail: kuznetsovdenis96@gmail.com
Версия: 1.1
Релиз: 10.11.2016
Первый релиз: 18.06.2016
Поддерживаемые языки: Русский, Английский
*/

/*:
 * @plugindesc v.1.1 Allows input the name from the keyboard
 * @author DK (Denis Kuznetsov)
 * @help

 ### Info about plugin ###
 Title: DK_Name_Input
 Author: DK (Denis Kuznetsov)
 Site: https://dk-plugins.ru
 Version: 1.1
 Release: 10.11.2016
 First release: 18.06.2016
 Supported languages: Russian, English

 ### License and terms of use ###

 Recent information about the terms of use: https://dk-plugins.ru/terms-of-use

 You can:
 -Free use the plugin for your commercial and non commercial projects.
 -Translate the plugin to other languages (inform if you do this)
 -Change code of plugin, but you must specify a link to the original plugin

 You can't:
 -Delete or change any information about plugin (Title, authorship, contact information, version and release)

*/

/*:ru
 * @plugindesc v.1.1 Позволяет вводить имя с клавиатуры
 * @author DK (Денис Кузнецов)
 * @help

 ### Информация о плагине ###
 Название: DK_Name_Input
 Автор: DK (Денис Кузнецов)
 Сайт: https://dk-plugins.ru
 Версия: 1.1
 Релиз: 10.11.2016
 Первый релиз: 18.06.2016
 Поддерживаемые языки: Русский, Английский

 ### Лицензия и правила использования плагина ###

 Актуальная информация о правилах использования: https://dk-plugins.ru/terms-of-use

 Вы можете:
 -Бесплатно использовать данный плагин в некоммерческих и коммерческих проектах
 -Переводить плагин на другие языки (сообщите мне, если Вы перевели плагин на другой язык)
 -Изменять код плагина, но Вы обязаны указать ссылку на оригинальный плагин

 Вы не можете:
 -Убирать или изменять любую информацию о плагине (Название, авторство, контактная информация, версия и дата релиза)

*/

'use strict';

var Imported = Imported || {};
Imported.DK_Name_Input = 1.1;

//===========================================================================
// NameInputManager
//===========================================================================

function NameInputManager() {
	throw new Error('This is a static class (Это статический класс!)');
}

NameInputManager.isKeyCodeIgnored = function(keyCode) {
    const backspaceCode = 8;
    const enterCode = 13;
    const escapeCode = 27;

	return keyCode === escapeCode || keyCode === enterCode || keyCode === backspaceCode;
};

NameInputManager.isBackSpace = function(keyCode) {
    const backspaceCode = 8;

    return keyCode === backspaceCode;
};

NameInputManager.isCancelled = function() {
    if (this._isCancelled) {
    	this._isCancelled = false;

    	return true;
	}

	return false;
};

NameInputManager.onKeyPress = function(event) {
	if (NameInputManager.isKeyCodeIgnored(event.keyCode)) {
        return;
	}

	if (NameInputManager.checkInputText()) {
        NameInputManager._inputText += String.fromCharCode(event.charCode);
	} else {
        NameInputManager._inputText = String.fromCharCode(event.charCode);
	}
};

NameInputManager.onKeyDown = function(event) {
    if (this.isBackSpace(event.keyCode)) {
        this._isCancelled = true;
    }
};

NameInputManager.clear = function() {
  	this.clearInputText();
  	this.clearCancelled();
};

NameInputManager.clearInputText = function() {
	this._inputText = null;
};

NameInputManager.clearCancelled = function() {
    this._isCancelled = false;
};

NameInputManager.checkInputText = function() {
	return !!this._inputText;
};

NameInputManager.getInputText = function() {
	if (!this.checkInputText()) {
        return '';
	}

	const text = this._inputText;

	this.clearInputText();

	return text;
};

//===========================================================================
// Input
//===========================================================================

Input.keyMapper[8] = 'backspace'; // backspace

const Name_Input_Input_clear = Input.clear;
Input.clear = function() {
	Name_Input_Input_clear.call(this);
	NameInputManager.clear();
};

const Name_Input_Input_setupEventHandlers = Input._setupEventHandlers;
Input._setupEventHandlers = function () {
	Name_Input_Input_setupEventHandlers.call(this);
    document.addEventListener('keypress', NameInputManager.onKeyPress.bind(NameInputManager));
    document.addEventListener('keydown', NameInputManager.onKeyDown.bind(NameInputManager));
};

//===========================================================================
// Window_NameInput
//===========================================================================

const Name_Input_Window_NameInput_initialize = Window_NameInput.prototype.initialize;
Window_NameInput.prototype.initialize = function(editWindow) {
	Name_Input_Window_NameInput_initialize.call(this, editWindow);
	NameInputManager.clearInputText();
};

Window_NameInput.prototype.processHandling = function() {
    if (this.isOpen() && this.active) {
		if (NameInputManager.checkInputText()) {
		    const inputText = NameInputManager.getInputText();
		    let playOk = false;

		    for (let i = 0; i < inputText.length; i++) {
		        if (!this._editWindow.add(inputText[i])) {
                    SoundManager.playBuzzer();

                    break;
                } else {
                    playOk = true;
                }
            }

            if (playOk) {
                SoundManager.playOk();
            }
		}

		if (Imported.YEP_KeyboardConfig) {
			if (NameInputManager.isCancelled()) {
				this.processBack();
			}
		} else {
            if (Input.isRepeated('backspace')) {
                this.processBack();
            }
		}

        if (Input.isRepeated('cancel')) {
            this.processBack();
		}

        if (Input.isRepeated('ok')) {
            this.processOk();
		}
    }
};