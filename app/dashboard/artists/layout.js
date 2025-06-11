// app/dashboard/artists/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Artists',
  description: 'Browse artists on Amplify',
};

export default function ArtistLayout({ children }) {
  return (
    <div className={`${poppins.variable} artist-body`}>
      {children}
    </div>
  );
}