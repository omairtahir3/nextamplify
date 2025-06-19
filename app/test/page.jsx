// components/SessionDebug.jsx
'use client';
import { useSession, signIn, signOut } from 'next-auth/react';

export default function SessionDebug() {
  const { data: session, status } = useSession();

  return (
    <div className="session-debug">
      <h3>Session Status: {status}</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      {status === 'authenticated' ? (
        <button onClick={() => signOut()}>Sign Out</button>
      ) : (
        <button onClick={() => signIn('google')}>Sign In with Google</button>
      )}
    </div>
  );
}