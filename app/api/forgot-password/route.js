// app/api/forgot-password/route.js (for App Router)
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import { sendResetEmail } from '../../lib/mailer';

export async function POST(req) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ message: 'Email is required' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    user.resetToken = token;
    user.tokenExpires = tokenExpires;
    await user.save();

    const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

    await sendResetEmail(email, resetLink);

    return NextResponse.json({ message: 'Password reset email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Forgot Password Error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
