import { Button } from '@/components/ui/button'
import Link from 'next/link'
import type { Metadata } from 'next'
 
export const metadata: Metadata = {
  title: '404 - Page Not Found',
  description: 'The page you are looking for does not exist.',
}
 
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 text-center">
        <h1 className="text-8xl font-bold text-gray-900">404</h1>
        <p className="text-4xl text-gray-600 mt-4">Page Not Found</p>
        <p className="text-gray-600 mt-2">The page you are looking for does not exist.</p>
        <Link href="/">
          <Button variant="outline" className="mt-6">
            Go Back Home
          </Button>
        </Link>
      </div>
    </div>
  )
}