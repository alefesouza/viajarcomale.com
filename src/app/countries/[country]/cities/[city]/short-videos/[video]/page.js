import Country, {
  generateMetadata as generateMediaMetadata,
} from '../../posts/[...media]/page';

export async function generateMetadata({ params: { country, city, video } }) {
  return generateMediaMetadata({
    params: {
      country,
      city,
      media: [city + '-short-video-' + [video]],
    },
  });
}

export default async function Video({ params: { country, city, video } }) {
  return Country({
    params: {
      country,
      city,
      media: [city + '-short-video-' + [video]],
    },
  });
}
