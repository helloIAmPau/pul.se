import { BrowserRouter, Routes, Route } from 'react-router';

import Theater from '../theater';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/events/:uid' element={ <Theater /> } />
      </Routes>
    </BrowserRouter>
  );
};
