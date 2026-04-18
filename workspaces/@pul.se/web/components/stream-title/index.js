import { useStream } from '../../contexts/stream';

import { wrapper } from './styles.module.css';

export default function StreamTitle() {
  const { name } = useStream();

  return (
    <div className={ wrapper }>
      <h1>{ name }</h1>
    </div>
  );
};
