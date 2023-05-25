// initialize map
var map = L.map('map').setView([4.2105, 101.9758], 10);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
maxZoom: 19,
attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//add geocoder to map
L.Control.geocoder().addTo(map);

//marker icon style
const redIcon = new L.Icon({
iconUrl:
    "/images/icons/marker-icon-2x-red.png",
shadowUrl:
    "/images/icons/marker-shadow.png",
iconSize: [25, 41],
iconAnchor: [12, 41],
popupAnchor: [1, -34],
shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
iconUrl:
    "/images/icons/marker-icon-2x-green.png",
shadowUrl:
    "/images/icons/marker-shadow.png",
iconSize: [25, 41],
iconAnchor: [12, 41],
popupAnchor: [1, -34],
shadowSize: [41, 41]
});

polygonPoints = [];
var polygon;

//create popup
var popup = L.popup();
markers = [];
var centroid;

function onMapClick(e) {
//add new point
polygonPoints.push([e.latlng.lat, e.latlng.lng]);

markers.push(L.marker(polygonPoints[polygonPoints.length-1],{
    draggable: true,
    autoPan: true,
    icon: redIcon
}).addTo(map));
// remove previous polygon
refreshPolygon();

//find centroid
centroidPoint = getPolygonCentroid(polygonPoints);
centroid = L.marker([centroidPoint.x, centroidPoint.y],{
    icon: greenIcon
}).addTo(map);

}
map.on('click', onMapClick);

//marker event
map.on('click',
function mapClickListen(e) {
    for(let i=0; i<markers.length; i++){
    markers[i].on('drag', function(e) {
        console.log('marker drag event');
    });
    markers[i].on('dragstart', function(e) {
        console.log('marker dragstart event');
        map.off('click', mapClickListen);
    });
    markers[i].on('dragend', function(e) {
        console.log('marker dragend event');
        //update polygonPoint
        polygonPoints[i] = [markers[i].getLatLng().lat, markers[i].getLatLng().lng];

        //refresh polygon
        refreshPolygon();
        setTimeout(function() {
        map.on('click', mapClickListen);
        }, 10);
    });
    }
}
);

function refreshPolygon(){
if(polygon){
    map.removeLayer(polygon);
}
if(centroid){
    map.removeLayer(centroid);
}

//create new polygon
polygon = L.polygon(polygonPoints).addTo(map);
}

function getPolygonCentroid(points) {
var centroidX = 0, centroidY = 0;
var area = 0;
var prevIndex = points.length - 1;

for (var i = 0; i < points.length; i++) {
    var currPoint = points[i];
    var prevPoint = points[prevIndex];
    var crossProduct = (prevPoint[0] * currPoint[1]) - (currPoint[0] * prevPoint[1]);
    area += crossProduct;
    centroidX += (prevPoint[0] + currPoint[0]) * crossProduct;
    centroidY += (prevPoint[1] + currPoint[1]) * crossProduct;
    prevIndex = i;
}

area /= 2;
centroidX /= (6 * area);
centroidY /= (6 * area);

return {x: centroidX, y: centroidY};
}

$("#nurseryForm").submit(function(e) {
// get value from form
var nameSend = document.getElementById("nameInput").value;
var polygonJSON = JSON.stringify(polygonPoints);
e.preventDefault();
$.ajax({
    url: "/nursery/create",
    type: "POST",
    data: {
        name: nameSend,
        location: centroidPoint.x+" "+centroidPoint.y,
        polygonPoints: polygonJSON,
    },
    success: function(data){
        window.location.href = "/nursery";
    }
});
});

function refreshMap(){
document.getElementById('id01').style.display='block'
map.invalidateSize();
}