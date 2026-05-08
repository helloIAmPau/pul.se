import { useStreamSession } from '../../contexts/stream-session';

import Heading from '../heading';

export default function StreamTitle() {
  const { name } = useStreamSession();

  return (
    <Heading>{ name }</Heading>
  );
};
