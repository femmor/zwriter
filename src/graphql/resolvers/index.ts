import Post from '@/models/Post';

export const resolvers = {
    Query: {
        posts: async () => {
            return await Post.find();
        },
    },
    Mutation: {
        createPost: async (_: unknown, { title, content }: { title: string; content: string }) => {
            const newPost = new Post({ title, content });
            return await newPost.save();
        },
    },
};