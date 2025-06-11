// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';
const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Playlists',
  description: 'Log in to your Amplify account',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="dashboard-body">
        <div className="dashboard-container">
          {children}
        </div>
      </body>
    </html>
  );
}