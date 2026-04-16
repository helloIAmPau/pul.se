import { ThemeProvider } from '../../contexts/theme';

import Router from '../router';

export default function App() {
  return (
    <ThemeProvider>
      <Router />
    </ThemeProvider>
  );
};
