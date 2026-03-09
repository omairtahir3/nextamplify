import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    await dbConnect();

    const user = await User.findById(decoded.id).select('-password -resetToken -tokenExpires');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      id: user._id,
      email: user.email,
      username: user.username,
    });
  } catch (error) {
    console.error('Me API error:', error);
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
}
