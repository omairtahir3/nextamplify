'use client';

import { Poppins, Montserrat, Bebas_Neue, Playfair_Display } from 'next/font/google';

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

export default function AuthLayout({ children }) {
  return (
    <section
      className={`auth-body ${poppins.variable} ${montserrat.variable} ${bebas.variable} ${playfair.variable}`}
    >
      {children}
    </section>
  );
}
