import { Schema, model, models } from "mongoose";

export interface IPostVersion {
  postId: Schema.Types.ObjectId;
  content: string;
  createdBy: Schema.Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

const postVersionSchema = new Schema(
  {
    postId: { 
        type: Schema.Types.ObjectId, 
        ref: "Post" 
    },
    content: {
        type: String,
    },
    createdBy: { 
        type: Schema.Types.ObjectId, 
        ref: "User" 
    },
  },
  { 
    timestamps: true 
}
);

const PostVersion =
  models.PostVersion || model<IPostVersion>("PostVersion", postVersionSchema);

export default PostVersion;