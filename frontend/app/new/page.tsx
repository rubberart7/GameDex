import React from 'react'
import RequireAuth from '../components/RequireAuth'

const TestingPage = () => {
  return (
    <RequireAuth>
      <div>
        <h1>You are logged in!</h1>
      </div>
    </RequireAuth>
    
  )
}

export default TestingPage
