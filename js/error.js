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

            var closeButton = getElementById('closeButton');
            if (closeButton) {
                closeButton.focus();
            }
        }

        // add eventListener for keydown
        document.addEventListener('keydown', erKeyDownEventListener);
    }

    function erKeyDownEventListener(e) {
        e.preventDefault();
        e.stopPropagation();

        var keyCode = e.keyCode;

        if (keyCode === OK) {
            // OK button
            console.log('Button clicked.');

            removeKeydownEventListener();
            window.close();
        }
    };

    function removeKeydownEventListener() {
        document.removeEventListener('keydown', erKeyDownEventListener);
    }

    return Error;
}());

function erCloseBtnClicked() {
    window.close();
}
