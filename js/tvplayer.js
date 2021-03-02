'use strict';

var TvPlayer = (function () {

    function TvPlayer() { }

    var player = null;
    var controlsVisible = false;
    var programIndex = 0;
    var programData = null;
    var ongoingProgramIndex = 0;
    var interval = null;

    TvPlayer.prototype.initTvPlayer = function () {
        hideElementById('toolbarContainer');
        hideElementById('sidebar');

        var elem = getElementById('tvPlayer');
        if (elem) {
            elem.style.height = getWindowHeight() + 'px';
        }

        initTvPlayerVariables();

        var url = getChannelUrl();

        var options = {
            preload: 'auto',
            autoplay: true,
            muted: false,
            fluid: true,
            html5: {
                hls: {
                    overrideNative: true
                },
                nativeAudioTracks: false,
                nativeVideoTracks: false
            },
            bandwidth: 50000000
        };

        // If versions defined in the constants.js we don't override native to those versions
        var sdkVersion = sessionStorage.getItem(sdkVersionKey);
        if (sdkVersion) {
            if (videoNotOverrideNative.indexOf(sdkVersion) !== -1) {
                options.html5.hls.overrideNative = false;
                options.html5.nativeAudioTracks = true;
                options.html5.nativeVideoTracks = true;
            }
        }

        player = videojs('videoPlayer', options, function onPlayerReady() {
            player.src({ type: streamType, src: url });

            player.ready(function () {
                videojs.log('Player is ready!');

                this.play();
            });

            this.on('ended', function () {
                videojs.log('Video end!');
            });

            this.on('pause', function () {
                videojs.log('Video paused!');
            });

            this.on('play', function () {
                videojs.log('Video play!');
            });

            this.on('error', function () {
                videojs.log('Error loading video!');
            });
        });

        // add eventListener for keydown
        document.addEventListener('keydown', tpKeyDownEventListener);

        programData = getValueFromCache(programScheduleDataKey);
        if (programData) {
            programData = JSON.parse(programData);
            //console.log('Program count: ', programData.length);
        }
    }

    function removeEventListeners() {
        console.log('***Remove TV player event listeners.');
        document.removeEventListener('keydown', tpKeyDownEventListener);
    }

    function tpKeyDownEventListener(e) {
        var keyCode = e.keyCode;

        if (keyCode === UP) {
            // UP arrow
        }
        else if (keyCode === DOWN) {
            // DOWN arrow
        }
        else if (keyCode === LEFT) {
            // LEFT arrow
            if (controlsVisible && programIndex > 0 && !isOngoingProgram(programData, programIndex)) {
                programIndex--;
                updateProgramDetails();
            }
        }
        else if (keyCode === RIGHT) {
            // RIGHT arrow
            if (controlsVisible && isInIndex(programData, programIndex + 1)) {
                programIndex++;
                updateProgramDetails();
            }
        }
        else if (keyCode === OK) {
            // OK button
            if (!controlsVisible) {
                // Show controls
                showControls();

                programIndex = 0;
                updateProgramDetails();
            }
            else {
                // Hide controls
                hideControls();
            }
        }
        else if (keyCode === RETURN || keyCode === ESC) {
            // RETURN button
            if (controlsVisible) {
                hideControls();
            }
            else {
                exitFromPlayer();
            }
        }
    }

    function exitFromPlayer() {
        if (player) {
            player.dispose();
        }

        removeEventListeners();
        stopInterval();
        toPreviousPage(tvMainPage);
    }

    function addInterval() {
        ongoingProgramIndex = getOngoingProgramIndex(programData);

        // Update controls (status bar, date time)
        interval = setInterval(function () {
            if (controlsVisible) {
                updateProgramDetails(true);
            }
        }, tvPlayerControlsUpdateInterval);
    }

    function stopInterval() {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
    }

    function updateProgramDetails(fromTimer) {
        var elem = null;

        if (fromTimer) {
            var index = getOngoingProgramIndex(programData);
            if (index !== ongoingProgramIndex) {
                // ongoing program changed
                if (programIndex <= 1) {
                    programIndex = 0;
                }
                else {
                    programIndex--;
                }

                ongoingProgramIndex = index;
            }
        }

        if (!fromTimer || (fromTimer && programIndex === 0)) {
            var program = getProgramByIndex(programData, programIndex);
            if (program) {
                elem = getElementById('programDetails');
                if (elem) {
                    elem.style.display = 'flex';
                }

                var date = program.isStartDateToday ? '' : program.localStartDate + ' | ';

                addToElement('programName', date + program.localStartTime + ' - ' + program.localEndTime + ' ' + program.name_desc);

                addToElement('programDescription', program.caption ? program.caption : '');

                elem = getElementById('statusBar');
                if (elem) {
                    elem.style.width = program.passedPercent + '%';
                }

                if (programIndex === 0) {
                    hideElementById('comingProgramsText');
                    showElementById('statusBarContainer');
                }
                else {
                    showElementById('comingProgramsText');
                    hideElementById('statusBarContainer');
                }
            }
        }

        addToElement('dateTime', getLocalDateTime());
    }

    function showControls() {
        setLocaleText('comingProgramsText');
        updateProgramDetails();

        controlsVisible = true;

        addInterval();
    }

    function hideControls() {
        hideElementById('programDetails');

        stopInterval();

        programIndex = 0;
        controlsVisible = false;
    }

    function initTvPlayerVariables() {
        player = null;
        controlsVisible = false;
        programIndex = 0;
        programData = null;
        ongoingProgramIndex = 0;
        interval = null;
    }

    return TvPlayer;
}());
