import Container from '../container';
import Brand from '../brand';

import { wrapper, container } from './styles.module.css';

export default function Nav() {
  return (
    <nav className={ wrapper }>
      <Container className={ container }>
        <Brand />
      </Container>
    </nav>
  );
}
