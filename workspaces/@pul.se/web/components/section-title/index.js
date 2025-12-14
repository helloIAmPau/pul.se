import { wrapper, header, toolbar } from './styles.module.css';

export default function SectionTitle({ children, title }) {
  return (
    <div className={ wrapper }>
      <h1 className={ header }>{ title }</h1>
      <div className={ toolbar }>
        { children }
      </div>
    </div>
  );
}
