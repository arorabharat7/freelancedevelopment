import dbConnect from './utils/db';
import Profile from './models/Profile';

export const saveOtp = async (mobileNumber: string, otp: string) => {
  await dbConnect();
  await Profile.findOneAndUpdate(
    { mobileNumber },
    { $set: { otp, mobileNumberVerified: false } },
    { new: true, upsert: true }
  );
};

export const verifyOtp = async (mobileNumber: string, otp: string): Promise<boolean> => {
  await dbConnect();
  const profile = await Profile.findOne({ mobileNumber });
  if (profile && profile.otp === otp) {
    profile.mobileNumberVerified = true;
    await profile.save();
    return true;
  }
  return false;
};

export const isVerified = async (mobileNumber: string): Promise<boolean> => {
  await dbConnect();
  const profile = await Profile.findOne({ mobileNumber });
  return profile ? profile.mobileNumberVerified : false;
};
