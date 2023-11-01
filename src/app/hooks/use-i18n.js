import { headers } from 'next/headers';

const IS_SERVER = typeof window === 'undefined';

const dictionaries = {
  'pt-BR': {
    '360 Photos': 'Fotos 360',
    'Add to Home Screen': 'Adicionar à tela inicial',
    'manifest.json': 'manifest-pt.json',
    'Links to Viajar com Alê social networks.': 'Links das redes sociais do Viajar com Alê.',
    'en': 'pt',
    'en_US': 'pt_BR',
  }
};

export default function useI18n() {
  const headersList = headers();

  const host = IS_SERVER ? headersList.get('x-forwarded-host') && headersList.get('x-forwarded-host') : window.location.host;
  const isBR = host === 'viajarcomale.com.br';
  
  return (string) => {
    return isBR && dictionaries['pt-BR'][string] ? dictionaries['pt-BR'][string] : string
  };
};
