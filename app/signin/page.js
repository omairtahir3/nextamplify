'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // ❗ Added for alert

  const handleLogin = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.status === 200) {
      localStorage.setItem('token', data.token);
      router.push('/dashboard'); 
    } else {
      setError(data.message || 'Invalid email or password'); // ❗ show error
    }
  };

  return (
    <section className="signin-section">
      <div className="signin-container">
        <Image
          src="https://cdn.pixabay.com/photo/2022/09/25/03/20/music-7477530_1280.png"
          alt="Amplify Logo"
          width={80}
          height={80}
          className="amplify-logo"
        />
        <h2>Log in to Amplify</h2>

        <div className="social-login-container">
          <button className="social-login google">
            <Image
              src="https://cdn1.iconfinder.com/data/icons/google-s-logo/150/Google_Icons-09-512.png"
              alt="Google Logo"
              width={20}
              height={20}
            />
            Continue with Google
          </button>
        </div>

        <hr className="divider" />

        <form className="signin-form" onSubmit={handleLogin}>
          {error && <div className="alert-error">{error}</div>}

          <label htmlFor="email">Email</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Enter your email or username" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button type="submit" className="signin-btn">
            Log In
          </button>

          <p className="forgot-password">
            <Link href="/forgot-password">Forgot your password?</Link>
          </p>
          <p className="signup-link">
            Don&apos;t have an account?{' '}
            <Link href="/signup">Sign up for Amplify</Link>
          </p>
        </form>
      </div>
    </section>
  );
}