#!/usr/bin/env node

// cli interface

var _ = require('underscore');
var fs = require('fs');
var colors = require('colors');
var s3Upload = require('../lib/s3-upload');

var argv = require('optimist')
      .usage('Upload files to the s3 bucket.\nUsage: $0 [path]')
      .demand(1)
      .alias('p', 'prefix')
      .describe('p', 'prefix for uploaded file')
      .argv;

var base = argv._[0];

if (!fs.statSync(base).isDirectory()) {
  throw new Error('please specify a directory path.');
}

process.stdout.write('uploading: ');

s3Upload(base, argv.prefix)
  .then(function(urls) {
    console.log('\nupload success.'.cyan);
    console.log('uploaded file urls:'.cyan);
    _(urls).each(function(url) {
      console.log('\t%s', url);
    });
    process.exit();
  })
  .progressed(function() {
    process.stdout.write('#');
  });
