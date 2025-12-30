"use client";

import { useQuery } from "@apollo/client/react";
import {gql} from '@apollo/client';

// Define the types for our GraphQL response
interface Post {
    id: string;
    title: string;
    status: string;
}

interface PostsData {
    posts: Post[];
}

const POSTS = gql`
    query GetPosts {
        posts {
            id
            title
            status
        }
    }
`;

export default function PostsPage() {
    const { data, loading, error } = useQuery<PostsData>(POSTS);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;

    return (
        <div>
            <h1 className='text-xl mb-4'>Posts</h1>
            {data?.posts?.map((post: Post) => (
                <div key={post.id} className="border-b p-2 rounded">
                    <h2 className="text-lg font-semibold">{post.title}</h2>
                    <p>Status: {post.status}</p>
                </div>
            ))}
        </div>
    );  
}