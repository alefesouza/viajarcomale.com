import { headers } from 'next/headers';
import langs from '../utils/langs';

export default function useI18n() {
  const headersList = headers();

  const host = headersList.get('x-forwarded-host') && headersList.get('x-forwarded-host');
  const isBR = host === 'viajarcomale.com.br';
  
  return (string) => {
    return isBR && langs['pt-BR'][string] ? langs['pt-BR'][string] : string
  };
};
