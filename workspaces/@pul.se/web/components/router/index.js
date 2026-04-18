import { BrowserRouter, Routes, Route } from 'react-router';

import Layout from '../layout';
import Theater from '../theater';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={ <Layout /> }>
          <Route element={ <Theater /> } path='/theater/:app' />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
