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
    const color = req.body.color;

    text = await pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('INSERT INTO nursery (name, coordinate_lat, coordinate_long, color) VALUES ($1,$2,$3,$4) RETURNING id');
        var nurseryId = await client.query(query, [name,locationLat, locationLong, color]);

        query = format('INSERT INTO nursery_parameter (nursery_id, coordinate_lat, coordinate_long) VALUES ($1,$2,$3)');
        for(let i=0; i<polygonPoints.length; i++){
            await client.query(query, [nurseryId.rows[0].id,polygonPoints[i][0],polygonPoints[i][1]]);
        }

        done();
        res.send("Success");
    });
    // res.send("Failed");
});

router.get('/:id', function(req, res) {
    const id = req.params.id;

    pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('SELECT * FROM nursery WHERE id=$1 LIMIT 1');
        const centroid = await client.query(query, [id]);

        query = format('SELECT * FROM nursery_parameter WHERE nursery_id=$1');
        const parameters = await client.query(query, [id]);

        //get all plants from nursery id
        // query = format('SELECT * FROM plant WHERE nursery_id=$1');
        // const plants = await client.query(query, [id]);

        query = format('SELECT * FROM plant INNER JOIN clone ON plant.clone_id = clone.id WHERE plant.nursery_id=$1');
        const plants = await client.query(query, [id]);

        done();

        res.render('nursery_edit', { 
            title: 'Nursery', 
            centroid: centroid.rows[0],
            parameters: parameters.rows,
            plants: plants.rows,
            layout: './layouts/full-width' });
    });
});

router.post('/update', function(req, res) {
    const id = req.body.id;
    const name = req.body.name;
    const locationLat = req.body.locationLat;
    const locationLong = req.body.locationLong;
    const polygonPoints = JSON.parse(req.body.polygonPoints);
    const color = req.body.color;

    pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        // update centroid coordinate
        var query = format('UPDATE nursery SET name=$1, coordinate_lat=$2, coordinate_long=$3, color=$4 WHERE id=$5');
        await client.query(query, [name,locationLat, locationLong, color, id]).catch(e => res.send(e.stack));
        console.log("update nursery")

        query = format('DELETE FROM nursery_parameter WHERE nursery_id=$1');
        await client.query(query, [id]).catch(e => res.send(e.stack));
        console.log("delete points")

        query = format('INSERT INTO nursery_parameter (nursery_id, coordinate_lat, coordinate_long) VALUES ($1,$2,$3)');
        for(let i=0; i<polygonPoints.length; i++){
            await client.query(query, [id,polygonPoints[i][0],polygonPoints[i][1]]).catch(e => res.send(e.stack));
        }
        console.log("insert parameters")
        
        done();
        res.send({id: id});
    });
    // res.send("Failed");
});

module.exports = router;