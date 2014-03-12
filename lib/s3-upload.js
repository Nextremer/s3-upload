var _ = require('underscore');
var Promise = require('bluebird');
var fs = Promise.promisifyAll(require('fs'));
var join = require('path').join;
var resolve = require('path').resolve;
var knox = require('knox');
var config = require('config');

var s3Client = knox.createClient({
  key: config.aws.s3.key,
  secret: config.aws.s3.secret,
  bucket: config.aws.s3.bucket,
  region: config.aws.s3.region
});

/**
 * Upload files under `base` path to the s3 bucket.
 *
 * @param {string} base base path
 * @param {string} prefix optinal prefix for url
 * @return {Promise}
 * @api public
 */

function s3Upload(base, prefix) {
  prefix = prefix || '';
  return fs.readdirAsync(base)
    .then(function(files) {
      return Promise.all(_(files).map(function(file) {
        var src = resolve(join(base, file));
        var dst = join(prefix, file);
        return putFile(src, dst);
      }));
    });
}

/**
 * Upload a file to the s3 bucket.
 *
 * @param {string} path file path
 * @param {string} name uploaded file name
 * @return {Promise}
 * @api private
 */

function putFile(path, name) {
  var deferred = Promise.defer();

  s3Client.putFile(
    path,
    name,
    { "Content-Type": "image/jpeg", "x-amz-acl": "public-read" },
    function(err, result) {
      if (err) { return deferred.reject(err); }
      if (result.statusCode !== 200) {
        deferred.reject(new Error('upload failed, code: ' + result.statusCode));
      }
      deferred.progress(result.req.url);
      deferred.resolve(result.req.url);
    }
  );

  return deferred.promise;
}

module.exports = s3Upload;
