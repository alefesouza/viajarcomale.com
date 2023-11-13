const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

exports.onMediaCreated = onDocumentCreated('/countries/{countryId}/medias/{mediaId}', async (event) => {
  const newValue = event.data.data();
  const update = {};

  // Set hashtags to an array
  if (typeof newValue.hashtags === 'string') {
    update.hashtags = newValue.hashtags.split('#').map(h => h.trim()).filter(h => h);
  }

  const split = event.data.ref.path.split('/');
  update.country = split[1];

  update.createdAt = admin.firestore.FieldValue.serverTimestamp();

  return event.data.ref.update(update);
});

exports.onMediaUpdated = onDocumentUpdated('/countries/{countryId}/medias/{mediaId}', async (event) => {
  const newValue = event.data.after.data();
  const update = {};

  // Set hashtags to an array
  if (typeof newValue.hashtags === 'string') {
    update.hashtags = newValue.hashtags.split('#').map(h => h.trim()).filter(h => h);
  }

  return event.data.after.ref.update(update);
});
