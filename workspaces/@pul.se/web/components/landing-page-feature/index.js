import Heading from '../heading';
import Card from '../card';

import { wrapper, heading, content } from './styles.module.css';

export default function LandingPageFeature({ icon, title, children }) {
  return (
    <Card className={ wrapper }>
      { icon }
      <Heading className={ heading }>{ title }</Heading>
      <div className={ content }>
        { children }
      </div>
    </Card>
  );
};
