import Brand from '../brand';
import Hr from '../hr';

import { text, wrapper } from './styles.module.css';

export default function Footer() {
  return (
    <div>
      <Hr />
      <div className={ wrapper }>
        <Brand />
        <div className={ text }>Open-source. MIT Licensed. Built from developers for broadcasters</div>
      </div>
    </div>
  );
};
