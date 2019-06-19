//
// ToioEditor.js
// backend entry file
//

'use strict';

const fs = require('fs');
const process = require('process');
const WebService = require('./WebService');

process.on('uncaughtException', (err) => {
  console.log('----');
  console.log('[[ Exception ]]');
  console.log(Date());
  console.log('uid:', process.getuid());
  console.log(err);
  console.log(err.stack);
  console.log('----');
});

let configFile = null;
for(let i = 2; i < process.argv.length; i++) {
  if(process.argv[i] == '-c') {
    if(i + 1 < process.argv.length) configFile = process.argv[i + 1];
    i++;
  }
}
if(configFile == null) configFile = __dirname + '/../config.json';
new WebService(JSON.parse(fs.readFileSync(configFile, 'UTF-8')));
