import { useMemo } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router';

import { useAuth } from '../../contexts/auth';

import Landing from '../landing';
import Theater from '../theater';
import Signin from '../signin';
import Loading from '../loading';
import Admin from '../admin';

export default function Router() {
  const { state } = useAuth();

  const adminRoutes = useMemo(function() {
    if(state === 'LOADING') {
      return (
        <Route path='/admin/*' element={ <Loading /> } />
      );
    }

    if(state === 'SIGNED_OUT') {
      return (
        <Route path='/admin/*' element={ <Signin /> } />
      );
    }

    return (
      <Route path='/admin' element={ <Admin /> } />
    );
  }, [ state ]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={ <Landing /> } />
        { adminRoutes }
        <Route path='/events/:uid' element={ <Theater /> } />
      </Routes>
    </BrowserRouter>
  );
};
