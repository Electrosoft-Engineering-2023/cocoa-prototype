var express = require('express');
var router = express.Router();


var path = require('path');
var mime = require('mime');
var fs = require('fs');

router.get('/', function(req, res){
    const file = __dirname+'/app-release.apk';
    res.download(file); // Set disposition and send it.
});

module.exports = router;
