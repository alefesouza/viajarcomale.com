import Link from 'next/link';
import styles from './index.module.css';

export default function Hashtags({ hashtags }) {
  return <div className={ styles.item_hashtags }>
    Hashtags: <span itemProp="keywords">{hashtags.reverse().map(h => <><Link href={`/hashtags/${h}`} key={h} prefetch={false}>#{h}</Link> </>)}</span>
  </div>;
}
