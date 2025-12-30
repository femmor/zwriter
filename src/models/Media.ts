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
    },
    type: {
        type: String,
    },
    uploadedBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    },
  },
  { timestamps: true }
);

const Media = models.Media || model<IMedia>("Media", mediaSchema);

export default Media;