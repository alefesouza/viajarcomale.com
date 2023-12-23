import useHost from './hooks/use-host';

export default function robots() {
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const host = useHost();

  return {
    rules: [
      {
        userAgent: '*',
        disallow: ['/*?*sort=', '/*?*shuffle=', '/*?*indexes='],
      },
    ],
    sitemap: host('/sitemap.xml'),
  };
}
