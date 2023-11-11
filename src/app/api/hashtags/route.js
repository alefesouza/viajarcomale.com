import { getFirestore } from 'firebase-admin/firestore';
import { customInitApp } from '@/app/firebase';
import arrayShuffle from '@/app/utils/array-shuffle';
import { ITEMS_PER_PAGE } from '@/app/utils/constants';

customInitApp();

export async function GET(req) {
  const searchParams = req.nextUrl.searchParams
  const text = searchParams.get('s');
  const random = searchParams.get('random') === 'true';

  const db = getFirestore();

  let hashtags = [];

  if (random) {
    const totalHashtags = 521;

    const array = Array.from(Array(totalHashtags).keys());
    const randomArray = arrayShuffle(array).slice(0, ITEMS_PER_PAGE);

    const snapshot = await db.collection('hashtags').where('index', 'in', randomArray).get();
    
    snapshot.forEach((item) => {
      const data = item.data();
      hashtags.push({
        name: data.name,
        index: data.index,
      });
    });

    hashtags.sort((a, b) => randomArray.indexOf(a.index) - randomArray.indexOf(b.index));
    hashtags = hashtags.map(h => h.name);
  }

  if (text && text.length >= 3) {
    const end = text.replace(/.$/, c => String.fromCharCode(c.charCodeAt(0) + 1));

    const snapshot = await db.collection('hashtags').where('name', '>=', text).where('name', '<', end).limit(10).get();
    
    snapshot.forEach((item) => {
      const data = item.data();
      hashtags.push(data.name);
    });
  }

  return new Response(JSON.stringify(hashtags), {
    headers: { 'Content-Type': 'application/json' },
  });
}
