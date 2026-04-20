import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import { useAuth } from '../../contexts/auth';

import Layout from '../layout';
import Theater from '../theater';
import SplashScreen from '../splash-screen';
import Signin from '../signin';
import Dashboard from '../dashboard';

export default function Router() {
  const { state } = useAuth();

  const privilegedRoutes = useMemo(function() {
    if(state === 'LOADING') {
      return (
        <Route path='/dashboard/*' element={ <SplashScreen /> } />
      );
    }

    if(state === 'SIGNED_OUT') {
      return (
        <Route path='/dashboard/*' element={ <Signin /> } />
      );
    }

    return (
      <Route path='/dashboard' element={ <Layout /> }>
        <Route index element={ <Dashboard /> } />
      </Route>
    );
  }, [ state ]);

  return (
    <BrowserRouter>
      <Routes>
        { privilegedRoutes }
        <Route element={ <Layout /> }>
          <Route element={ <Theater /> } path='/theater/:app' />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
