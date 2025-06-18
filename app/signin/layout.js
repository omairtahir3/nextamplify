import { Poppins, Montserrat, Bebas_Neue, Playfair_Display } from 'next/font/google';
import './globals.css'; // or use a specific signin CSS if needed

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
    <div
      className={`signin-body ${poppins.variable} ${montserrat.variable} ${bebas.variable} ${playfair.variable}`}
    >
      {children}
    </div>
  );
}
