import Heading from '../heading';

import { wrapper, heading, pretitle_wrapper } from './styles.module.css';

export default function LandingPageSection({ children, pretitle, title, className='' }) {
  return (
    <div className={ wrapper }>
      <div className={ heading }>
        <div className={ pretitle_wrapper }>{ pretitle }</div>
        <Heading secondary>{ title }</Heading>
      </div>
      <div className={ className }>
        { children }
      </div>
    </div>
  );
};
