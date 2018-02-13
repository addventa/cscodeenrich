
var readline = require('readline');
var fs = require('fs');
var EventEmitter = require('events').EventEmitter;

var CONFIG = require('./config.json');


var mappingLoader = new EventEmitter();
var topFileUpdater = new EventEmitter();


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
      allKeys.push(line);
    } else if (line.startsWith("us")) {
      // console.log('is a us line: ' + line);
      current = res.us[line] = new Array();
      allKeys.push(line);
    } else {
      // console.log('is a data line: ' + line);
      current.push(line);
    }
    
  }).on('close', function() {
      mapping = res;
      mappingLoader.emit('done');
  });  
}


function findTopFiles(topFolder) {
  console.log("finding top files to modify: " + topFolder);
  
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
    usedKeys.push(key);
    res = '';
    if (type=='us') {
      res = '#!' + list.join('\n#!');
    } else if (type=='bs') {
      res = '[ ' + list.join(' ][ ') + ']';
    }
    return res;  
  } else {
    console.log("WARNING: not in mapping: " + key);
    logs['notInMapping'].push(key);
    console.log( logs['notInMapping'] );
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
    fs.writeFile(CONFIG.cstopoutput + '/' + topFile, newContent);
    console.log("done with: " + topFile);
    topFileUpdater.emit('done', topFile);
  });

}


var logs = {
  'notInTop': [],
  'notInMapping': []
};
var usedKeys = [];

var mapping;
var allKeys = [];

var topFiles = [];
var topFilesLeft;


loadMapping(CONFIG.mapping);
findTopFiles(CONFIG.cstop);

mappingLoader.on('done', function() {
  console.log(mapping);
  
  topFilesLeft = topFiles.slice(); 
  
  for(var i=0; i<topFiles.length; i++) {
    updateTopFile(topFiles[i]);
  }
});

topFileUpdater.on('done', function(updatedFile) {
  topFilesLeft.pop(updatedFile);

  if (topFilesLeft.length==0) {
    finish();
  }  
});

function finish() {
  
  for (var i=0; i<allKeys.length; i++) {
    var key = allKeys[i];
    if (! usedKeys.includes(key)) {
      logs['notInTop'].push(key);
    }
  }
    
  console.log(logs);
  console.log("DONE.");
}

