import mongoose, { Document, Schema } from 'mongoose';

enum PostStatus {
    DRAFT = 'DRAFT',
    PUBLISHED = 'PUBLISHED'
}

interface Post extends Document {
    title: string
    slug: string
    content: string
    author: mongoose.Types.ObjectId
    status: PostStatus
}

const seoSchema = new Schema({
    title: { type: String },
    description: { type: String }
});

const postSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String,
        required: true,
        unique: true,
        index: true
    },
    content: { 
        type: String
    },
    status: { 
        type: String, 
        enum: Object.values(PostStatus), 
        default: PostStatus.DRAFT,
        required: true
    },
    seo: seoSchema,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{
        type: Schema.Types.ObjectId,
        ref: 'Category',
    }]
}, {
    timestamps: true
})

const Post = mongoose.model<Post>('Post', postSchema);

export default Post;