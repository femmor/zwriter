import { Schema, model, models } from "mongoose";

export interface IMedia {
  url: string;
  type: string;
  uploadedBy: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const mediaSchema = new Schema(
  {
    url: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    uploadedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User",
        required: true
    },
  },
  { timestamps: true }
);

const Media = models.Media || model<IMedia>("Media", mediaSchema);

export default Media;