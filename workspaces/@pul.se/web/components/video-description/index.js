import { useStream } from '../../contexts/stream';

import { video_description } from './styles.module.css';

export default function VideoDescription() {
  const { description } = useStream();

  return (
    <div className={ video_description }>
      { description }
    </div>
  );
};
