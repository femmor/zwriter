import { Metadata } from 'next';
import RegisterForm from '@/components/auth/RegisterForm';

export const metadata: Metadata = {
  title: 'Sign Up | ZWriter',
  description: 'Create a new account for ZWriter',
};

export default function SignUpPage() {
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