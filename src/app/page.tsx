"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/Navigation";


import { useQuery } from "@apollo/client/react";
import {gql} from '@apollo/client';
import { Post, PostsData } from "@/types/types";
import { createPreviewText, formatPostContent } from "@/utils/formatPostContent";

const POSTS = gql`
    query GetAllPosts {
        posts {
            id
            title
            content
            status
        }
    }
`;

export default function Home() {
  const { data, loading, error } = useQuery<PostsData>(POSTS);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const publishedPosts = data?.posts?.filter(post => post.status === 'PUBLISHED') ?? [];

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
            <Navigation />
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
          {publishedPosts.map((post: Post) => (
            <Card key={post.id} className="border rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 mb-4">
                {createPreviewText(formatPostContent(post.content), 150)}
              </p>
              <Button variant="outline" asChild>
                <Link href={`/posts/${post.id}`}>Read More</Link>
              </Button>
            </CardContent>
          </Card>
          ))}
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
