export interface Post {
    id: string;
    title: string;
    slug: string;
    content: string;
    status: string;
    seo?: SEO;
}

export interface PostsData {
    posts: Post[];
}

export interface SEO {
    title: string;
    description: string;
}

export interface Category {
    id: string;
    name: string;
    slug: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
}

export interface PostVersion {
    id: string;
    postId: string;
    content: string;
    createdBy: User;
    createdAt: string;
    updatedAt: string;
}

export interface AIResult {
    content: string;
}
