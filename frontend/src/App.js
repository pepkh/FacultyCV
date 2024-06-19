import { Amplify } from 'aws-amplify';
import './App.css';
import '@aws-amplify/ui-react/styles.css';
import { Container, Section, Bar } from '@column-resizer/react';
import React, { useEffect, useState } from 'react';
import { getCurrentUser } from 'aws-amplify/auth';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import HomePage from './HomePage';
import AuthPage from './AuthPage';
import NotFound from './NotFound';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: process.env.REACT_APP_APPSYNC_ENDPOINT,
      region: process.env.REACT_APP_AWS_REGION,
      defaultAuthMode: 'userPool',
    }
  },
  Auth: {
    Cognito: {
      region: process.env.REACT_APP_AWS_REGION,
      userPoolClientId: process.env.REACT_APP_COGNITO_USER_POOL_CLIENT_ID,
      userPoolId: process.env.REACT_APP_COGNITO_USER_POOL_ID,
      allowGuestAccess: false
    }
  },
});

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    async function getUser() {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
        console.log(currentUser.signInDetails.loginId, "is signed in");
        <Navigate to="/home" />
      }
      catch (error) {
        setUser(null);
        console.log('Error getting user:', error);
        <Navigate to="/auth" />
      }
    }
    getUser();
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/home" element={user ? <HomePage user = {user} /> : <Navigate to="/auth" />} />
        <Route path="/auth" element={user ? <Navigate to="/home" /> : <AuthPage />} />
        <Route path="/" element={<Navigate to="/home" />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
