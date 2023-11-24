import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';
import useHost from '@/app/hooks/use-host';

customInitApp();

export async function GET() {
  const host = useHost();
  const db = getFirestore();
  const allHashtagsRef = await db.collection('all_hashtags').doc('all_hashtags').get();
  const allHashtags = allHashtagsRef.data();
  let hashtags = [];
  
  if (allHashtags.a_should_update) {
    const snapshot = await db.collection('hashtags').get();

    snapshot.forEach((item) => {
      const data = item.data();
      hashtags.push(data.name);
    });

    await allHashtagsRef.ref.update({
      a_should_update: false,
      hashtags,
    });
  }

  if (hashtags.length === 0) {
    hashtags = allHashtags.hashtags;
  }

  db.collection('accesses').doc((new Date()).toISOString().split('T')[0]).set({
    [host('/api/hashtags')]: FieldValue.increment(1),
  }, {merge:true});

  return new Response(JSON.stringify(hashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}
