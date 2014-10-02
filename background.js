var useAlarms = false; // Use alarms or setInterval
var fullScreenCheckFrequency = 1; // seconds

chrome.tts.speak("Execution Started", {"enqueue": true});

var primaryUiOpen = false;

chrome.app.runtime.onLaunched.addListener(function(launchData) {
    launchApp();
});

chrome.app.runtime.onRestarted.addListener(function(launchData) {
    chrome.tts.speak("Restart happened", {"enqueue": true});
});


var launchApp = function() {
    chrome.app.window.create(
        "window.html",
        {
            "id": "primary",
            "state": "fullscreen",
            "resizable": false,
            "alwaysOnTop": true
        },
        function(window) {
            primaryUiOpen = !window.contentWindow.closed;
            var forceFullScreen = function () {
                chrome.tts.speak("Alarm, Tick", {"enqueue": true});
                chrome.tts.speak("Window " + primaryUiOpen, {"enqueue": true});
                window.show();
                if (!window.isFullscreen()) {
                    window.fullscreen();
                    chrome.tts.speak("Full Screen", {"enqueue": true});
                }
                // @temp Randomly shut down UI for no reason
                if (Math.random() > 0.9) {
                    chrome.tts.speak("Shutting Down UI", {"enqueue": true});
                    window.close();
                }
            };
            if (useAlarms) {
                // Create alarms (need cleaned up on window close)
                chrome.alarms.create("forceFullScreen", {
                    delayInMinutes: 60 / fullScreenCheckFrequency,    // Can't be < 1 in prod... boo
                    periodInMinutes: 60 / fullScreenCheckFrequency    // Can't be < 1 in prod... boo
                });
                chrome.alarms.onAlarm.addListener(function (alarm) {
                    if (alarm && alarm.name == "forceFullScreen") {
                        forceFullScreen();
                    }
                });
            } else {
                var fullScreenInterval = setInterval(forceFullScreen, fullScreenCheckFrequency * 1000);
            }
            // Create key events (need cleaned up on window close)
            var keyCodeWhitelist = [
                [32, 32],   // Space
                [48, 57],   // 0-9
                [65, 90],   // A-Z
                [96, 105],  // 0-9 (Keypad)
            ];
            // Try to stop all attempts to exit out of the app with key presses (e.g. ESC)
            var keyCallback = function(e) {
                var blockEvent = true;
                keyCodeWhitelist.forEach(function(minMaxArray) {
                    if ((e.keyCode >= minMaxArray[0]) && (e.keyCode <= minMaxArray[1])) {
                        blockEvent = false;
                    }
                });
                if (blockEvent) {
                    chrome.tts.speak("Denied!", {"enqueue": false});
                    console.log(e.type + " blocked for: " + e.keyCode);
                    e.preventDefault();
                }
            };
            window.contentWindow.document.addEventListener("keydown", keyCallback);
            window.contentWindow.document.addEventListener("keyup", keyCallback);

            // Handle the window closing (cleanup all the events, alarms, intervals, etc..)
            window.onClosed.addListener(function() {
                primaryUiOpen = false;
                chrome.tts.speak("Window " + primaryUiOpen, {"enqueue": true});
                chrome.tts.speak("Hiding UI, but I'm still running.", {"enqueue": true});
                window.contentWindow.document.removeEventListener("keydown", keyCallback);
                window.contentWindow.document.removeEventListener("keyup", keyCallback);
                if (useAlarms) {
                    chrome.alarms.clear("forceFullScreen");
                } else {
                    clearInterval(fullScreenInterval);
                }
                window.contentWindow.closed = false;
            });
        }
    );
}