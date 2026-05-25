'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LancamentosRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/dashboard/financeiro?tab=lancamentos');
  }, [router]);

  return <div className="flex items-center justify-center h-96">Redirecionando...</div>;
}
