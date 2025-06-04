import Image from 'next/image';
import Link from 'next/link';

export const metadata = {
  title: 'Amplify - Sign In',
  description: 'Log in to your Amplify account',
};

export default function SignInPage() {
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

          <button className="social-login facebook">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png"
              alt="Facebook Logo"
              width={20}
              height={20}
            />
            Continue with Facebook
          </button>

          <button className="social-login apple">
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg"
              alt="Apple Logo"
              width={20}
              height={20}
            />
            Continue with Apple
          </button>
        </div>

        <hr className="divider" />

        <form className="signin-form">
          <label htmlFor="email">Email or Username</label>
          <input 
            type="email" 
            id="email" 
            placeholder="Enter your email or username" 
            required 
          />

          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            placeholder="Enter your password"
            required
          />

          <Link href="/dashboard" className="signin-btn">
            Log In
          </Link>

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