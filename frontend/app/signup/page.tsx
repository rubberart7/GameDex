import React from 'react'
import HomeNavBar from '../components/ui/HomeNavBar';
import SignUpForm from '../components/ui/SignUpForm';

const SignUp = () => {
  return (
    <div className="bg-gray-950 min-h-screen">
      <HomeNavBar />
      <SignUpForm></SignUpForm>
    </div>
  )
}

export default SignUp;
