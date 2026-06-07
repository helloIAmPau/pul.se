import { columns } from './styles.module.css';

export default function Columns({ children }) {
  return (
    <div className={ columns }>
      { children }
    </div>
  );
};
