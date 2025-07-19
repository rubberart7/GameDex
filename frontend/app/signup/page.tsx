import React from 'react'
import HomeNavBar from '../components/ui/navigation/HomeNavBar';
import SignUpForm from '../components/ui/auth/SignUpForm';

const SignUp = () => {
  return (
    <div className="bg-gray-950 min-h-screen">
      <HomeNavBar />
      <SignUpForm></SignUpForm>
    </div>
  )
}

export default SignUp;
