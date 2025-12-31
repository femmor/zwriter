import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSession } from "@/lib/auth";

export default async function Home() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                <Link href="/">ZWriter</Link>
              </h1>
              <p className="text-gray-600">AI-powered writing assistant</p>
            </div>
            <nav className="flex gap-4">
              {session ? (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/admin">Dashboard</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/admin/editor">Write</Link>
                  </Button>
                </>
              ) : (
                <Button asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
              )}
            </nav>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Latest Blog Posts
          </h2>
          <p className="text-xl text-gray-600">
            Discover insights and stories powered by AI
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to ZWriter</CardTitle>
              <CardDescription>Your journey starts here</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                ZWriter is an AI-powered writing assistant designed to help you create amazing content.
              </p>
              <Button variant="outline" asChild>
                <Link href="/signin">Get Started</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Writing Features</CardTitle>
              <CardDescription>Discover what&apos;s possible</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore our powerful AI features that help you write better, faster, and more creatively.
              </p>
              <Button variant="outline" asChild>
                <Link href="/signin">Learn More</Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Getting Started Guide</CardTitle>
              <CardDescription>Quick start tutorial</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Follow our step-by-step guide to make the most of ZWriter&apos;s features.
              </p>
              <Button variant="outline" asChild>
                <Link href="/signin">Start Tutorial</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600">
            No posts published yet. 
            <Link href="/signin" className="text-blue-600 hover:underline ml-1">
              Sign in to start writing!
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
