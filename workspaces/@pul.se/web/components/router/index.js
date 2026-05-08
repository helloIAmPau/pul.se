import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import { useAuth } from '../../contexts/auth';

import Layout from '../layout';
import Theater from '../theater';
import SplashScreen from '../splash-screen';
import Signin from '../signin';
import Dashboard from '../dashboard';
import StreamSettings from '../stream-settings';
import LandingPage from '../landing-page';

export default function Router() {
  const { state } = useAuth();

  const privilegedRoutes = useMemo(function() {
    if(state === 'LOADING') {
      return (
        <Route path='/*' element={ <SplashScreen /> } />
      );
    }

    if(state === 'SIGNED_OUT') {
      return (
        <Route path='/*' element={ <Signin /> } />
      );
    }

    return (
      <Route element={ <Layout /> }>
        <Route path='/dashboard' element={ <Dashboard /> } />
        <Route element={ <Theater /> } path='/theater/:app' />
        <Route element={ <StreamSettings /> } path='/streams/:app' />
      </Route>
    );
  }, [ state ]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={ <Layout /> }>
          <Route index element={ <LandingPage /> } />
        </Route>
        { privilegedRoutes }
      </Routes>
    </BrowserRouter>
  );
};
