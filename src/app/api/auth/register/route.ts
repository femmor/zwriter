import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { hashPassword, validatePassword } from '@/utils/password';
import { encode as encodeJWT } from 'next-auth/jwt';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Invalid password', details: passwordValidation.errors },
        { status: 400 }
      );
    }

    // Connect to database
    await connectDB();

    // Check if user already exists
    // Normalize email to lowercase and trim whitespace before checking for existing user.
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email is already in use' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Check if this is the first user (make them admin)
    const userCount = await User.countDocuments();
    const isFirstUser = userCount === 0;

    // Create user
    const newUser = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: hashedPassword,
      role: isFirstUser ? 'ADMIN' : 'VIEWER'
    });

    // Create session token for auto-login
    const token = {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      id: newUser._id.toString(),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
    };

    // Encode JWT token
    const encodedToken = await encodeJWT({
      token,
      secret: authOptions.secret!,
    });

    // Create session cookie
    const cookieStore = await cookies();
    const secureCookie = process.env.NEXTAUTH_URL?.startsWith('https://') ?? false;
    const cookieName = secureCookie ? '__Secure-next-auth.session-token' : 'next-auth.session-token';
    
    cookieStore.set(cookieName, encodedToken, {
      httpOnly: true,
      secure: secureCookie,
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/'
    });

    // Remove password from response
    const { password: _, ...userWithoutPassword } = newUser.toObject();

    return NextResponse.json(
      { 
        message: 'User created successfully', 
        user: userWithoutPassword,
        sessionCreated: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}