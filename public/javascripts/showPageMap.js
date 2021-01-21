mapboxgl.accessToken = mapToken;  // defined in show.ejs
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
    center: jazzbar.geometry.coordinates, // starting position [lng, lat]
    zoom: 13 // starting zoom
});

new mapboxgl.Marker()
    .setLngLat(jazzbar.geometry.coordinates)
    .setPopup(
        new mapboxgl.Popup({offset:25})
        .setHTML(
            `<h3>${jazzbar.title}</h3>
            <p>${jazzbar.location}</p>`
        )
    )
    .addTo(map);