// Step 1. Prepare boundaries 
var bound = kalimantan_p.geometry().bounds();

/**
 * Function to mask clouds based on the pixel_qa band of Landsat SR data.
 * @param {ee.Image} image Input Landsat SR image
 * @return {ee.Image} Cloudmasked Landsat image
 */
var cloudMaskL457 = function(image) {
  var qa = image.select('pixel_qa');
  // If the cloud bit (5) is set and the cloud confidence (7) is high
  // or the cloud shadow bit is set (3), then it's a bad pixel.
  var cloud = qa.bitwiseAnd(1 << 5)
                  .and(qa.bitwiseAnd(1 << 7))
                  .or(qa.bitwiseAnd(1 << 3));
  // Remove edge pixels that don't occur in all bands
  var mask2 = image.mask().reduce(ee.Reducer.min());
  return image.updateMask(cloud.not()).updateMask(mask2);
};

var dataset = ee.ImageCollection('LANDSAT/LE07/C01/T1_SR')
                  .filterDate('2013-01-01', '2013-12-31')
                  .map(cloudMaskL457);

var visParams = {
  bands: ['B3', 'B2', 'B1'],
  min: 0,
  max: 3000,
  gamma: 1.4,
};
var composite = dataset.median().clip(kalimantan_p.geometry());
//Map.addLayer(composite, visParams, 'composite');

//SRTM Digital Elevation Data 30m
var srtm = ee.Image('USGS/SRTMGL1_003');
var elevation = srtm.select('elevation').clip(bound);

//Map.addLayer(elevation, {}, 'elevation');

var masksrtm = elevation.lte(30);

var maskedsrtm = composite.updateMask(masksrtm);

//Map.addLayer(maskedsrtm, visParams,'maskedsrtm');

var ndwi = maskedsrtm.normalizedDifference(['B4', 'B5']).rename('NDWI');

//Map.addLayer(ndwi, {min:0, max: 0.2},'ndwi');

var mvi = maskedsrtm.expression(
    '(NIR - GREEN)/(SWIR - GREEN)', {
      'NIR': maskedsrtm.select('B4'),
      'GREEN': maskedsrtm.select('B2'),
      'SWIR': maskedsrtm.select('B5')
}).rename('mvi');

Map.addLayer(mvi, {},'mvi');

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
var kalimantan = maskedmvi.clip(kalimantan_qc);
Map.addLayer(kalimantan, {palette: 'cyan'}, 'kalimantan');

Export.image.toDrive({ image: kalimantan, folder: 'kalimantan_', description: 'kalimantan_',  maxPixels: 1e11,  scale: 30,  region: kalimantan_p});
Export.image.toAsset({ image: kalimantan, description: 'kalimantan_',  maxPixels: 1e11,  scale: 30,  region: kalimantan_p});
