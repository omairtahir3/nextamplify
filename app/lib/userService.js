import dbConnect from './dbConnect';
import User from '../models/User';

export async function getUserByToken(token) {
  await dbConnect();
  return await User.findOne({ resetToken: token });
}

export async function resetUserPassword(email, newPassword) {
  await dbConnect();
  return await User.findOneAndUpdate(
    { email },
    {
      password: newPassword,
      resetToken: null,
      tokenExpires: null,
    },
    { new: true }
  );
}
