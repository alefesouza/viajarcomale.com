const { onDocumentCreated, onDocumentUpdated } = require('firebase-functions/v2/firestore');
const admin = require('firebase-admin');

exports.onMediaCreated = onDocumentCreated('/countries/{countryId}/medias/{mediaId}', async (event) => {
  const newValue = event.data.data();
  const update = {};

  const countryRef = await event.data.ref.parent.parent.get();
  const countryData = countryRef.data();

  // Set hashtags to an array
  if (typeof newValue.hashtags === 'string') {
    update.hashtags = newValue.hashtags.split('#').map(h => h.trim()).filter(h => h);
  }

  const split = event.data.ref.path.split('/');
  update.country = split[1];

  update.createdAt = admin.firestore.FieldValue.serverTimestamp();

  if (newValue.type === 'instagram') {
    update.country_index = countryData?.totals?.instagram_photos || 0;
    const cityIndex = countryData.cities.findIndex(c => c.slug === newValue.city);

    if (countryData.cities[cityIndex]) {
      update.city_index = countryData.cities[cityIndex]?.totals?.instagram_photos || 0;

      countryData.cities[cityIndex] = {
        ...countryData.cities[cityIndex],
        totals: {
          ...countryData.cities[cityIndex]?.totals,
          instagram_photos: update.city_index + 1,
        }
      }
    }

    await event.data.ref.parent.parent.update({
      totals: {
        ...countryData.totals,
        instagram_photos: update.country_index + 1,
      },
      cities: countryData.cities,
    })
  }

  return event.data.ref.update(update);
});

exports.onMediaUpdated = onDocumentUpdated('/countries/{countryId}/medias/{mediaId}', async (event) => {
  const newValue = event.data.after.data();
  const update = {};

  // Set hashtags to an array
  if (typeof newValue.hashtags === 'string') {
    update.hashtags = newValue.hashtags.split('#').map(h => h.trim()).filter(h => h);
  }

  update.updatedAt = admin.firestore.FieldValue.serverTimestamp();

  return event.data.ref.update(update);
});
