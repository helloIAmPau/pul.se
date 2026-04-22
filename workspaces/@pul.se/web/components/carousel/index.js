import { wrapper } from './styles.module.css';

export default function Carousel({ children }) {
  return (
    <div className={ wrapper }>
      { children }
    </div>
  );
};
