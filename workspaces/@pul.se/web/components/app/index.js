import { ThemeProvider } from '../../contexts/theme';
import { AuthProvider } from '../../contexts/auth';

import Router from '../router';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </ThemeProvider>
  );
};
