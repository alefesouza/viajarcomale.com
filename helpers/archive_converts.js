// fixedLat = [...$0.children].map((item) => ({ file: (item.querySelector('img')||item.querySelector('video')).src, date: item.querySelector('._3-94').textContent, latitude: [...item.querySelectorAll('div')].find(el => el.textContent == 'Latitude')?.nextElementSibling?.textContent, longitude: [...item.querySelectorAll('div')].find(el => el.textContent == 'Longitude')?.nextElementSibling?.textContent }))

// const stories = require('./the-stories.json')
// const fixed = require('./fixedLat.json')

// const fs = require('fs');

// stories.forEach(c => {
//   const lt = fixed.find(f => f.file.includes(c.file.split('.')[0]))
// if (!lt) {return};
//   c.latitude = lt.latitude;
//   c.longitude = lt.longitude;
//   console.log(c)
//   delete c.latitute;
// })

// fs.writeFileSync('./test.json', JSON.stringify(stories, null, 4))

// const stories = require('./the-stories.json')

// const fs = require('fs');

const fs = require('fs');
const stories = require('./the-stories.json')
const sizeOf = require('image-size')
const sharp = require('sharp');
const mt = require('media-thumbnail')

Date.prototype.addHours = function(h) {
  this.setTime(this.getTime() + (h*60*60*1000));
  return this;
}

function string_to_slug (str) {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
  var to   = "aaaaeeeeiiiioooouuuunc------";
  for (var i=0, l=from.length ; i<l ; i++) {
      str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
      .replace(/\s+/g, '-') // collapse whitespace and replace by -
      .replace(/-+/g, '-'); // collapse dashes

  return str;
}

const theHighlights = {};
stories.reverse().forEach((item) => {
  if (!fs.existsSync('./to_send/' + item.country)) {
    fs.mkdirSync('./to_send/' + item.country)
  }

  if (!fs.existsSync('./to_send/' + item.country + '/' + item.city)) {
    fs.mkdirSync('./to_send/' + item.country + '/' + item.city)
  }

  if (!fs.existsSync('./to_send/500/' + item.country)) {
    fs.mkdirSync('./to_send/500/' + item.country)
  }

  if (!fs.existsSync('./to_send/500/' + item.country + '/' + item.city)) {
    fs.mkdirSync('./to_send/500/' + item.country + '/' + item.city)
  }

  if (!theHighlights[item.highlight]) {
      theHighlights[item.highlight] = 0;
  }

  theHighlights[item.highlight]++;

  item.id = item.highlight.replace('media-highlight', 'story') + '-' + theHighlights[item.highlight];
  item.order = parseInt(theHighlights[item.highlight]);
  item.mode = "portrait";

  const date = new Date(item.date);
  date.addHours(2);
  item.date = date.toISOString().replace('T', ' ').substring(0, 19)

  let file = './' + item.country + '/' + item.city + '/' + item.file;

  if (!fs.existsSync(file)) {
    file = './used/' + item.file;
  }

  if (item.file.includes('.mp4')) {
    item.width = 720;
    item.height = 1280;
  } else {
    const dimensions = sizeOf(file);

    item.width = dimensions.width;
    item.height = dimensions.height;
  }
  item.mode = 'portrait'

  const fileToSend = './to_send/' + item.country + '/' + item.city + '/' + item.id + (item.file.includes('.mp4') ? '.mp4' : '.jpg');

  fs.copyFileSync(file, fileToSend)

  if (item.file.includes('.mp4')) {
    mt.forVideo(
      fileToSend,
      fileToSend.replace('.mp4', '-thumb.png'), {
        width: 720
    })
    .then(() => console.log('Success'), err => console.error(err)) 
  } else {
    sharp(fileToSend)
      .rotate()
      .resize(500)
      .jpeg({ mozjpeg: true })
      .toFile(fileToSend.replace('/to_send/', '/to_send/500/'), (err, info) => { console.log(err) });
  }

  item.file = '/stories/' + item.country + '/' + item.city + '/' + item.id + (item.file.includes('.mp4') ? '.mp4' : '.jpg');
  
  if (item.location) {
    item.location_data = {
      name: item.location,
      slug: string_to_slug(item.location),
      latitude: item.latitude,
      longitude: item.longitude,
      country: item.country,
      city: item.city,
    }

    if (item.alternative_names) {
      item.location_data.alternative_names = item.alternative_names;
    }

    item.location = item.location_data.slug;

    delete item.latitude;
    delete item.longitude;
    delete item.alternative_names;
  }
});

fs.writeFileSync('./the-result.json', JSON.stringify(stories, null, 4))
fs.writeFileSync('./the-locations.json', JSON.stringify(stories.filter(c => c.location_data).map(c => c.location_data), null, 4))
