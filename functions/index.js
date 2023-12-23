const {
  onDocumentCreated,
  onDocumentUpdated,
} = require('firebase-functions/v2/firestore');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

admin.initializeApp();

exports.onMediaCreated = onDocumentCreated(
  '/countries/{countryId}/medias/{mediaId}',
  async (event) => {
    const newValue = event.data.data();
    const update = {};

    // Set hashtags to an array
    if (typeof newValue.hashtags === 'string') {
      update.hashtags = newValue.hashtags
        .split('#')
        .map((h) => h.trim())
        .filter((h) => h);
    }

    const split = event.data.ref.path.split('/');
    update.country = split[1];

    update.createdAt = admin.firestore.FieldValue.serverTimestamp();

    return event.data.ref.update(update);
  }
);

exports.onMediaUpdated = onDocumentUpdated(
  '/countries/{countryId}/medias/{mediaId}',
  async (event) => {
    const oldValue = event.data.before.data();
    const newValue = event.data.after.data();
    const update = {};

    // Set hashtags to an array
    if (typeof newValue.hashtags === 'string') {
      update.hashtags = newValue.hashtags
        .split('#')
        .map((h) => h.trim())
        .filter((h) => h);
    }

    if (
      newValue.locations &&
      JSON.stringify(oldValue.locations) !== JSON.stringify(newValue.locations)
    ) {
      const db = getFirestore();
      const locationsSnapshot = await db
        .collection('countries')
        .doc(newValue.country)
        .collection('locations')
        .where('slug', 'in', newValue.locations)
        .get();

      const locations = [];
      locationsSnapshot.forEach((doc) => {
        const data = doc.data();

        locations.push({
          name: data.name,
          slug: data.slug,
        });

        if (!oldValue.locations || !oldValue.locations.includes(data.slug)) {
          let key = '';

          switch (newValue.type) {
            case 'instagram':
              key = 'posts';
              break;
            case 'instagram-story':
              key = 'stories';
              break;
            case '360photo':
              key = 'photos360';
              break;
            case 'youtube':
              key = 'videos';
              break;
            case 'short-video':
              key = 'shorts';
              break;
          }

          doc.ref.update({
            totals: {
              ...data.totals,
              [key]: (data.totals[key] || 0) + 1,
            },
          });
        }
      });

      update.location_data = locations;
    }

    return event.data.after.ref.update(update);
  }
);

exports.onLocationUpdated = onDocumentUpdated(
  '/countries/{countryId}/locations/{locationId}',
  async (event) => {
    const oldValue = event.data.before.data();
    const newValue = event.data.after.data();

    const db = getFirestore();
    const batch = db.batch();

    if (oldValue.name !== newValue.name) {
      const mediasSnapshot = await db
        .collection('countries')
        .doc(newValue.country)
        .collection('medias')
        .where('locations', 'array-contains', newValue.slug)
        .get();

      mediasSnapshot.forEach((doc) => {
        let locationData = doc.data().location_data;

        if (locationData) {
          const locationIndex = locationData.findIndex(
            (l) => l.slug === newValue.slug
          );

          if (locationData[locationIndex]) {
            locationData[locationIndex] = newValue;
          }
        } else {
          locationData = [newValue];
        }

        batch.update(doc.ref, {
          location_data: locationData.map((l) => ({
            name: l.name,
            slug: l.slug,
          })),
        });
      });
    }

    return batch.commit();
  }
);
