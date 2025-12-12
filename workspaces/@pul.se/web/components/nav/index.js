import Container from '../container';
import Brand from '../brand';
import ThemeSwitch from '../theme-switch';

import { wrapper, container } from './styles.module.css';

export default function Nav() {
  return (
    <nav className={ wrapper }>
      <Container className={ container }>
        <Brand />
        <ThemeSwitch />
      </Container>
    </nav>
  );
}
