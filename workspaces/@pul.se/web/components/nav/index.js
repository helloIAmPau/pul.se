import { Link } from 'react-router';

import Container from '../container';
import Brand from '../brand';

import { wrapper, container, link } from './styles.module.css';

export default function Nav() {
  return (
    <nav className={ wrapper }>
      <Container className={ container }>
        <Link to='/dashboard' className={ link }><Brand /></Link>
      </Container>
    </nav>
  );
}
