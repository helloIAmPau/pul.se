import Heading from '../heading';
import Video from '../video';

import { wrapper } from './styles.module.css';

export default function Theater({ name, url }) {
  return (
    <div className={ wrapper }>
      <Video url={ url } controls />
      <Heading>{ name }</Heading>
    </div>
  );
};
