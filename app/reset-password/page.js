'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setStatus('');

    if (newPassword !== confirmPassword) {
      return setError("Passwords don't match.");
    }

    const res = await fetch('/api/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            token: token, 
            newPassword: newPassword,        
        }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus('Password reset successful! Redirecting...');
      setTimeout(() => router.push('/signin'), 2000);
    } else {
      setError(data.message || 'Failed to reset password.');
    }
  };

  return (
    <section className="reset-password-section">
      <div className="reset-password-container">
        <h2>Reset your password</h2>

        <form onSubmit={handleSubmit} className="reset-password-form">
          {status && <div className="alert-success">{status}</div>}
          {error && <div className="alert-error">{error}</div>}

          <label htmlFor="newPassword">New Password</label>
          <input
            type="password"
            id="newPassword"
            placeholder="Enter new password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <label htmlFor="confirmPassword">Confirm New Password</label>
          <input
            type="password"
            id="confirmPassword"
            placeholder="Confirm new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          <button type="submit" className="reset-btn">Reset Password</button>
        </form>
      </div>
    </section>
  );
}
