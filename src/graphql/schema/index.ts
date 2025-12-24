import { gql } from 'graphql-tag';

export const typeDefs = gql`
    enum PostStatus {
        DRAFT
        PUBLISHED
    }

    type Post {
        id: ID!
        title: String!
        slug: String
        content: String!
        status: PostStatus!
    }

    type Query {
        posts: [Post!]!
    }

    type Mutation {
        createPost(title: String!, content: String!): Post!
    }
`