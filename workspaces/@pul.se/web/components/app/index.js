import { AuthProvider } from '../../contexts/auth';

import Router from '../router';

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  );
};
