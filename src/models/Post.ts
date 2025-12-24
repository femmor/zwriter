import mongoose, { Document, Schema } from 'mongoose';

enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED'
}

interface Post extends Document {
    title: string
    slug: string
    content: string
    status: PostStatus
}

const postSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String
    },
    content: { 
        type: String
    },
    status: { 
        type: String, 
        enum: Object.values(PostStatus), 
        default: PostStatus.DRAFT
    }
}, {
    timestamps: true
})

const Post = mongoose.model<Post>('Post', postSchema);

export default Post;