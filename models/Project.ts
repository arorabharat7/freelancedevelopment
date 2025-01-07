import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  milestones: [{ type: String }],
});

export default mongoose.models.Project || mongoose.model('Project', projectSchema);
