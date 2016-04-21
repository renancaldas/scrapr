
/* Dependencies
------------------------*/
var debug = require('debug')('scrapr');
var request = require('request');
var cheerio = require('cheerio');
var path = require('path');
var spawn = require('child_process').spawn;
var slimerjs = require('slimerjs');
var Q = require('q');

function getHtmlViaRequest(url) {
	var deferred = Q.defer();

	if(!url)
		deferred.reject('Url is not defined.');
	else {
	    request(url, function(err, res, html) {
	        if(!err) {
	        	// Apply cheerio
	            var $ = cheerio.load(html);
	            deferred.resolve($);
	        }
	        else {
	            deferred.reject(err);
	        }
	    });
    }

    return deferred.promise;
}

function getHtmlViaBrowser(url, loadImages) {
	var deferred = Q.defer();

	if(url == null || url == undefined)
		deferred.reject('Url is not defined.');
	else if(loadImages == null || loadImages == undefined) 
		deferred.reject('LoadImages is not defined.');
	else {
		var args = [ path.join(__dirname, '_browser.js'), url, loadImages ]; 
		var options = {
			maxBuffer:  200*1024 // default
		}
		var proc_child = spawn(slimerjs.path, args, options);

		// Listen to stdout
		var parts = new Array();
		proc_child.stdout.on('data', function(data) {

			// Parse data type
			data = data.toString();
			var event = data.split('[:ev:]')[0];
			var value = data.split('[:ev:]')[1];

			switch(event) {

				case 'part': 
					parts.push(value);
					break;

				case 'resolve': 
					debug('Done %s', url);
					var html = '';
					parts.forEach(function(item) { html += item ; });

					// Apply cheerio
					var $ = cheerio.load(html);
	            	deferred.resolve($);
					break;

				case 'reject': 
					deferred.reject(value);
					break;

				case 'debug': 
					debug(value);
					break;
			}
		});
	}

	return deferred.promise;
}

module.exports = {
	getHtmlViaRequest: function(url) { return getHtmlViaRequest(url); },
	getHtmlViaBrowser: function(url, loadImages) { return getHtmlViaBrowser(url, loadImages); },
	parseListIntoSlices: function(list, sliceLimit) {

        /* Separating items into slices for parallel request
        -----------------------------------------------------*/
        var slice = new Array();
        var sliceLimit = sliceLimit;
        var sliceList = new Array();

        for (var i = 0; i < list.length; i++) {
            var item = list[i];
            var isLastItem = (i === list.length-1);

            // Add item to slice
            slice.push(item);

            // Reached slice limit or is the last?
            if(slice.length === sliceLimit || isLastItem) {
                sliceList.push(slice);
                slice = new Array();
            }
        }
        
       	return sliceList;
	}
}