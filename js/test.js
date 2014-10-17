// Helpers to convert between ArrayBuffer and String
function ab2str(buf) {
    return String.fromCharCode.apply(null, new Uint8Array(buf));
}
function str2ab(str) {
    var buf = new ArrayBuffer(str.length);
    var bufView = new Uint8Array(buf);
    for (var i = 0, strLen=str.length; i < strLen; i++) {
        console.log(str.charCodeAt(i));
        bufView[i] = str.charCodeAt(i);
    }
    return buf;
}

function scannerOn(connectionId) {
    var sendString = "T";
    var sendCommand = String.fromCharCode(22) + sendString + String.fromCharCode(13);
    chrome.serial.send(connectionId, str2ab(sendCommand), function(sendInfo) {
        console.log(sendInfo);
        chrome.tts.speak('Send done', {'enqueue': true});
    });
}
function scannerOff(connectionId, callback) {
    var sendString = "U";
    var sendCommand = String.fromCharCode(22) + sendString + String.fromCharCode(13);
    chrome.serial.send(connectionId, str2ab(sendCommand), function(sendInfo) {
        console.log(sendInfo);
        chrome.tts.speak('Send done', {'enqueue': true});
        if (typeof callback === 'function') {
            callback();
        }
    });
}

// Wait for document to be ready
$(function() {  
    chrome.tts.speak('UI is ready', {'enqueue': true});
    
    $('.secret-tool-close').on('click', function() {
        chrome.tts.speak('User clicked close.', {'enqueue': true});
        window.close();
    });

    chrome.serial.getDevices(function(ports) {
        for (var i=0; i < ports.length; i++) {
            var $deviceButton = $('<button></button>')
                .text('Barcode: ' + ports[i].path)
                .addClass('huge')
                .addClass('com-port-button')
                .data('com-port', ports[i]);
            $('#page-home > section').append($deviceButton);
        }
        
        $('.com-port-button').on('click', function() {
            var $button = $(this)
            if (!$(this).hasClass('com-active')) {
                $button.addClass('com-active');
                chrome.serial.connect($button.data('com-port').path, {bitrate: 115200}, function (connectionInfo) {
                    console.log(connectionInfo);
                    chrome.tts.speak('Connected with connection ID ' + connectionInfo.connectionId, {'enqueue': true});
                    $button.data('com-connection-id', connectionInfo.connectionId);
                    
                    chrome.serial.onReceive.addListener(function(info) {
                        scannerOff(connectionInfo.connectionId);
                        var dataAsStr = ab2str(info.data);
                        $button.effect('highlight');
                        $('#com-result').text(dataAsStr).effect('highlight');
                    });
                    
                    chrome.serial.onReceiveError.addListener(function (info) {
                        console.log("onReceiveError", info);
                    });
                    
                    //TRGMOD0
                    
                    //                          Hex
                    //Request: PAPHHF           50 41 50 48 48 46
                    //Response: PAPHHF[ACK].    50 41 50 48 48 46 06 2e
                    
                    //Request: TRGMOD3          54 52 47 4d 4f 44 33
                    //Response: TRGMOD3[ACK].   54 52 47 4d 4f 44 33 06 2e
                    
                    //115200
                    
                    chrome.serial.getControlSignals(connectionInfo.connectionId, function(signals) {
                        console.log("signals: ", signals);
                    });
                    
                    scannerOn(connectionInfo.connectionId);
                    
                    /*
                    chrome.serial.flush(connectionInfo.connectionId, function(success) {
                        console.log(success);
                        chrome.tts.speak('Flush done', {'enqueue': true});
                    });
                    */
                });
            } else {
                var connectionId = $button.data('com-connection-id');
                scannerOff(connectionId, function() {
                    chrome.serial.disconnect(connectionId, function (success) {
                        if (success) {
                            chrome.tts.speak('Disconnected connection ID ' + connectionId, {'enqueue': true});
                            $button.removeClass('com-active');
                        } else {
                            chrome.tts.speak('Disonnect attempt failed for connection ID ' + connectionId, {'enqueue': true});
                        }
                    });
                });
            }
        });
    });
});