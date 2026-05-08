import Heading from '../heading';
import LiveNow from '../live-now';
import StreamTable from '../stream-table';

import { wrapper } from './styles.module.css';

export default function Dashboard() {
  return (
    <div className={ wrapper }>
      <Heading>Hello!</Heading>
      <LiveNow />
      <StreamTable />
    </div>
  );
};
