import { createRoot } from 'react-dom/client';

import '@fontsource-variable/inter';
import '@fontsource-variable/space-grotesk';

import App from './components/app';

const element = document.querySelector('#root');
const root = createRoot(element);
root.render(<App />);
