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

    done();

    res.render('clones', { title: 'Cocoa Clones', data: rows, layout: './layouts/full-width' });
  });   
});

router.get('/scans', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from plant_scan')
    const { rows } = await client.query(query);

    done();

    res.render('scans', { title: 'Scans', data: rows, layout: './layouts/full-width' });
  });   
});

router.get('/plants', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from plant')
    const { rows } = await client.query(query);

    done();

    res.render('plants', { title: 'Plants', data: rows, layout: './layouts/full-width' });
  });   
});

router.get('/workers', function(req, res, next) {
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from "user"')
    const { rows } = await client.query(query);

    done();

    res.render('workers', { title: 'Workers', data: rows, layout: './layouts/full-width' });
  });   
});

router.post('/createClone', function(req, res) {
  const name = req.body.name;
  const color = req.body.color;

  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('INSERT INTO clone (name, color) VALUES ($1, $2)')
    await client.query(query, [name, color]);

    done();


    res.redirect('back');
  });
});

router.post('/updateClone/:id', function(req, res) {
  const id = req.params.id;
  const name = req.body.name;
  const color = req.body.color;

  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('UPDATE clone SET name=$1, color=$2 WHERE id=$3')
    await client.query(query, [name, color, id]);

    done();


    res.redirect('back');
  });
});

router.post('/getClones', function(req, res, next) {
  pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from clone ORDER BY id ASC ')
    const { rows } = await client.query(query);

    done();

    res.send(JSON.stringify(rows));
  });   
});

router.post('/getNurseries', function(req, res, next) {
  pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('SELECT * from nursery ORDER BY id ASC ')
    const { rows } = await client.query(query);

    done();

    res.send(JSON.stringify(rows));
  });   
});

router.post('/createUser', function(req, res) {
  const name = req.body.name;
  const role = req.body.role;
  text = pool.connect(async function (err, client, done) {
    if (err) throw new Error(err);

    var query = format('INSERT INTO "user" (name,role) VALUES ($1,$2)')
    await client.query(query, [name,role]);
    
    done();

    res.redirect('back');
  });
});

router.get('/test', function(req, res) {

  console.log("helo");
  res.render('test', { });
});


module.exports = router;
