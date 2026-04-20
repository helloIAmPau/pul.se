import Brand from '../brand';
import GoogleButton from '../google-button';

import { wrapper, header, providers } from './styles.module.css';

export default function Signin() {
  return (
    <div className={ wrapper }>
      <Brand />
      <h1 className={ header }>Sign In</h1>
      <div className={ providers }>
        <GoogleButton />
      </div>
    </div>
  );
};
