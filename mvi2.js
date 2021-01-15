//Map.addLayer(jawa_qca, {}, 'jawa_qc');
// Step 1. Prepare boundaries 
// Subset indonesia feature from countries.
var indonesia = lsib.filter(ee.Filter.eq('name', 'INDONESIA'));
var bound = indonesia.geometry().bounds();

// LANDSAT 8
function maskL8sr(image) {
  // Bits 3 and 5 are cloud shadow and cloud, respectively.
  var cloudShadowBitMask = (1 << 3);
  var cloudsBitMask = (1 << 5);
  // Get the pixel QA band.
  var qa = image.select('pixel_qa');
  // Both flags should be set to zero, indicating clear conditions.
  var mask = qa.bitwiseAnd(cloudShadowBitMask).eq(0)
                 .and(qa.bitwiseAnd(cloudsBitMask).eq(0));
  return image.updateMask(mask);
}
var dataset = ee.ImageCollection('LANDSAT/LC08/C01/T1_SR')
                  .filterDate('2019-01-01', '2019-12-31')
                  .map(maskL8sr);
var visParams = {
  bands: ['B4', 'B3', 'B2'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};
var composite = dataset.median().clip(java_p.geometry());
//Map.addLayer(composite, visParams, 'composite');

//SRTM Digital Elevation Data 30m
var srtm = ee.Image('USGS/SRTMGL1_003');
var elevation = srtm.select('elevation').clip(bound);

//Map.addLayer(elevation, {}, 'elevation');

var masksrtm = elevation.lte(30);

var maskedsrtm = composite.updateMask(masksrtm);

//Map.addLayer(maskedsrtm, visParams,'maskedsrtm');

var ndwi = maskedsrtm.normalizedDifference(['B5', 'B6']).rename('NDWI');

//Map.addLayer(ndwi, {min:0, max: 0.2},'ndwi');

var mvi = maskedsrtm.expression(
    '(NIR - GREEN)/(SWIR - GREEN)', {
      'NIR': maskedsrtm.select('B5'),
      'GREEN': maskedsrtm.select('B3'),
      'SWIR': maskedsrtm.select('B6')
}).rename('mvi');

//Map.addLayer(mvi, {},'mvi');
// Step 6. Thresholding. 
// Tweak these values accordingly

// Lower threshold
var lower = 4.5;

// Upper threshold
var upper = 20;

var mviina = mvi.lt(upper).add(mvi.gt(lower));

// Step 7. Masking for non mangrove

var mask = mviina.eq(2);
var maskedmvi = mviina.updateMask(mask).rename('mangrove').eq(2);

// Display the final product
Map.addLayer(maskedmvi, {palette: 'cyan'}, 'maskedmvi');

var jawa = maskedmvi.clip(jawa_qca);

//Map.addLayer(jawa, {palette: 'red'}, 'jawa');

Export.image.toDrive({ image: jawa, folder: 'jawa_', description: 'jawa_',  maxPixels: 1e11,  scale: 30,  region: java_p});
Export.image.toAsset({ image: jawa, description: 'jawa_',  maxPixels: 1e11,  scale: 30,  region: java_p});

