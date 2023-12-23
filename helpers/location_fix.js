medias.forEach((media) => {
  const validLocations = [];

  media.hashtags.forEach((h) => {
    const hLocation = locations
      .filter((l) => l.country == 'south-korea')
      .find((l) => l.slug.replaceAll('-', '') == h);

    if (hLocation) {
      validLocations.push(hLocation);
    }
  });

  theBatch.update(doc(db, '/countries/south-korea/medias/' + media.id), {
    locations: validLocations.map((l) => l.slug),
    location_data: validLocations,
  });
});

theBatch.commit();
