import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  content: string;
  likes: mongoose.Types.ObjectId[];
  replies: mongoose.Types.ObjectId[];
  parentComment?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    video: {
      type: Schema.Types.ObjectId,
      ref: 'Video',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 300
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    replies: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    parentComment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  },
  {
    timestamps: true
  }
);

// 创建索引以提高查询性能
CommentSchema.index({ video: 1, createdAt: -1 });
CommentSchema.index({ user: 1, createdAt: -1 });
CommentSchema.index({ parentComment: 1 });

export default mongoose.model<IComment>('Comment', CommentSchema); 