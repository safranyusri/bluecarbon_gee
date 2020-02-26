// Ambil data SRTM
var srtm = ee.Image('USGS/SRTMGL1_003');

// Zoom ke Puncak Jaya
Map.setCenter(137.930, -4.444, 9);

//Tampilkan gambar
Map.addLayer(srtm);

// Pilih band ketinggian 
var elevation = srtm.select('elevation');

// Tampilkan gambar dengan pilihan rentang dan nama
Map.addLayer(elevation,{min: 0, max: 4000},'elevation');
