import { FieldValue } from 'firebase-admin/firestore';
import { headers } from 'next/headers';

export default function logAccess(db, path) {
  const userAgent = headers().get('user-agent') || '';

  db.collection('accesses')
    .doc('accesses')
    .collection((new Date()).toISOString().split('T')[0])
    .doc(path.replace('https://viajarcomale', '').replaceAll('/', '-'))
    .set({
      accesses: FieldValue.increment(1),
      lastUserAgent: userAgent,
      isBot: userAgent.toLowerCase().includes('bot') || userAgent === 'node',
      lastIpAddress: headers().get('x-forwarded-for') || '',
    }, {merge:true});
}
