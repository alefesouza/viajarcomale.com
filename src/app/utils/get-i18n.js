import 'server-only'

const dictionaries = {
  'pt-BR': {
    '360 Photos': 'Fotos 360',
    'Add to Home Screen': 'Adicionar à tela inicial',
    'manifest.json': 'manifest-pt.json',
    'Links to Viajar com Alê social networks.': 'Links das redes sociais do Viajar com Alê.',
    'en': 'pt',
    'en_US': 'pt_BR',
  }
}

export const getI18n = (headers, string) => {
  const isBR = headers.get('x-forwarded-host') && headers.get('x-forwarded-host') === 'viajarcomale.com.br';
  
  return isBR && dictionaries['pt-BR'][string] ? dictionaries['pt-BR'][string] : string;
};
