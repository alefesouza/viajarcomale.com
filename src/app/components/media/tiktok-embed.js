import styles from './tiktok-embed.module.css';

export default function TikTokEmbed({ media }) {
  const split = media.tiktok_link.split('/');
  const id = split[split.length - 1];

  return (
    <div>
      <blockquote
        className={['tiktok-embed', styles.tiktok_embed].join(' ')}
        cite={'https://www.tiktok.com/@viajarcomale/video/' + id}
        data-video-id={id}
      >
        {' '}
        <section></section>
      </blockquote>
    </div>
  );
}
