function updatePlantJob(){
    var pool = require('../database.js');
    const format = require('pg-format');

    pool.connect(function (err, client, done) {
        if (err) throw new Error(err);

        var query = format('SELECT * from plant_scan WHERE status=0 AND mode!=0 ORDER BY datetime_scan ASC');
        
        return client.query(query, async function (err, plant_scan) {
            if (err) throw new Error(err);
            
            // loop through each plant_scan
            for(var i = 0; i < plant_scan.rows.length; i++){
                // search for plant with the same tag id
                // query1 = format('SELECT * from plant WHERE tag_id=$1', plant_scan.rows[i].tag_id);
                text = JSON.stringify(plant_scan.rows[i]);
                console.log(text);

                // Mode 1: Update plant data
                if(plant_scan.rows[i].mode == '1'){
                    console.log("Finding existing plant...");
                    var plant = await client.query("SELECT * from plant WHERE tag_id=$1", [plant_scan.rows[i].tag_id]);
                    console.log("Stopped finding existing plant...");
                    // Extract tag data
                    // Seperate string into array by comma
                    const strTag = plant_scan.rows[i].tag_text;
                    const arrTag = strTag.split(",");
                    //clone,location_origin,date_sow,nursery,dsb

                    //find clone id
                    console.log("Finding clone...");
                    const clone = await client.query('SELECT * from clone WHERE name=$1', [arrTag[0]]);

                    //find nursery id
                    console.log("Finding nursery...");
                    const nursery = await client.query('SELECT * from nursery WHERE name=$1', [arrTag[3]]);

                    // If plant exists
                    if(plant.rows.length > 0){
                        // Update plant data
                        console.log("Updating plant...");
                        const check = await client.query('UPDATE plant SET location_origin=$1, nursery_id=$2, dsb=$3 WHERE tag_id=$4', 
                        [arrTag[1], nursery.rows[0].id, arrTag[4], plant_scan.rows[i].tag_id])
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
                        
                        const check = await client.query('INSERT INTO plant (clone_id, location_origin, date_sow, nursery_id, tag_id, status, dsb) VALUES ($1, $2, $3, $4, $5, $6, $7)', 
                        [clone.rows[0].id, arrTag[1], arrTag[2], nursery.rows[0].id, plant_scan.rows[i].tag_id, 1, arrTag[4]])
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
                    
                }
                
            }

            done();
        })
    });
}
// export {updatePlantJob};
module.exports = {
    updatePlantJob,
}