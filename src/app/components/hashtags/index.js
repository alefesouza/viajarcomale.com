import Link from 'next/link';
import styles from './index.module.css';

const stringToSlug = (str) => {
  str = str.replace(/^\s+|\s+$/g, ''); // trim
  str = str.toLowerCase();

  // remove accents, swap ñ for n, etc
  var from = 'àáäâãèéëêìíïîòóöôõùúüûñç·/_,:;';
  var to = 'aaaaaeeeeiiiiooooõuuuunc------';
  for (var i = 0, l = from.length; i < l; i++) {
    str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
  }

  str = str
    .replace(/[^a-z0-9 -]/g, '') // remove invalid chars
    .replace(/\s+/g, '-') // collapse whitespace and replace by -
    .replace(/-+/g, '-'); // collapse dashes

  return str;
};

export default function Hashtags({ item }) {
  const isBR = true;
  const city = stringToSlug(
    isBR && item.cityData.name_pt ? item.cityData.name_pt : item.cityData.name
  ).replaceAll('-', '');

  const theCountry = stringToSlug(
    isBR && item.countryData.name_pt
      ? item.countryData.name_pt
      : item.countryData.name
  ).replaceAll('-', '');

  const hashtags = isBR && item.hashtags_pt ? item.hashtags_pt : item.hashtags;

  return (
    <div className={styles.item_hashtags}>
      Hashtags:{' '}
      <span itemProp="keywords">
        {hashtags.reverse().map((h) => {
          let link = `/hashtags/${h}`;

          if (h == theCountry) {
            link = `/countries/${item.countryData.slug}`;
          }

          if (h == city) {
            link = `/countries/${item.countryData.slug}/cities/${item.cityData.slug}`;
          }

          return (
            <>
              <Link href={link} key={h} prefetch={false}>
                #{h}
              </Link>{' '}
            </>
          );
        })}
      </span>
    </div>
  );
}
