import mongoose, { Document, Schema } from 'mongoose';

interface Category extends Document {
    name: string;
    slug: string;
}

const categorySchema = new Schema({
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true }
}, {
    timestamps: true
})

const Category = mongoose.model<Category>('Category', categorySchema);
export default Category;