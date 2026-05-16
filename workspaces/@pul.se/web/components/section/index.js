import { wrapper } from './styles.module.css';

export default function Section({ children }) {
  return (
    <div className={ wrapper }>
      { children }
    </div>
  );
};
