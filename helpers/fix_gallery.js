const files = require('./mix5.json');
const fs = require('fs');

files.forEach((item, index) => {
  item.file = '/medias/' + item.country + '/' + item.city + '/' + item.id + '-.jpg';
  delete item.media;

  item.gallery.forEach((g, i) => {
    g.file = '/medias/' + item.country + '/' + item.city + '/' + item.id + '-' + (i + 2) + (g.file_type === 'video' ? '.mp4' : '.jpg');
    delete g.description;
    if (g.type) {
     g.file_type = g.type;
    }
    delete g.link;
    delete g.type;
  })
});

fs.writeFileSync('mix6.json', JSON.stringify(files, null, 4));
