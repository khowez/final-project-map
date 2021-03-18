mapboxgl.accessToken = 'pk.eyJ1Ijoia2hvd2V6IiwiYSI6ImNrbDFkNXE0dTBsZWkydnBkMXB0MjJ2ejEifQ.TSlGl3vZSESGCLo2de5Zwg';

// add base map to the Map Container
var map = new mapboxgl.Map({
    container: 'mapContainer', // container ID
    style: 'mapbox://styles/mapbox/light-v10', // style URL
    center: [-74.006106,40.714434], // starting position [lng, lat]
    zoom: 9.8 // starting zoom
})

// // add the mapbox geocoder control
// map.addControl(
//   new MapboxGeocoder({
//     accessToken: mapboxgl.accessToken,
//     mapboxgl: mapboxgl
//   })
// );

// load the map before completing other functions
map.on('style.load', function () {

// Define a source before using it to create a new layer
  map.addSource('raceHeatDataSource', { //source name
    type: 'geojson',
    data: 'data/nyc-race-heat.geojson' //file name
  });

  // Create a layer using the source above
  map.addLayer({
    'id': 'raceHeatChloropleth', //layer name
    'type': 'fill', //fill layer
    'source': 'raceHeatDataSource', //source name
    'paint': {
      'fill-color': [
        'match',
        ['get', 'BiClassFin'], //fill color based on the category BiClassFin
        '1a', '#d1d1d1', //low heat vuln and low % black & latino
        '2a', '#e4acac', //med heat vuln and low % black & latino
        '3a', '#c85a5a', //high heat vuln and low % black & latino
        '1b', '#b0d5df', //low heat vuln and med % black & latino
        '2b', '#ad9ea5', //med heat vuln and med % black & latino
        '3b', '#985356', //high heat vuln and med % black & latino
        '1c', '#64acbe', //low heat vuln and high % black & latino
        '2c', '#627f8c', //med heat vuln and high % black & latino
        '3c', '#574249', //high heat vuln and high % black & latino
        '#ccc' //other
      ],
      'fill-outline-color': '#828282',
      'fill-opacity': 0.85
      },
    });

    // add an empty data source, which we will use to highlight the geometry the user has selected
   map.addSource('highlight-feature', {
     type: 'geojson',
     data: {
       type: 'FeatureCollection',
       features: []
     }
   })

   // add a layer for the highlighted feature
   map.addLayer({
     id: 'highlight-line',
     type: 'line',
     source: 'highlight-feature',
     paint: {
       'line-width': 3,
       'line-opacity': 0.6,
       'line-color': 'yellow',
     }
   });

   // when the user hovers over a feature of the chloropleth layer make the mouse cursor a pointer
   map.on('mouseenter', 'raceHeatChloropleth', (e) => {
     map.getCanvas().style.cursor = 'pointer'

     // query for the features under the mouse, but only in the chloropleth layer
     var features = map.queryRenderedFeatures(e.point, {
         layers: ['raceHeatChloropleth'],
     });

       //change cursor back when mouse leaves
       map.on('mouseleave', 'raceHeatChloropleth', () => {
         map.getCanvas().style.cursor = ''
       })
    })

    // add pop ups when user clicks on a features
    map.on('click', function(e) {
      // query for the features under the mouse, but only in the routes layer
      var features = map.queryRenderedFeatures(e.point, {
          layers: ['raceHeatChloropleth'],
      });

      if (features.length > 0 ) {
        var clickedFeature = features[0]
      //retrieve the desired properties from geojson file for the clicked feature
        var ntaName = clickedFeature.properties.NTAName
        var ntaHeatScore = clickedFeature.properties.HeatScore
        var ntaBlaLatPerc = clickedFeature.properties.PopNorm

        var popup = new mapboxgl.Popup({
        });

        var popupContent = `
       <div>
        <h2>${ntaName}</h2>
        <div>Heat Vulnerability Score: ${ntaHeatScore}</div>
        <div>Black and Latino Population: ${Math.round(ntaBlaLatPerc * 100)}%</div>
       </div>
     `

        popup.setLngLat(e.lngLat).setHTML(popupContent).addTo(map);

        //highlight the feature under the mouse
        map.getSource('highlight-feature').setData(clickedFeature.geometry);

      }
    })

    // 
})
