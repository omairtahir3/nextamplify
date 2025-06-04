// app/layout.js
import { Poppins } from 'next/font/google';
import './globals.css';
const poppins = Poppins({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

export const metadata = {
  title: 'Amplify - Albums',
  description: 'Log in to your Amplify account',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className="album-body">
        {children}
      </body>
    </html>
  );
}