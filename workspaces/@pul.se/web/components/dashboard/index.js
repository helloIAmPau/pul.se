import Section from '../section';
import Heading from '../heading';
import LiveNow from '../live-now';
import StreamTable from '../stream-table';

export default function Dashboard() {
  return (
    <Section>
      <Heading>Hello!</Heading>
      <LiveNow />
      <StreamTable />
    </Section>
  );
};
