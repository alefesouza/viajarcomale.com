import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';
import useHost from '@/app/hooks/use-host';

customInitApp();

export async function GET() {
  const host = useHost();
  const isBR = true;
  const db = getFirestore();
  const allHashtagsRef = await db.collection('caches').doc('static_pages').collection('static_pages').doc('hashtags').get();
  const allHashtags = allHashtagsRef.data();
  let theHashtags = [];
  
  if (allHashtags.a_should_update) {
    const snapshot = await db.collection('hashtags').get();
    const hashtagDocs = [];

    snapshot.forEach((item) => {
      const data = item.data();
      hashtagDocs.push(data);
    });

    const hashtags = hashtagDocs.map(h => h.name);
    const hashtagsPt = hashtagDocs.map(h => h.name_pt || h.name);

    theHashtags = isBR ? hashtagsPt : hashtags;

    await allHashtagsRef.ref.set({
      a_should_update: false,
      hashtags_pt: hashtagsPt,
      hashtags,
    });
  }

  if (theHashtags.length === 0) {
    theHashtags = isBR ? allHashtags.hashtags_pt : allHashtags.hashtags;
  }

  db.collection('accesses').doc((new Date()).toISOString().split('T')[0]).set({
    [host('/api/hashtags')]: FieldValue.increment(1),
  }, {merge:true});

  return new Response(JSON.stringify(theHashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}
