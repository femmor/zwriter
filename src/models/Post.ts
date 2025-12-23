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
    seo: {
        title: string
        description: string
        keywords: string[]
    }
    author: mongoose.Types.ObjectId
}

const postSchema = new Schema({
    title: { 
        type: String, 
        required: true 
    },
    slug: { 
        type: String, 
        required: true, 
        unique: true 
    },
    content: { 
        type: String, 
        required: true 
    },
    status: { 
        type: String, 
        enum: Object.values(PostStatus), 
        required: true 
    },
    seo: {
        title: { 
            type: String, 
            required: true 
        },
        description: { 
            type: String, 
            required: true 
        },
        keywords: { 
            type: [String], 
            required: true 
        }
    },  
    author: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, {
    timestamps: true
})

const Post = mongoose.model<Post>('Post', postSchema);

export default Post;