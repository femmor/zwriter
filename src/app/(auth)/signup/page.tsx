"use client";

import RegisterForm from '@/components/auth/RegisterForm';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function SignUpPage() {
  const { status, data: session } = useSession();
  const router = useRouter();
  
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      router.replace('/admin');
    }
  }, [status, session, router]);
  
  if (status === 'authenticated' && session?.user) return null;
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ZWriter</h1>
          <p className="mt-2 text-gray-600">AI-powered writing assistant</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  );
}