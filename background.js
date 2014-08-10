chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create(
        'window.html',
        {
            "state": "fullscreen",
            "resizable": false,
            "alwaysOnTop": true
        },
        function(window) {
            var keyCodeWhitelist = [
                [32, 32],   // Space
                [48, 57],   // 0-9
                [65, 90],   // A-Z
                [96, 105],  // 0-9 (Keypad)
            ];
            // Try to stop all attempts to exit out of the app with key presses (e.g. ESC)
            window.contentWindow.document.addEventListener('keydown', function(e) {
                var blockEvent = true;
                keyCodeWhitelist.forEach(function(minMaxArray) {
                    if ((e.keyCode >= minMaxArray[0]) && (e.keyCode <= minMaxArray[1])) {
                        blockEvent = false;
                    }
                });
                if (blockEvent) {
                    console.log("Keydown blocked for: " + e.keyCode);
                    e.preventDefault();
                }
            });
            window.contentWindow.document.addEventListener('keyup', function(e) {
                var blockEvent = true;
                keyCodeWhitelist.forEach(function(minMaxArray) {
                    if ((e.keyCode >= minMaxArray[0]) && (e.keyCode <= minMaxArray[1])) {
                        blockEvent = false;
                    }
                });
                if (blockEvent) {
                    console.log("Keydown blocked for: " + e.keyCode);
                    e.preventDefault();
                }
            });
        }
    );
});