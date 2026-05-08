import LandingPageHero from '../landing-page-hero';
import LandingPageFeatures from '../landing-page-features';
import LandingPageHosting from '../landing-page-hosting';
import Hr from '../hr';
import Footer from '../footer';

import { wrapper } from './styles.module.css';

export default function LandingPage() {
  return (
    <div className={ wrapper }>
      <LandingPageHero />
      <Hr />
      <LandingPageFeatures />
      <Hr />
      <LandingPageHosting />
      <Footer />
    </div>
  );
};
