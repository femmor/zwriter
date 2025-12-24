import Post from '@/models/Post';

const uuid = crypto.randomUUID();

interface CreatePostArgs {
    title: string;
    content: string;
}

interface Context {
    user?: { 
        id?: string;
        role?: string;
    };
    role?: string;
}

// Helper function to generate slug from title
function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

export const resolvers = {
    Query: {
        posts: async () => {
            try {
                return await Post.find().sort({ createdAt: -1 });
            } catch (error) {
                throw new Error(`Failed to fetch posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
    },
    Mutation: {
        createPost: async (_: unknown, args: CreatePostArgs, context: Context) => {
            // Check if user is authenticated
            if (!context.user?.id) {
                throw new Error('Authentication required');
            }

            // Check if user has permission (allow both EDITOR and ADMIN roles)
            // Server-enforced security check - RBAC 
            const userRole = context.user.role || context.role;
            if (!userRole || !['EDITOR', 'ADMIN'].includes(userRole)) {
                throw new Error('Insufficient permissions. Editor or Admin role required.');
            }

            try {
                const slug = generateSlug(args.title);
                
                // Check if slug already exists and make it unique if needed
                const existingPost = await Post.findOne({ slug });
                const finalSlug = existingPost ? `${slug}-${uuid}` : slug;

                const newPost = await Post.create({
                    title: args.title,
                    content: args.content,
                    slug: finalSlug,
                    status: 'DRAFT'
                });

                return newPost;
            } catch (error) {
                throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
    },
};