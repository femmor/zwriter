import mongoose, { Schema } from 'mongoose';

enum UserRole {
    ADMIN = 'ADMIN',
    EDITOR = 'EDITOR',
    VIEWER = 'VIEWER'
}

interface User extends Document {
    email: string;
    role: UserRole;
}

const userSchema = new Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    role: { 
        type: String, 
        enum: Object.values(UserRole), 
        required: true 
    }
}, {
    timestamps: true
})

const User = mongoose.model<User>('User', userSchema);

export default User;