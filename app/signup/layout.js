import AuthLayout from '../components/auth/AuthLayout';


export const metadata = {
  title: 'Amplify - Sign Up',
  description: 'Create an Amplify account',
};

export default function SignUpLayout({ children }) {
  return (
    <AuthLayout 
      title={metadata.title} 
      description={metadata.description}
    >
      {children}
    </AuthLayout>
  );
}