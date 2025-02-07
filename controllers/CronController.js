function updatePlantJob(){
    var pool = require('../database.js');
    const format = require('pg-format');

    pool.connect(async function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('SELECT * from plant_scan WHERE status=0 AND mode!=0 ORDER BY datetime_scan ASC');
        
        await client.query(query, async function (err, plant_scan) {
            if (err) throw new Error(err);
            
            // loop through each plant_scan
            for(var i = 0; i < plant_scan.rows.length; i++){
                // search for plant with the same tag id
                // query1 = format('SELECT * from plant WHERE tag_id=$1', plant_scan.rows[i].tag_id);
                text = JSON.stringify(plant_scan.rows[i]);
                console.log(text);

                // Extract tag data
                // Seperate string into array by comma
                const strTag = plant_scan.rows[i].tag_text;
                const arrTag = strTag.split(",");

                const location_origin = arrTag[1].split(" ");

                //clone,location_origin,date_sow,nursery,dsb

                //find clone id
                console.log("Finding clone...");
                const clone = await client.query('SELECT * from clone WHERE name=$1', [arrTag[0]]);

                //find nursery id
                console.log("Finding nursery...");
                const nursery = await client.query('SELECT * from nursery WHERE name=$1', [arrTag[3]]);


                // Mode 1: Update plant data
                if(plant_scan.rows[i].mode == '1'){
                    console.log("Finding existing plant...");
                    var plant = await client.query("SELECT * from plant WHERE tag_id=$1", [plant_scan.rows[i].tag_id]);
                    console.log("Stopped finding existing plant...");
                    
                    // If plant exists
                    if(plant.rows.length > 0){
                        // Update plant data
                        console.log("Updating plant...");
                        const check = await client.query('UPDATE plant SET coordinate_lat=$1, coordinate_long=$2, nursery_id=$3, dsb=$4, created_at=NOW()  WHERE tag_id=$5', 
                        [location_origin[0], location_origin[1], nursery.rows[0].id, arrTag[4], plant_scan.rows[i].tag_id])
                            .catch(e => console.error(e.stack));
                        
                        if(check.rowCount > 0){
                            console.log("Updating plant successful");
                            //update status to 1 (updated)
                            await client.query('UPDATE plant_scan SET status=1 WHERE id=$1', [plant_scan.rows[i].id]);
                        }
                    }
                    else{
                        // Insert plant data
                        console.log("Inserting plant...");
                        console.log(location_origin[0]);
                        
                        const check = await client.query('INSERT INTO plant (clone_id, coordinate_lat, coordinate_long, date_sow, nursery_id, tag_id, status, dsb) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
                        [clone.rows[0].id, location_origin[0], location_origin[1], arrTag[2], nursery.rows[0].id, plant_scan.rows[i].tag_id, 1, arrTag[4]])
                            .catch(e => console.error(e.stack));
                        

                        if(check.rowCount > 0){
                            console.log("Inserting plant successful");
                            //update status to 1 (updated)
                            await client.query('UPDATE plant_scan SET status=1 WHERE id=$1', [plant_scan.rows[i].id]);
                        }
                    }
                }
                // Mode 2: Change plant on plant tag
                if(plant_scan.rows[i].mode == '2'){
                    //1. create "plant_old" entity
                    await client.query('INSERT INTO plant_old(id, clone_id, coordinate_lat, coordinate_long, date_sow, nursery_id, tag_id, status, created_at, dsb, plant_id) SELECT id, clone_id, coordinate_lat, coordinate_long, date_sow, nursery_id, tag_id, status, created_at, dsb, plant_id FROM plant WHERE tag_id=$1',[plant_scan.rows[i].tag_id])
                    .catch(e => console.error(e.stack));
                    // await client.query('INSERT INTO plant_old(id, clone_id, location_origin, date_sow, nursery_id, tag_id, status, created_at, dsb, plant_id) SELECT * FROM plant WHERE tag_id=$1',[plant_scan.rows[i].tag_id])
                    // .catch(e => console.error(e.stack));

                    // 2. Delete "plant" entity
                    await client.query('DELETE FROM plant WHERE tag_id=$1', [plant_scan.rows[i].tag_id])
                    .catch(e => console.error(e.stack));

                    // 3. Create new "plant" entity
                    // Insert plant data
                    console.log("Inserting plant...");
                        
                    const check = await client.query('INSERT INTO plant (clone_id, coordinate_lat, coordinate_long, date_sow, nursery_id, tag_id, status, dsb) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)', 
                    [clone.rows[0].id, location_origin[0], location_origin[1], arrTag[2], nursery.rows[0].id, plant_scan.rows[i].tag_id, 1, arrTag[4]])
                        .catch(e => console.error(e.stack));

                    if(check.rowCount > 0){
                        console.log("Inserting plant successful");
                        //update status to 1 (updated)
                        await client.query('UPDATE plant_scan SET status=1 WHERE id=$1', [plant_scan.rows[i].id]);
                    }
                }
            }
        });
        done();
    });
}
module.exports = {
    updatePlantJob,
}