# Scrapr

A tool for getting public website content using a browser engine or http get.

##### "Why should I use this"?
There are websites that rely on javascript frameworks (like jQuery or AngularJS) and process dynamic data after the page load. For these type of websites, you should use a browser to interpert the javascript code and then get the data. Which is what this tool does: provides methods for this task using [SlimerJS](https://slimerjs.org/) (Firefox's  Gecko engine)  in the background.


#### Installation
```sh
  $ npm install scrapr --save
```

#### Methods

---

##### getHtmlViaBrowser(url, loadImages)
 * **url**: string (required)
 * **loadImages**: bool (optional)

Opens a browser under the hood, waits for the page load and then gets the data. Returns a promise with a jQuery object ($). This is useful if the page relies on javascript and updates the html content after the page load.

```
var scrapr = require('scrapr');

// Opens a browser (loading images), goes to google, gets html tag, finds "feeling lucky button" and prints it
scrapr.getHtmlViaBrowser('http://www.google.com', true).then(function($){
    $('html').filter(function(){  
      var htmlTag = $(this);
      var luckyButton = htmlTag.find('input.lsb')[0];
      console.log($(luckyButton).attr('value'));
    });
}, function(err){
    console.log('Could not request page. Error: ' + err.message);
});
```

---

##### getHtmlViaRequest(url) 
* **url**: string (required)

Makes a direct GET request to the url and returns a promise with a jQuery object ($). This is useful if the page does not rely on javascript and updates the html content after the page load.
```
var scrapr = require('scrapr');

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


---

##### parseListIntoSlices(arrayToParse, length)
* **arrayToParse**: string (required)
* **length**: number (required)

A helper function that splits a large array into slices with the specified length. Useful for throttling large amount of requests while doing parallel requests. For example: scraping 50 pages into slices of 5 with a minute interval for each slice.

```
var scrapr = require('scrapr');

// Creates an array of 50 elements and then split it into slices of 6
var largeArray = new Array();
for(var i = 0; i < 50; i++) {
  largeArray.push(i);
}

var slices = scrapr.parseListIntoSlices(largeArray, 6);
console.log(slices);
```


### Author
---
Renan Caldas de Oliveira

- Web: http://www.renancaldas.com
