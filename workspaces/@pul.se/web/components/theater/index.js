import { StreamSessionProvider } from '../../contexts/stream-session';

import StreamTitle from '../stream-title';
import StreamPlayer from '../stream-player';

import { wrapper } from './styles.module.css';

export default function Theater() {
  return (
    <StreamSessionProvider>
      <div className={ wrapper }>
        <StreamTitle />
        <StreamPlayer />
      </div>
    </StreamSessionProvider>
  );
};
