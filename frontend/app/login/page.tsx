import React from 'react';
import HomeNavBar from '../components/ui/HomeNavBar';
import LoginForm from '../components/ui/LoginForm';

const LoginPage = () => {
  return (
    <div className="bg-gray-950 min-h-screen">
      <HomeNavBar />
      <LoginForm></LoginForm>
    </div>
  );
};

export default LoginPage;
