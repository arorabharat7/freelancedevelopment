// models/User.ts
import mongoose, { Document, Schema } from 'mongoose';

interface IUser extends Document {
  email: string;
  password: string;
  userType: string;
  emailConfirmed: boolean;
  verificationToken?: string;
  resetPasswordToken?: string; // Ensure this field exists
}

const UserSchema: Schema<IUser> = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  userType: { type: String, required: true },
  emailConfirmed: { type: Boolean, default: false },
  verificationToken: { type: String },
  resetPasswordToken: { type: String }, // Add this field if missing
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
