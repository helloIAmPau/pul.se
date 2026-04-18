import { StreamProvider } from '../../contexts/stream';

import StreamTitle from '../stream-title';
import StreamPlayer from '../stream-player';

import { wrapper } from './styles.module.css';

export default function Theater() {
  return (
    <StreamProvider>
      <div className={ wrapper }>
        <StreamTitle />
        <StreamPlayer />
      </div>
    </StreamProvider>
  );
};
