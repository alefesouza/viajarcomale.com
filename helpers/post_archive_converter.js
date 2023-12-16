// fixedLat = [...$0.children].map((item) => ({ files: [...item.querySelectorAll('img,video')].map(f => f.src), date: item.querySelector('._3-94').textContent, latitude: [...item.querySelectorAll('div')].find(el => el.textContent == 'Latitude')?.nextElementSibling?.textContent, longitude: [...item.querySelectorAll('div')].find(el => el.textContent == 'Longitude')?.nextElementSibling?.textContent, description: item.querySelector('._2pim') && item.querySelector('._2pim').textContent }))

const items = require('./items.json');
const fs = require('fs');
const { getVideoDurationInSeconds } = require("get-video-duration");
const sizeOf = require("image-size");
const sharp = require("sharp");
const { translate } = require('bing-translate-api');
const mt = require("media-thumbnail");
const getDimensions = require("get-video-dimensions");

const instagramPosts = [
  'https://www.instagram.com/p/C0D_rjuNFp6/',
  'https://www.instagram.com/p/C0D80lrtCTf/',
  'https://www.instagram.com/p/C0D8EyPtPNA/',
  'https://www.instagram.com/p/C0D67kGNP6m/',
  'https://www.instagram.com/p/C0D52g3NOxc/',
  'https://www.instagram.com/p/C0D5AD1N_BY/',
  'https://www.instagram.com/p/C0D31vAN-mc/',
  'https://www.instagram.com/p/Cz599-VNtba/',
  'https://www.instagram.com/p/Cz4apgiKCZb/',
  'https://www.instagram.com/p/Cz4aRy9KBaW/',
  'https://www.instagram.com/p/Cz4VyTzKV8j/',
  'https://www.instagram.com/p/Czc9MNbNAwn/',
  'https://www.instagram.com/p/CzcE7nWPAnp/',
  'https://www.instagram.com/p/CzcCgrfPdd6/',
  'https://www.instagram.com/p/CzcCF9Wv25d/',
  'https://www.instagram.com/p/CzcBmhpP0Jg/',
  'https://www.instagram.com/p/CzcArmbv_GU/',
  'https://www.instagram.com/p/Czb-GNIvo3s/',
  'https://www.instagram.com/p/Czb8Qe4vVBo/',
]

const city = 'seoul';
const country = 'south-korea';
const photosFolder = '/Users/alefesouza/Projects/viajarcomale.com/photos/korea';
const destFolder = '/Users/alefesouza/Projects/viajarcomale.com/photos/to_send';

items.reverse();
instagramPosts.reverse();

const main = async () => {
  let i = 0;

  for (const item of items) {
    const id = instagramPosts[i].replace('https://www.instagram.com/p/', 'media-').slice(0, -1);

    item.files = item.files.map(f => {
      const split = f.split('/');
      const file = split[split.length - 1];

      return file;
    })

    item.cityData = {
      name: 'Seoul',
      name_pt: 'Seul',
      end: '2022-10-20',
    }

    item.countryData = {
      name: 'South Korea',
    }

    item.original_file = item.files[0];
    item.id = id;
    item.order = 55 + i;
    item.city = city;
    item.country = country;
    item.city_index = 55 + i;
    item.country_index = 55 + i;
    item.city_location_id = 1;
    item.date = item.cityData.end + ' 12:00:00';
    item.link = instagramPosts[i];
    item.type = 'instagram';

    const isVideo = !item.original_file.includes('.jpg');

    const fileName = `${item.id}.jpg`;
    item.file = `/medias/${country}/${city}/${fileName}`;

    if (!isVideo) {
      const fileToSend = destFolder + '/' + fileName;
      fs.copyFileSync(photosFolder + '/' + item.original_file, fileToSend);

      const dimensions = sizeOf(fileToSend);

      item.width = dimensions.width;
      item.height = dimensions.height;

      sharp(fileToSend)
        .rotate()
        .resize(500)
        .jpeg({ mozjpeg: true })
        .toFile(destFolder + '/500/' + fileName, (err, info) => {
          // console.log(err);
        });
    } else {
      console.log('Video: ' + item.id);
    }

    if (item.files.length > 1) {
      const promises = item.files.slice((isVideo ? 0 : 1), item.files.length).map(async (file, i) => {
        const isVideo = !file.includes('.jpg');
        const fileName = `${item.id}-${i + 2}${(isVideo ? '.mp4' : '.jpg')}`;
        const fileToSend = destFolder + '/' + fileName;
        fs.copyFileSync(photosFolder + '/' + file, fileToSend);

        const data = {
          file: `/medias/${country}/${city}/${fileName}`,
          file_type: isVideo ? 'video' : 'image',
        };

        if (isVideo) {
          const duration = await getVideoDurationInSeconds(fileToSend);
          data.duration = duration;

          const dimensions = await getDimensions(fileToSend);
          await mt.forVideo(fileToSend, fileToSend.replace(".mp4", "-thumb.png"), {
            width: dimensions.width,
          });
        }

        sharp(fileToSend.replace(".mp4", "-thumb.png"))
          .rotate()
          .resize(500)
          .jpeg({ mozjpeg: true })
          .toFile(destFolder + '/500/' + fileName.replace(".mp4", "-thumb.png"), (err, info) => {
            // console.log(err);
          });

        return data;
      });

      item.gallery = await Promise.all(promises);
    }

    const [ theDescription, hashtags ] = item.description.split('\n.\n.\n.\n');
    item.description_pt = theDescription;
    item.hashtags = hashtags.split(' #');

    const description = await translate(item.description_pt, 'pt', 'en');

    item.description = description.translation;
    console.log(item.description)

    delete item.files;

    i++;
  }

  fs.writeFileSync('medias.json', JSON.stringify(items, null, 4))
}

main();

