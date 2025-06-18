'use client';
import { useState } from 'react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    setStatus('');
    setError('');

    const res = await fetch('/api/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('A reset link has been sent to your email.');
    } else {
      setError(data.message || 'Something went wrong.');
    }
  };

  return (
    <section className="forgot-password-section">
      <div className="forgot-password-container">
        <h2>Forgot your password?</h2>
        <p>Enter your email and we'll send you a reset link.</p>

        <form onSubmit={handleSubmit} className="forgot-password-form">
          {status && <div className="alert-success">{status}</div>}
          {error && <div className="alert-error">{error}</div>}

          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            placeholder="Enter your email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="reset-btn">Send Reset Link</button>
        </form>
      </div>
    </section>
  );
}
