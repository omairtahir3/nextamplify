import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Artist',
  description: 'Artist profile on Amplify',
};

export default function ArtistDetailLayout({ children }) {
  return (
    <div className={`${poppins.variable} artist-body`}>
      {children}
    </div>
  );
}