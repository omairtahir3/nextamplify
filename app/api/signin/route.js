import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export async function POST(req) {
  try {
    const { email, password } = await req.json();

    await dbConnect();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({ 
      message: 'Login successful',
      token: token // Added for localStorage consistency
    });

    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: false, // Changed from process.env.NODE_ENV === 'production' to allow cookies over HTTP (EC2 IP)
      path: '/',
      sameSite: 'lax', // Added for better cross-origin/redirection reliability
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
