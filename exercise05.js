// Ambil koleksi gambar Landsat 8 raw
var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1");
Map.setCenter(106.8420, -6.206, 8);
//Filter data sesuai tanggal yang diinginkan
var filteredraw = L8.filterDate('2017-01-01', '2017-12-31');
// Perintah membuat komposit bebas awan.
var composite = ee.Algorithms.Landsat.simpleComposite({
  collection: filteredraw,
  asFloat: true
});
// Tampilkan dengan kombinasi band
Map.addLayer(filteredraw, {min: 6000, max :60000, bands:['B4', 'B3', 'B2']}, 'RGB raw');
Map.addLayer(composite, {bands: ['B6', 'B5', 'B4'], max: [0.3, 0.4, 0.3]}, 'composite');
