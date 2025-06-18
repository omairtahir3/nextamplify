// app/dashboard/albums/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';

const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Albums',
  description: 'Browse Albums on Amplify',
};

export default function AlbumsLayout({ children }) {
  return (
    <div className={`${poppins.variable} albums-body`}>
      {children}
    </div>
  );
}