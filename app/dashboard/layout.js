// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';
import Sidebar from './components/Sidebar'
import NowPlayingBar from './components/NowPlaying/NowPlayingPage';
const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Dashboard',
  description: 'Log in to your Amplify account',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="dashboard-body">
        <div className="dashboard-container">
          <Sidebar />
          {children}
          <NowPlayingBar />
        </div>
      </body>
    </html>
  );
}