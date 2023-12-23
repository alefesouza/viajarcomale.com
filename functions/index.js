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
      !newValue.location_slug_update &&
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

        if (
          newValue.location_data &&
          newValue.location_data.find((l) => l.slug === data.slug)
        ) {
          return;
        }

        locations.push({
          name: data.name,
          name_pt: data.name_pt || null,
          alternative_names: data.alternative_names || [],
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

    if (newValue.location_slug_update) {
      update.location_slug_update = FieldValue.delete();
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

    if (oldValue.slug !== newValue.slug) {
      batch.set(
        db.doc(`/countries/${newValue.country}/locations/${newValue.slug}`),
        newValue
      );
    }

    if (
      oldValue.name !== newValue.name ||
      oldValue.name_pt !== newValue.name_pt ||
      oldValue.slug !== newValue.slug ||
      JSON.stringify(oldValue.alternative_names) !==
        JSON.stringify(newValue.alternative_names)
    ) {
      const mediasSnapshot = await db
        .collection('countries')
        .doc(newValue.country)
        .collection('medias')
        .where('locations', 'array-contains', oldValue.slug)
        .get();

      mediasSnapshot.forEach((doc) => {
        let locationData = doc.data().location_data;
        let locations = doc.data().locations;

        if (locationData) {
          const locationDataIndex = locationData.findIndex(
            (l) => l.slug === oldValue.slug
          );

          if (locationData[locationDataIndex]) {
            locationData[locationDataIndex] = newValue;
          }

          if (newValue.slug !== oldValue.slug) {
            const locationIndex = locations.findIndex(
              (l) => l === oldValue.slug
            );

            if (locationData[locationIndex]) {
              locations[locationIndex] = newValue.slug;
            }
          }
        } else {
          locationData = [newValue];
        }

        const mediaUpdate = {
          locations,
          location_data: locationData.map((l) => ({
            name: l.name,
            name_pt: l.name_pt || null,
            slug: l.slug,
            alternative_names: l.alternative_names || [],
          })),
        };

        if (oldValue.slug !== newValue.slug) {
          mediaUpdate.location_slug_update = true;
        }

        batch.update(doc.ref, mediaUpdate);
      });
    }

    return batch.commit();
  }
);
