import { section, title_section, content_section } from './styles.module.css';

export default function FormSection({ children, title }) {
  return (
    <div className={ section }>
      <div className={ title_section }>
        <h1>{ title }</h1>
      </div>
      <div className={ content_section }>
        { children }
      </div>
    </div>
  );
};
