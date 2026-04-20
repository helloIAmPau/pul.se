import Brand from '../brand';

import { wrapper, brand } from './styles.module.css';

export default function SplashScreen() {
  return (
    <div className={ wrapper }>
      <Brand className={ brand } />
    </div>
  );
};
