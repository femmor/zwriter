import { generatePostDraft } from '@/ai/generatePost';
import { generateSEO } from '@/ai/generateSeo';
import { rewritePost } from '@/ai/rewritePost';
import Post from '@/models/Post';
import generateSlug from '@/utils/generateSlug';

const uuid = crypto.randomUUID();

interface CreatePostArgs {
    title: string;
}

interface PostsArgs {
    status?: string;
}

interface PostBySlugArgs {
    slug: string;
}

interface UpdatePostArgs {
    id: string;
    title?: string;
    content?: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
}

interface PostIdArgs {
    id: string;
}

interface Context {
    user?: { 
        id?: string;
        role?: string;
    };
    role?: string;
}

export const resolvers = {
    Query: {
        posts: async (_: unknown, { status }: PostsArgs) => {
            return await Post.find(status ? { status } : {});
        },
        postBySlug: async (_: unknown, { slug }: PostBySlugArgs) => {
            return Post.findOne({ slug, status: "PUBLISHED" });
        },
    },
    Mutation: {
        createPost: async (_: unknown, args: CreatePostArgs, ctx: Context) => {
            // Check if user is authenticated
            if (!ctx.user?.id) {
                throw new Error('Authentication required to create a post.');
            }

            // Check if user has permission (allow both EDITOR and ADMIN roles)
            // Server-enforced security check - RBAC 
            const userRole = ctx.user.role || ctx.role;
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
                    slug: finalSlug,
                    author: ctx.user.id,
                    status: 'DRAFT'
                });

                return newPost;
            } catch (error) {
                throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        },
        updatePost: async (_: unknown, { id, title, content, seoTitle, seoDescription, seoKeywords }: UpdatePostArgs, ctx: Context) => {
            if (!ctx.user?.id) {
                throw new Error('Authentication required to update a post.');
            }

            if (!ctx.user.role || !['EDITOR', 'ADMIN'].includes(ctx.user.role)) {
                throw new Error('Insufficient permissions. Editor or Admin role required.');
            }

            return Post.findByIdAndUpdate(id, { 
                status: 'PUBLISHED',
                title,
                content,
                seo: {
                    title: seoTitle,
                    description: seoDescription,
                    keywords: seoKeywords ? seoKeywords.split(',').map(k => k.trim()) : []
                }
            }, { new: true });
        },

        deletePost: async (_: unknown, { id }: PostIdArgs, ctx: Context) => {
            if (!ctx.user?.id) {
                throw new Error('Authentication required to delete a post.');
            }

            if (!ctx.user.role || ctx.user.role !== 'ADMIN') {
                throw new Error('Insufficient permissions. Admin role required.');
            }

            const result = await Post.findByIdAndDelete(id);
            return !!result;
        },

        generatePostWithAI: async (_: unknown, { topic }: {topic: string}, ctx: Context) => {
            if (!ctx.user || ctx.role === "VIEWER")
                throw new Error("Unauthorized");

            const content = await generatePostDraft(topic);

            return Post.create({
                title: topic,
                slug: generateSlug(topic),
                content,
                status: "DRAFT",
                author: ctx.user.id,
            });
        },
        rewritePostWithAI: async (_: unknown, { postId, tone }: {postId: string, tone: string}, ctx: Context) => {
            if (!ctx.user || ctx.role === "VIEWER")
                throw new Error("Unauthorized");

            const post = await Post.findById(postId);
            if (!post) throw new Error("Post not found");

            // Validate tone parameter
            if (tone !== "formal" && tone !== "casual") {
                throw new Error("Invalid tone. Must be either 'formal' or 'casual'.");
            }

            const rewritten = await rewritePost(post.content, tone as "formal" | "casual");

            post.content = rewritten;
            await post.save();

            return post;
        },
        generateSeoWithAI: async (_: unknown, { postId }: {postId: string}, ctx: Context) => {
            if (ctx.role !== "EDITOR" && ctx.role !== "ADMIN")
                throw new Error("Unauthorized");

            const post = await Post.findById(postId);
            if (!post) throw new Error("Post not found");

            const seoText = await generateSEO(post.content);

            post.seo = {
                title: seoText.split("\n")[0],
                description: seoText.split("\n")[1],
                keywords: seoText.split("\n")[2].split(",").map(k => k.trim()),
            };

            await post.save();
            return post;
        },
    },
};