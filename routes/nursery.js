var express = require('express');
var router = express.Router();
const format = require('pg-format');
var pool = require('../database.js');

router.get('/', function(req, res, next) {
    pool.connect(async function (err, client, done) {
      if (err) throw new Error(err);
  
        var query = format('SELECT * from nursery')
        const { rows } = await client.query(query);
        done();
        res.render('nurseries', { title: 'Nurseries', data: rows, layout: './layouts/full-width' });

    });
});
router.post('/create', async function(req, res) {
    const name = req.body.name;
    const locationLat = req.body.locationLat;
    const locationLong = req.body.locationLong;
    const polygonPoints = JSON.parse(req.body.polygonPoints);

    text = await pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('INSERT INTO nursery (name, coordinate_lat, coordinate_long) VALUES ($1,$2,$3) RETURNING id');
        var nurseryId = await client.query(query, [name,locationLat, locationLong]);

        query = format('INSERT INTO nursery_parameter (nursery_id, coordinate_lat, coordinate_long) VALUES ($1,$2,$3)');
        for(let i=0; i<polygonPoints.length; i++){
        await client.query(query, [nurseryId.rows[0].id,polygonPoints[i][0],polygonPoints[i][1]]);
        }
        res.send("Success");
    });
    // res.send("Failed");
});

router.post('/get', function(req, res) {
    const id = req.body.id;

    text = pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('SELECT * FROM nursery WHERE id=$1 LIMIT 1');
        const centroid = await client.query(query, [id]);

        query = format('SELECT * FROM nursery_parameter WHERE nursery_id=$1');
        const parameters = await client.query(query, [id]);

        res.send({
            centroid: centroid.rows[0],
            parameters: parameters.rows,
        });
        // res.send("Success");
    });
    // res.send("Failed");
});
router.get('/:id', function(req, res) {
    const id = req.params.id;

    text = pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('SELECT * FROM nursery WHERE id=$1 LIMIT 1');
        const centroid = await client.query(query, [id]);

        query = format('SELECT * FROM nursery_parameter WHERE nursery_id=$1');
        const parameters = await client.query(query, [id]);

        res.render('nursery_edit', { 
            title: 'Nursery', 
            centroid: centroid.rows[0],
            parameters: parameters.rows,
            layout: './layouts/full-width' });
    });
});

router.post('/update', function(req, res) {
    const id = req.body.id;
    console.log(id)
    const name = req.body.name;
    const locationLat = req.body.locationLat;
    const locationLong = req.body.locationLong;
    const polygonPoints = JSON.parse(req.body.polygonPoints);

    pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        // update centroid coordinate
        var query = format('UPDATE nursery SET name=$1, coordinate_lat=$2, coordinate_long=$3 WHERE id=$4');
        await client.query(query, [name,locationLat, locationLong,id]);
        console.log("update nursery")

        query = format('DELETE FROM nursery_parameter WHERE nursery_id=$1');
        await client.query(query, [id]);
        console.log("delete points")

        query = format('INSERT INTO nursery_parameter (nursery_id, coordinate_lat, coordinate_long) VALUES ($1,$2,$3)');
        for(let i=0; i<polygonPoints.length; i++){
            await client.query(query, [id,polygonPoints[i][0],polygonPoints[i][1]]);
        }
        console.log("insert parameters")
        
        res.send({id: id});
    });
    // res.send("Failed");
});

module.exports = router;