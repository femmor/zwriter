import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ZWriter</h1>
          <p className="mt-2 text-gray-600">AI-powered writing assistant</p>
        </div>
        
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-red-600">Access Denied</CardTitle>
            <CardDescription>
              You don&apos;t have permission to access this resource.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-gray-600">
              Please contact an administrator if you need access to the admin panel.
            </p>
            <div className="space-y-2">
              <Button asChild className="w-full">
                <Link href="/">
                  Go Home
                </Link>
              </Button>
              <Button variant="outline" asChild className="w-full">
                <Link href="/signin">
                  Sign In with Different Account
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}