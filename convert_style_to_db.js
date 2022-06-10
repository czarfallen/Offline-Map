#!/usr/bin/env node
'use strict';

const fs = require('fs');

const args = process.argv.slice(2);

if (args.length === 0) {
    console.log('Must indicate the style file path');
    console.log('node convert_style_to_db.js <path>');
    throw 'Style file path must be indicated';
}

const path = args[0];
const styleFile = fs.readFileSync(path);

let writeStream = fs.createWriteStream('config-db-style.txt');

const jsonStyle = JSON.parse(styleFile);
jsonStyle.layers.map(style => {
    const layerName = style.id;
    delete style.id;
    writeStream.write(JSON.stringify({
        layerName,
        style: JSON.stringify(style)
    }));
    writeStream.write(',\n');
    return true;
});

writeStream.on('finish', () => {
    console.log('wrote all data to file');
});

writeStream.end();
