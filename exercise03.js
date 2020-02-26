// Ambil koleksi gambar Landsat 8 
var L8 = ee.ImageCollection("LANDSAT/LC08/C01/T1_TOA");

// Zoom ke Jakarta
Map.setCenter(106.8420, -6.206, 8);

//Filter data sesuai tanggal yang diinginkan
var filtered = L8.filterDate('2017-01-01', '2017-12-31');

//Tampilkan dalam peta
Map.addLayer(filtered);

// Tampilkan dengan kombinasi band
Map.addLayer(filtered, {min: 0, max :0.3, bands:['B4', 'B3', 'B2']}, 'RGB');
