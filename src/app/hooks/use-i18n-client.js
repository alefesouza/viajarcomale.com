import langs from '../utils/langs';

export default function useI18nClient() {
  const isBR = typeof window !== 'undefined' && window.location.host === 'viajarcomale.com.br';
  
  return (string) => {
    return isBR && langs['pt-BR'][string] ? langs['pt-BR'][string] : string
  };
};
