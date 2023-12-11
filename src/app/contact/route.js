import { redirect } from 'next/navigation';
import useHost from '@/app/hooks/use-host';

export async function GET() {
  const host = useHost();
  const isBR = host().includes('viajarcomale.com.br');

  redirect('https://alefesouza.com' + (isBR ? '.br' : '') + '/contact');
}
