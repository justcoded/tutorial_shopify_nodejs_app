module.exports = {
    generateMspScript (location, mapStyle) {
        return `
$(function () { 
    var city = '${location[0].city}';
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': city}, function(results, status) {
        console.log(results)
        var location = results[0].geometry.location;
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: 12,
            center: location,
            styles: ${JSON.stringify(mapStyle)}
        });
        var marker = new google.maps.Marker({
            position: location,
            map: map
        });
    });
});
`;
    },
    generateMspHtml (googleApiKey) {
        return `
<div id="map-container">
    <div>{{ page.content }}</div>
    <style>
        #map {
            height: 400px;
            width: 100%;
        }
    </style>
    <div id="map"></div>
</div>
<script src="https://maps.googleapis.com/maps/api/js?key=${googleApiKey}"></script>
<script src={{ 'jc-map.js' | asset_url }} defer="defer"></script>
`;
    }
}