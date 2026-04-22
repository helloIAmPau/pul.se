import { useStream } from '../../contexts/stream';

import Heading from '../heading';

export default function StreamTitle() {
  const { name } = useStream();

  return (
    <Heading>{ name }</Heading>
  );
};
