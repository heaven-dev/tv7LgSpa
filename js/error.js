'use strict';

var Error = (function () {

    function Error() { }

    Error.prototype.initError = function () {
        hideElementById('toolbarContainer');
        hideElementById('sidebar');

        var elem = getElementById('errorText');
        if (elem) {
            var errorText = getValueFromCache(errorTextKey);
            if (errorText) {
                elem.innerHTML = errorText;
            }
            else {
                elem.innerHTML = somethingWentWrongText;
            }

            focusToElement('restartButton');
        }

        // add eventListener for keydown
        document.addEventListener('keydown', erKeyDownEventListener);
    }

    function erKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;
        var contentId = e.target.id;

        if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            removeKeydownEventListener();
            window.close();
        }
        else if (keyCode === LEFT) {
            // LEFT button
            if (contentId === 'exitButton') {
                focusToElement('restartButton');
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT button
            if (contentId === 'restartButton') {
                focusToElement('exitButton');
            }
        }
        else if (keyCode === OK) {
            // OK button
            if (contentId === 'restartButton') {
                removeKeydownEventListener();
                window.open(indexPage, _self);
            }
            else if (contentId === 'exitButton') {
                removeKeydownEventListener();
                window.close();
            }
        }
    };

    function removeKeydownEventListener() {
        document.removeEventListener('keydown', erKeyDownEventListener);
    }

    Error.prototype.removeEventListener = function () {
        removeKeydownEventListener();
    }

    return Error;
}());

function erRestartBtnClicked() {
    var obj = new Error();
    obj.removeEventListener();
    window.open(indexPage, _self);
}

function erExitBtnClicked() {
    var obj = new Error();
    obj.removeEventListener();
    window.close();
}
