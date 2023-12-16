
let newHashtags = [];
medias.forEach((media) => {

  media.hashtags.forEach((h) => {
    const hashtag = hashtags.find(hash => hash.name == h || hash.name_pt == h || (hash.alternate_tags && hash.alternate_tags.includes(h)));

    if (!hashtag) {
      newHashtags.push(h)
      return;
    }
  });
});

  newHashtags = [...new Set(newHashtags)];
// console.log(newHashtags)

newHashtags.forEach((h) => {
  const total = medias.filter(m => m.hashtags.includes(h)).length;

  theBatch.set(doc(db, '/hashtags/' + h), {
    name: h,
    total,
    totals: {
      posts: total,
    }
  })
});

theBatch.commit();
