import { wrapper, video_element } from './styles.module.css';

export default function Video({ url }) {
  return (
    <div className={ wrapper }>
      <video controls className={ video_element } autoplay>
        <source src={ url } type='application/x-mpegURL' />
      </video>
    </div>
  );
};
