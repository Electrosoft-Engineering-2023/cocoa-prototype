var express = require('express');
var router = express.Router();
const format = require('pg-format');
var pool = require('../database.js');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('analytics', { title: 'Analytics Template', layout: './layouts/full-width' })
});

router.get('/clones', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from clone')
    const { rows } = await client.query(query);

    res.render('clones', { title: 'Cocoa Clones', data: rows, layout: './layouts/full-width' });
  });   
});

router.get('/scans', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from plant_scan')
    const { rows } = await client.query(query);

    res.render('scans', { title: 'Scans', data: rows, layout: './layouts/full-width' });
  });   
});

router.get('/plants', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from plant')
    const { rows } = await client.query(query);

    res.render('plants', { title: 'Plants', data: rows, layout: './layouts/full-width' });
  });   
});

router.get('/workers', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from "user"')
    const { rows } = await client.query(query);

    res.render('workers', { title: 'Workers', data: rows, layout: './layouts/full-width' });
  });   
});

router.post('/createClone', function(req, res) {
  const name = req.body.name;

  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('INSERT INTO clone (name) VALUES (%L)', name)
    await client.query(query);
    res.redirect('back');
  });
});


router.post('/createUser', function(req, res) {
  const name = req.body.name;
  const role = req.body.role;
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('INSERT INTO "user" (name,role) VALUES ($1,$2)')
    await client.query(query, [name,role]);
    res.redirect('back');
  });
});

router.get('/test', function(req, res) {

  console.log("helo");
  res.render('test', { });
});


module.exports = router;
