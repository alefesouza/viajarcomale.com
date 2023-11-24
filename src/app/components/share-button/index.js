'use client'

import { SITE_NAME } from "@/app/utils/constants";
import useI18nClient from '@/app/hooks/use-i18n-client';

export default function ShareButton({ text, url }) {
  const i18n = useI18nClient();

  const onShareClick = () => {
    if ('share' in navigator) {
      const shareData = {
        title: SITE_NAME,
        text: text || document.title,
        url: url || window.location.href,
      };

      navigator.share(shareData);
      return;
    }

    const clipBoard = navigator.clipboard;
    clipBoard.writeText((text || document.title) + ' ' + (url || window.location.href)).then(() => {
      alert(i18n('Link copied to clipboard.'));
    });
  }

  return <img src="/images/share.svg" alt="Share Button" title={i18n('Share')} width="30px" style={{ cursor: 'pointer' }} onClick={onShareClick}></img>
}
