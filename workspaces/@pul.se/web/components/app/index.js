import { ThemeProvider } from '../../contexts/theme';

import Nav from '../nav';
import Scrollable from '../scrollable';
import Container from '../container';
import Theater from '../theater';

import { app, wrapper } from './styles.module.css';

export default function() {
  return (
    <ThemeProvider>
      <div className={ app }>
        <Nav />
        <div className={ wrapper }>
          <Scrollable>
            <Container>
              <Theater />
            </Container>
          </Scrollable>
        </div>
      </div>
    </ThemeProvider>
  );
};
