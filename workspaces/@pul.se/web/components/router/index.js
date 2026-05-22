import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';
import { BroadcastProvider } from '@pul.se/broadcast/client'; 

import { useAuth } from '../../contexts/auth';

import Layout from '../layout';
import Live from '../live';
import Vod from '../vod';
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
      <Route element={ <BroadcastProvider><Layout /></BroadcastProvider> }>
        <Route path='/dashboard' element={ <Dashboard /> } />
        <Route element={ <StreamSettings /> } path='/streams/:app' />
        <Route element={ <Live /> } path='/live/:app' />
        <Route element={ <Vod /> } path='/vods/:uid' />
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
