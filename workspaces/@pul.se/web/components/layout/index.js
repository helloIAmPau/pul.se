import { Outlet } from 'react-router';

import Container from '../container';
import Nav from '../nav';

import { wrapper, content } from './styles.module.css';

export default function Layout() {
  return (
    <div className={ wrapper }>
      <Nav />
      <div className={ content }>
        <Container>
          <Outlet />
        </Container>
      </div>
    </div>
  );
};
