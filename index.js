
var readline = require('readline');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var CONFIG = require('./config.json');


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
      mapping = res;
      mappingLoader.emit('done');
  });  
}


function findTopFiles(topFolder, outputFolder, mapping) {
  console.log("finding top files to modify:" + topFolder);
  
  fs.readdir(topFolder, (err, files) => {
    files.forEach(file => {
      if (file.endsWith('.top')) {
        topFiles.push(file);
      }
    });
  })
}


function getReplacementInMapping(type, key) {
  var list = mapping[type][key];
  if (list!=null) {
    mapping[type][key].used = true;
    res = '';
    if (type=='us') {
      res = '#!' + list.join('\n#!');
    } else if (type=='bs') {
      res = '[ ' + list.join(' ][ ') + ']';
    }
    return res;  
  } else {
    console.log("WARNING: not in mapping: " + key);
    logs['notInMapping'].push(type);
    return null;
  }
}

function updateTopFile(topFile) {
  console.log("starting to modify top file:" + topFile);
  
  var pattBs = /\b(bs[^\s]*)\b/;
  var pattUs = /\#\s*(us[^\s]*)\b/;

  var lineReader = readline.createInterface({
    input: fs.createReadStream(CONFIG.cstop + '/' + topFile)
  });

  var newContent = "";
  var newLine;
  lineReader.on('line', function (line) {
  
    if (pattBs.test(line)) {
      var key = pattBs.exec(line)[1];
      console.log("FOUND bs: " + key + " in: " + topFile);
      var repl = getReplacementInMapping('bs', key);
      newLine = repl ? line.replace(pattBs, repl) : line;
      console.log(newLine);      
    } else if (pattUs.test(line)) {
      var key = pattUs.exec(line)[1];
      console.log("FOUND us: " + key + " in: " + topFile);
      var add = getReplacementInMapping('us', key);
      newLine = line + (add ? "\n" + add : "");
      console.log(newLine);      
    } else {
      // unchanged line
      newLine = line;
    }
    newContent += newLine + '\n';    

  
  
              
  
  
  
  
  }).on('close', function() {         
    console.log("writing new file");
    fs.writeFile(CONFIG.cstopoutput + '/' + topFile, newContent);
  });

}



loadMapping(CONFIG.mapping);

var topFiles = [];
findTopFiles(CONFIG.cstop);

var logs = {
  'notInTop': [],
  'notInMapping': []
};

var mapping;

mappingLoader.on('done', function() {
  console.log(mapping);
  for(var i=0; i<topFiles.length; i++) {
    updateTopFile(topFiles[i]);
  }
});



// when?
console.log(logs);

/*
topFilesUpdater.on('done', function() {
  console.log("DONE.");
});
*/



