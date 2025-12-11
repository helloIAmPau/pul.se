import Nav from '../nav';
import Scrollable from '../scrollable';
import Container from '../container';
import Theater from '../theater';

import { app, wrapper } from './styles.module.css';

export default function() {
  return (
    <div className={ app }>
      <Nav />
      <div className={ wrapper }>
          <Container>
            <Theater />
          </Container>
      </div>
    </div>
  );
};
