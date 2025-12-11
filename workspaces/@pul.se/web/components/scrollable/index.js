import { scrollable } from './styles.module.css';

export default function Scrollable({ children }) {
  return (
    <div className={ scrollable }>
      { children }
    </div>
  )
};
