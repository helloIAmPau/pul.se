import { useStream } from '../../contexts/stream';

import Video from '../video';

export default function StreamPlayer() {
  const { url, state } = useStream();

  console.log(state);

  if(state !== 'PLAY') {
    return (
      <h1>Your video will start soon</h1>
    );
  }

  return (
    <Video url={ url } controls />
  );
};
