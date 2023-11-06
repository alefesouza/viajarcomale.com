const galleries = []

var fs = require('fs');

const items = require('./files.json');

for (item of items.filter(i => i.hashtags.includes('seoul') && !i.hashtags.includes('saopaulo'))) {
    const gallery = galleries.find(g => g.find(i => {
        console.log(i)
        return i.file.includes(item.image.replace('.jpg', ''))
    })) || [];
    const images = gallery ? gallery.map(e => e.file) : [];
    item.gallery = gallery.filter(g => g.image !== item.image).map((g, i) => ({...g, file: '/photos/south-korea/seoul/' + item.id + '-' + (i + 1) + (g.file.includes('.jpg') ? '.jpg' : '.mp4')}));
    
    images.forEach((image, i) => {
        let id = item.id;

        if (i !== 0) {
            id = id + '-' + (i + 1);
        }

        fs.rename(image, 'south-korea/seoul/' + id + (image.includes('.jpg') ? '.jpg' : '.mp4'), function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });
    });
}

fs.writeFileSync('./files.json', JSON.stringify(items))

// fs.readdirSync('.').forEach(file => {
//     if (file.includes('.mp4.mp4')) {
//         console.log(file)
//     fs.rename(file, file.replace('.mp4', ''), function(err) {
//         if ( err ) console.log('ERROR: ' + err);
//     });
// }
//   });
