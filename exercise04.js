// Ambil koleksi gambar Landsat 8 raw
var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1");
// Ambil koleksi gambar Landsat 8 TOA
var L8toa = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");
// Ambil koleksi gambar Landsat 8 TOA
var L8sr = ee.ImageCollection("LANDSAT/LC08/C01/T1_SR");
Map.setCenter(106.8420, -6.206, 8);
//Filter data sesuai tanggal yang diinginkan
var filteredraw = L8.filterDate('2017-01-01', '2017-12-31');
var filteredtoa = L8toa.filterDate('2017-01-01', '2017-12-31');
var filteredsr = L8sr.filterDate('2017-01-01', '2017-12-31');
// Tampilkan dengan kombinasi band
Map.addLayer(filteredraw, {min: 6000, max :60000, bands:['B4', 'B3', 'B2']}, 'RGB raw');
Map.addLayer(filteredtoa, {min: 0, max :0.3, bands:['B4', 'B3', 'B2']}, 'RGB toa');
Map.addLayer(filteredsr, {min: 0, max :12000, bands:['B4', 'B3', 'B2']}, 'RGB sr');
