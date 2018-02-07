
var readline = require('readline');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;


var mappingLoader = new EventEmitter();


function loadMapping(fileName) {
 
  console.log("starting to load:" + fileName);

  var lineReader = readline.createInterface({
    input: fs.createReadStream(fileName)
  });
  
  var current;
  var res = {
    'us': {},
    'bs': {}
  };

  lineReader.on('line', function (line) {
    if (!line.replace(/\s/g, '').length) {
        // string only contained whitespace (ie. spaces, tabs or line breaks)
        return;
    }
    if (line.startsWith("bs")) {
      // console.log('is a bs line: ' + line);
      current = res.bs[line] = new Array();
    } else if (line.startsWith("us")) {
      // console.log('is a us line: ' + line);
      current = res.us[line] = new Array();
    } else {
      // console.log('is a data line: ' + line);
      current.push(line);
    }
    
  }).on('close', function() {
      mappingLoader.emit('done', res);
  });  
}




loadMapping("C:/java/projects/cscodeenrich/x.txt");


mappingLoader.on('done', function(mapping) {
  console.log(mapping);
});



