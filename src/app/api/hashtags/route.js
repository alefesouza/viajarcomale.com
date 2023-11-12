import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';

customInitApp();

export async function GET() {
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

  return new Response(JSON.stringify(hashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}
