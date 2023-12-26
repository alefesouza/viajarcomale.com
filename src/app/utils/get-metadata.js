import useI18n from '@/app/hooks/use-i18n';
import { SITE_NAME } from './constants';

export default function getMetadata(media, isBR, position) {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const i18n = useI18n();

  const locationCity = [
    isBR && media.cityData.name_pt
      ? media.cityData.name_pt
      : media.cityData.name,
    i18n(media.countryData.name),
  ].join(' - ');
  const locationTitle =
    media.location_data &&
    media.location_data
      .slice(0, 2)
      .map(
        (c) =>
          ((isBR && c.name_pt ? c.name_pt : c.name) || '') +
          (c.alternative_names
            ? ' (' + c.alternative_names.join(', ') + ')'
            : '')
      )
      .join(', ') + (media.location_data.length > 2 ? '...' : '');
  const locationDescription =
    media.location_data &&
    media.location_data
      .map(
        (c) =>
          (isBR && c.name_pt ? c.name_pt : c.name) +
          (c.alternative_names
            ? ' (' + c.alternative_names.join(', ') + ')'
            : '')
      )
      .join(', ');
  const keywords =
    isBR && media.hashtags_pt ? media.hashtags_pt : media.hashtags;
  const description =
    (isBR && media.description_pt ? media.description_pt : media.description) ||
    '';
  const shortDescription =
    description.split(' ').length > 10
      ? description.split(' ').slice(0, 10).join(' ') + '…'
      : description;

  const title = [
    shortDescription,
    media.img_index || position ? 'Item ' + (media.img_index || position) : '',
    locationTitle,
    locationCity,
    SITE_NAME,
  ]
    .filter((c) => c)
    .join(' - ');

  const theDescription =
    [
      description,
      media.img_index ? 'Item ' + media.img_index : null,
      locationDescription
        ? i18n(media.location_data.length > 1 ? 'Locations' : 'Location') +
          ': ' +
          locationDescription
        : '',
    ]
      .filter((c) => c)
      .join(' - ') ||
    i18n('City') +
      ': ' +
      (isBR && media.cityData.name_pt
        ? media.cityData.name_pt
        : media.cityData.name);

  return {
    title,
    description: theDescription,
    keywords,
  };
}
