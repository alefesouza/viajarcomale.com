import { getStorage } from 'firebase-admin/storage';
import path from 'path';
import gm from 'gm';

export default async function imageResize(theFile, name, { width, height, x, y }, downloaded = false) {
  const imageMagick = gm.subClass({imageMagick: true});
  const storage = getStorage();
  const bucket = storage.bucket('files.viajarcomale.com');
  const fileName = theFile.substring(1);
  const file = bucket.file(fileName);
  const baseFile = path.parse(file.name).base;

  const tempLocalPath = `/tmp/${baseFile}`;

  if (!downloaded) {
    await file.download({destination: tempLocalPath});
  }

  const resultPath = tempLocalPath.replace('.jpg', '-' + name + '.jpg').replace('.png', '-' + name + '.png');

  await new Promise((resolve, reject) => {
    imageMagick(tempLocalPath)
      .crop(width, height, x, y)
      .write(resultPath, function (err) {
        if (err) {
          console.log(err);
          reject();
          return;
        }

        resolve();
      });
  })

  await bucket.upload(resultPath, {destination: 'resize/' + name + '/' + theFile.replace('.mp4', '-thumb.png').substring(1)});
}
