import Heading from '../heading';
import Scrollable from '../scrollable';
import LiveNow from '../live-now';

import { wrapper } from './styles.module.css';

export default function Dashboard() {
  return (
    <Scrollable className={ wrapper }>
      <Heading>Hello!</Heading>
      <LiveNow />
    </Scrollable>
  );
};
