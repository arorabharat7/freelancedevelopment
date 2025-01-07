import mongoose, { Document, Schema } from 'mongoose';

interface IProfile extends Document {
  userId: Schema.Types.ObjectId;
  fullName: string;
  mobileNumber: string;
  otp?: string;
  mobileNumberVerified?: boolean;
  profileVerified?: boolean;
  requestProfileVerification?: boolean;
  bio?: string;
  skills?: { skill: string, verified: boolean }[];
  portfolioLinks?: string[];
  profileImage?: string;
}

const ProfileSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  fullName: { type: String, default: '' },
  mobileNumber: { type: String, default: '' },
  otp: { type: String, default: '' },
  mobileNumberVerified: { type: Boolean, default: false },
  profileVerified: { type: Boolean, default: false },
  requestProfileVerification:  { type: Boolean, default: false },
  bio: { type: String, default: '' },
  skills: { 
    type: [{ 
      skill: { type: String, default: '' },
      verified: { type: Boolean, default: false } 
    }], 
    default: [] 
  },
  portfolioLinks: { type: [String], default: [] },
  profileImage: { type: String, default: '' },
});

export default mongoose.models.Profile || mongoose.model<IProfile>('Profile', ProfileSchema);
