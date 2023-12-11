const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

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

exports.onLocationUpdated = onDocumentUpdated('/countries/{countryId}/locations/{locationId}', async (event) => {
  const newValue = event.data.after.data();

  const db = getFirestore();
  const batch = db.batch();
  const mediasSnapshot = await db.collection('countries').doc(newValue.country).collection('medias').where('locations', 'array-contains', newValue.slug).get();

  mediasSnapshot.forEach((doc) => {
    let locationData = doc.data().location_data;

    if (locationData) {
      const locationIndex = locationData.findIndex(l => l.slug === newValue.slug);

      if (locationData[locationIndex]) {
        locationData[locationIndex] = newValue;
      }
    } else {
      locationData = [newValue];
    }

    batch.update(doc.ref, {
      location_data: locationData,
    })
  });

  return batch.commit();
});
