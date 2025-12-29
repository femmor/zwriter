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

    type Query {
        posts(status: String): [Post!]!
        postBySlug(slug: String!): Post
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
    }

`