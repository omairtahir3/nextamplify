import { Poppins, Montserrat, Bebas_Neue, Playfair_Display } from 'next/font/google';
import './globals.css';
const poppins = Poppins({
  weight: ['600'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

const montserrat = Montserrat({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-montserrat',
});

const bebas = Bebas_Neue({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-bebas',
});

const playfair = Playfair_Display({
  weight: ['700'],
  subsets: ['latin'],
  variable: '--font-playfair',
});

export const metadata = {
  title: 'Amplify - Sign In',
  description: 'Log in to your Amplify account',
};

export default function SignInLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${montserrat.variable} ${bebas.variable} ${playfair.variable}`}>
      <head>
        <link rel="icon" href="https://cdn.pixabay.com/photo/2022/09/25/03/20/music-7477530_1280.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css" />
      </head>
      <body className="signin-body">
        {children}
      </body>
    </html>
  );
}