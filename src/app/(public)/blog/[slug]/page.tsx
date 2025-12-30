"use client";

import {gql} from '@apollo/client';
import { useQuery } from "@apollo/client/react";

interface Post {
    id: string;
    title: string;
    content: string;
    status: string;
}

interface PostData {
    post: Post | null;
}

const POST_BY_SLUG = gql`
    query PostBySlug($slug: String!) {
        post(slug: $slug) {
            id
            title
            content
            status
        }
    }
`;

export default function BlogPost({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const { data, loading, error } = useQuery<PostData>(POST_BY_SLUG, {
        variables: { slug },
    });

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error.message}</p>;
    if (!data?.post) return <p>Post not found</p>;

    const post = data.post;

    return (
        <>
        <h1>{post.title}</h1>
        <article>{post.content}</article>
        </>
    );
}