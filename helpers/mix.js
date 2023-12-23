const instagram = require('./instagram.json');
const files = require('./files.json');
const fs = require('fs');

instagram.forEach((item, index) => {
  item.gallery = files.find((c) => c[0].description == item.description);
  if (!item.gallery) {
    console.log(item);
  }
});

fs.writeFileSync('mix.json', JSON.stringify(instagram, null, 4));
