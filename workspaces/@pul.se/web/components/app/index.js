import { ThemeProvider } from '../../contexts/theme';

import Nav from '../nav';
import Scrollable from '../scrollable';
import Container from '../container';
import Router from '../router';

import { app, wrapper } from './styles.module.css';

export default function() {
  return (
    <ThemeProvider>
      <div className={ app }>
        <Nav />
        <div className={ wrapper }>
          <Scrollable>
            <Container>
              <Router />
            </Container>
          </Scrollable>
        </div>
      </div>
    </ThemeProvider>
  );
};
