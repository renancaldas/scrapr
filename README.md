# Scrapr

A util for web scraping that uses slimerjs or direct request

#### Installation
```sh
  $ npm install scrapr --save
```

#### Methods
`getHtmlViaRequest(url) `
* url: string, required

Makes a direct GET request to the url and returns a promise with a jQuery object ($). This is useful if the page does not use a SPA framework or updates the html content after the page load.
```
var scrapr = require('scrapr.js');

// Gets google's html tag, finds "feeling lucky button" and prints it
scrapr.getHtmlViaRequest('http://www.google.com').then(function($){
    $('html').filter(function(){  
        var htmlTag = $(this);
        var luckyButton = htmlTag.find('input.lsb')[0];
        console.log($(luckyButton).attr('value'));
    });
}, function(err){
    console.log('Could not request page. Error: ' + err.message);
});
```

`getHtmlViaBrowser(url, loadImages)`
 * url: string, required
 * loadImages: bool, optional 

Opens a browser under the hood, waits for the page load and then gets the data. Returns a promise with a jQuery object ($). This is useful if the page uses a SPA framework or updates the html content after the page load.

```
var scrapr = require('scrapr.js');

// Opens a browser, goes to google, gets html tag, finds "feeling lucky button" and prints it
scrapr.getHtmlViaBrowser('http://www.google.com', false).then(function($){
    $('html').filter(function(){  
      var htmlTag = $(this);
      var luckyButton = htmlTag.find('input.lsb')[0];
      console.log($(luckyButton).attr('value'));
    });
}, function(err){
    console.log('Could not request page. Error: ' + err.message);
});
```

`parseListIntoSlices(arrayToParse, length)`
* arrayToParse: string, required
* length: number, required

A util function that splits an large array into slices with the specified length. Useful for throttling large amount of requests. For example, scraping 50 pages into slices of 5 with a minute interval for each slice.

```
var scrapr = require('scrapr.js');

// Creates an array of 50 elements and then split it into slices of 6
var largeArray = new Array();
for(var i = 0; i < 50; i++) {
  largeArray.push(i);
}

var slices = scrapr.parseListIntoSlices(largeArray, 6);
console.log(slices);
```