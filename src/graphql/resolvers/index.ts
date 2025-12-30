import { generatePostDraft } from '@/ai/generatePost';
import { generateSEO } from '@/ai/generateSeo';
import { rewritePost } from '@/ai/rewritePost';
import Post from '@/models/Post';
import { PostVersionService } from '@/services/PostVersionService';
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
        draftPostBySlug: async (_: unknown, { slug }: PostBySlugArgs, ctx: Context) => {
            // Check authentication
            if (!ctx.user?.id) {
                throw new Error('Authentication required to view drafts.');
            }

            // Check permissions (only EDITOR and ADMIN can view drafts)
            if (!ctx.user.role || !['EDITOR', 'ADMIN'].includes(ctx.user.role)) {
                throw new Error('Insufficient permissions to view drafts.');
            }

            // Return draft post by slug (any status)
            return Post.findOne({ slug });
        },
        postVersions: async (_: unknown, { postId }: { postId: string }) => {
            return await PostVersionService.getVersionHistory(postId);
        },
        postVersion: async (_: unknown, { id }: { id: string }) => {
            return await PostVersionService.getVersionById(id);
        },
        fetchDraftPost: async (_: unknown, { slug }: { slug: string }, ctx: Context) => {
            // Only allow access to draft posts for authenticated users
            if (!ctx.user?.id) {
                throw new Error('Authentication required to access draft posts.');
            }

            const post = await Post.findOne({ slug, status: "DRAFT" });
            if (!post) {
                throw new Error('Draft post not found.');
            }

            return post;
        }
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

            // Get current post for versioning
            const currentPost = await Post.findById(id);
            if (!currentPost) {
                throw new Error('Post not found');
            }

            // Auto-version if content is changing
            if (content && content !== currentPost.content) {
                await PostVersionService.autoVersion(id, currentPost.content, ctx.user.id);
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
            if (!ctx.user || ctx.user.role === "VIEWER")
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
            if (!ctx.user || ctx.user.role === "VIEWER")
                throw new Error("Unauthorized");

            const post = await Post.findById(postId);
            if (!post) throw new Error("Post not found");

            // Validate tone parameter
            if (tone !== "formal" && tone !== "casual") {
                throw new Error("Invalid tone. Must be either 'formal' or 'casual'.");
            }

            // Auto-version before rewriting
            await PostVersionService.autoVersion(postId, post.content, ctx.user.id || "");

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

            const seoLines = seoText ? seoText.split("\n") : [];
            if (seoLines.length < 3) {
                throw new Error("AI SEO generation returned an unexpected format.");
            }
            post.seo = {
                title: seoLines[0],
                description: seoLines[1],
                keywords: seoLines[2].split(",").map(k => k.trim()),
            };

            await post.save();
            return post;
        },
        restorePostVersion: async (_: unknown, { postId, versionId }: { postId: string, versionId: string }, ctx: Context) => {
            if (!ctx.user?.id) {
                throw new Error('Authentication required to restore a post version.');
            }

            if (!ctx.user.role || !['EDITOR', 'ADMIN'].includes(ctx.user.role)) {
                throw new Error('Insufficient permissions. Editor or Admin role required.');
            }

            return await PostVersionService.restoreVersion(postId, versionId, ctx.user.id);
        },
    },
};