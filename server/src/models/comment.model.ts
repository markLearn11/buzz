import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  user: mongoose.Types.ObjectId;
  video: mongoose.Types.ObjectId;
  content: string;
  imageUrl?: string;        // 主图片URL
  imageUrls?: string;       // 新增：多图片URLs JSON字符串
  emojiType?: string;       // 主表情类型
  emojiId?: string;         // 主表情ID
  emojisData?: string;      // 新增：所有表情数据 JSON字符串
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
      trim: true,
      maxlength: 300
    },
    imageUrl: {             // 主图片URL
      type: String,
      trim: true
    },
    imageUrls: {            // 新增：多图片URLs JSON字符串
      type: String
    },
    emojiType: {            // 主表情类型
      type: String,
      enum: ['static', 'animated', null],
      default: null
    },
    emojiId: {              // 主表情ID
      type: String,
      trim: true
    },
    emojisData: {           // 新增：所有表情数据 JSON字符串
      type: String
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