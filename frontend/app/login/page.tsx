import React from 'react';
import HomeNavBar from '../components/ui/navigation/HomeNavBar';
import LoginForm from '../components/ui/auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="bg-gray-950 min-h-screen">
      <HomeNavBar />
      <LoginForm></LoginForm>
    </div>
  );
};

export default LoginPage;
