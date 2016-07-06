var system = require('system');
var args = system.args;
var page = require('webpage').create();

// Syncronize events to be sent to parent
var interval = 50;
var queue = new Array();
var _events = {
    debug: 'debug[:ev:]', 
    part: 'part[:ev:]', 
    resolve: 'resolve[:ev:]', 
    reject: 'reject[:ev:]'
}
function addQueue(data) { queue.push(data); }
setInterval(function(){
    if(queue.length > 0) {
        var index = 0;
        var item = queue[index];
        console.log(item);
        queue.splice(index, 1);

        // Kill process
        if(item.indexOf(_events.resolve) != -1) 
            phantom.exit(0);
        else if(item.indexOf(_events.reject) != -1) 
            phantom.exit(1);
    }
}, interval);

// Functions
function debug(message) { addQueue(_events.debug + message); }
function sendPart(data) { addQueue(_events.part + data); }
function resolve(data) { addQueue(_events.resolve + data); }
function reject(err) { addQueue(_events.reject + err); }

// Validate input params
var url = null;
var loadImages = null;
var error = '';

if(args.length != 3)
    error = 'Invalid list of arguments. It should receive: url (string), loadImages (true or false).';
else {
    url = args[1];
    loadImages = args[2];

    debug('url: ' + url);
    debug('loadImages: ' + loadImages);

    if(url === 'undefined' || url === 'null') 
        error = 'url is null or undefined.';
    else if(loadImages === 'undefined' || loadImages === 'null') 
         error = 'loadImages is null or undefined.';
}

// Check results
if(error.length > 0) {
    reject(error);
}
else {

    /* Browser settings
    http://phantomjs.org/api/webpage/property/settings.html
    ------------------------------------------------------*/
    page.viewportSize = { width: 1280, height: 720 };
    page.settings.loadImages  = (loadImages === 'true');
    page.settings.javascriptEnabled  = true;

    // Enable logging inside page
    page.onConsoleMessage = function(msg, lineNum, source){ /*console.log(msg);*/ };

    // Load page
    if(page.settings.loadImages)
        debug('Loading page with images: ' + url);
    else 
        debug('Loading page without images: ' + url);

    page.open(url, function(status) {
        debug(status);
        if (status === "success") {
            debug('Loaded successfully!');
            try {
                function evaluate() {
                    var html = page.evaluate(function() { return document.documentElement.outerHTML });

                    // Split html into chunks (avoid stdout buffer limit)
                    var total = html.length;
                    var chunkSize = 5000;

                    // Get parts
                    function getPart(startIndex) {
                        var endIndex = startIndex + chunkSize;
                        
                        if(endIndex > total) {
                            // Last chunk and stop
                            endIndex = total; // last index
                            var lastPart = html.substring(startIndex, endIndex);
                            sendPart(lastPart);
                            resolve();
                        }
                        else {
                            // Next chunk
                            var part = html.substring(startIndex, endIndex);
                            sendPart(part);

                            // Delay for next data to be sent to parent
                            getPart(endIndex);
                        }
                    }
                    getPart(0);
                }
                evaluate();
            }
            catch(ex) {
                debug('Error on loading page: ' + ex.message);
            }
        } else {
          reject('Could not find page: ' + url);
        }

    });
}