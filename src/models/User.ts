import mongoose, { Schema, Document } from 'mongoose';

enum UserRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER'
}

interface User extends Document {
    name: string;
    email: string;
    image?: string;
    role: UserRole;
    password?: string; // Optional for OAuth users
    emailVerified?: Date; // For email verification
}

const userSchema = new Schema({
    name: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    image: { 
        type: String 
    },
    password: {
        type: String,
        select: false // Don't include password in queries by default
    },
    emailVerified: {
        type: Date
    },
    role: { 
        type: String, 
        enum: Object.values(UserRole), 
        required: true,
        default: UserRole.VIEWER
    }
}, {
    timestamps: true
})

const User = mongoose.models.User || mongoose.model<User>('User', userSchema);

export default User;