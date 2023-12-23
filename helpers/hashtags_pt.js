medias.forEach((media) => {
  media.hashtags = [
    ...media.hashtags,
    media.city.replaceAll('-', ''),
    media.country.replaceAll('-', ''),
  ];
  media.hashtags_pt = [
    ...media.hashtags,
    media.city.replaceAll('-', ''),
    media.country.replaceAll('-', ''),
  ];

  const enTags = [];
  const ptTags = [];

  media.hashtags.forEach((h) => {
    const hashtag = hashtags.find(
      (hash) =>
        hash.name == h ||
        (hash.alternate_tags && hash.alternate_tags.includes(h))
    );

    if (!hashtag) {
      // console.log(hashtag)
      return;
    }

    if (hashtag.name_pt) {
      enTags.push(hashtag.name);
      ptTags.push(hashtag.name_pt);
    }

    if (hashtag.alternate_tags && hashtag.alternate_tags.includes(h)) {
      media.hashtags = [
        ...media.hashtags.filter((c) => !hashtag.alternate_tags.includes(c)),
        hashtag.name,
      ];

      if (hashtag.name_pt) {
        enTags.push(hashtag.name);
        ptTags.push(hashtag.name_pt);
      }
    }
  });

  media.hashtags = media.hashtags.filter((h) => !ptTags.includes(h));
  media.hashtags_pt = [
    ...media.hashtags.filter((h) => !enTags.includes(h)),
    ...ptTags,
  ];

  media.hashtags = [...new Set(media.hashtags)];

  if (media.hashtags_pt) {
    media.hashtags_pt = [...new Set(media.hashtags_pt)];
  }

  console.log(media);
  theBatch.set(
    doc(db, '/countries/' + media.country + '/medias/' + media.id),
    media
  );
});

theBatch.commit();
