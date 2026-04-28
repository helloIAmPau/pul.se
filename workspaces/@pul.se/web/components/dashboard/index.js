import Heading from '../heading';
import Scrollable from '../scrollable';
import LiveNow from '../live-now';
import StreamTable from '../stream-table';

import { wrapper } from './styles.module.css';

export default function Dashboard() {
  return (
    <Scrollable className={ wrapper }>
      <Heading>Hello!</Heading>
      <LiveNow />
      <StreamTable />
    </Scrollable>
  );
};
