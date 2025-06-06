import mongoose, { Schema, Document } from 'mongoose';

export interface IVideo extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  videoUrl: string;
  coverUrl?: string;
  duration: number;
  likes: mongoose.Types.ObjectId[];
  comments: mongoose.Types.ObjectId[];
  views: number;
  tags: string[];
  isPrivate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const VideoSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500
    },
    videoUrl: {
      type: String,
      required: true
    },
    coverUrl: {
      type: String,
      default: ''
    },
    duration: {
      type: Number,
      default: 0
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    comments: [{
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }],
    views: {
      type: Number,
      default: 0
    },
    tags: [{
      type: String,
      trim: true
    }],
    isPrivate: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

// 创建索引以提高查询性能
VideoSchema.index({ title: 'text', description: 'text', tags: 'text' });
VideoSchema.index({ user: 1, createdAt: -1 });
VideoSchema.index({ createdAt: -1 });
VideoSchema.index({ views: -1 });

export default mongoose.model<IVideo>('Video', VideoSchema); 