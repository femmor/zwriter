import { gql } from 'graphql-tag';

export const typeDefs = gql`
    enum PostStatus {
        DRAFT
        PUBLISHED
    }

    type SEO {
        title: String
        description: String
    }

    type Category {
        id: ID!
        name: String!
        slug: String!
    }

    type User {
        id: ID!
        name: String
        email: String
    }

    type PostVersion {
        id: ID!
        postId: ID!
        content: String!
        createdBy: User!
        createdAt: String!
        updatedAt: String!
    }

    type Post {
        id: ID!
        title: String!
        slug: String!
        content: String!
        status: PostStatus!
        seo: SEO
        createdAt: String!
        updatedAt: String!
    }

    type AIResult {
        content: String!
    }

    # Internal query requiring EDITOR or ADMIN role (e.g. draftPostBySlug); 
    # returns a post by slug regardless of status (unlike public postBySlug)

    type Query {
        posts(status: String): [Post!]!
        postBySlug(slug: String!): Post
        draftPostBySlug(slug: String!): Post
        postVersions(postId: ID!): [PostVersion!]!
        postVersion(id: ID!): PostVersion
    }

    type Mutation {
        createPost(title: String!): Post!
        updatePost(
            id: ID!
            title: String
            content: String
            seoTitle: String
            seoDescription: String
        ): Post!
        publishPost(id: ID!): Post!
        deletePost(id: ID!): Boolean!
        generatePostWithAI(topic: String!): Post!
        rewritePostWithAI(
            postId: ID! 
            tone: String!
        ): Post!
        generateSeoWithAI(postId: ID!): Post!
        restorePostVersion(
            postId: ID!
            versionId: ID!
        ): Boolean!
    }

`