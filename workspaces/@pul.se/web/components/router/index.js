import { BrowserRouter, Routes, Route } from 'react-router';

import Layout from '../layout';

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={ <Layout /> } index />
      </Routes>
    </BrowserRouter>
  );
};
