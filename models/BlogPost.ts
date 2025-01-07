import mongoose, { Schema, Document } from 'mongoose';

interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  author: mongoose.Schema.Types.ObjectId;
  categories: string[];
  tags: string[];
  publishedAt: Date;
  status: string;
  featuredImage: string;
  seo: {
    title: string;
    description: string;
    keywords: string[];
  };
  metaDescription: string;
  authorBio: string;
  altText: string;
  references: string;
}

const BlogPostSchema: Schema<IBlogPost> = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  categories: { type: [String], default: [] },
  tags: { type: [String], default: [] },
  publishedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['draft', 'published'], default: 'draft' },
  featuredImage: { type: String },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: { type: [String] }
  },
  metaDescription: { type: String },
  authorBio: { type: String },
  altText: { type: String },
  references: { type: String },
});

// Slug generation middleware
BlogPostSchema.pre('validate', function (next) {
  const blogPost = this as IBlogPost;
  if (blogPost.title) {
    blogPost.slug = blogPost.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  next();
});

export default mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
