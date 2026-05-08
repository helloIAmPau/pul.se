import LandingPageSection from '../landing-page-section';
import Card from '../card';

import { text, wrapper, content, card } from './styles.module.css';

export default function LandingPageHosting() {
  return (
    <div className={ wrapper }>
      <LandingPageSection className={ content } title='Hosted, ready to use'>
        <div className={ text }>Plans coming soon...</div>
      </LandingPageSection>
      <LandingPageSection className={ content } title='Self-hosted, always free'>
        <div className={ text }>Run pul.se on your own infrastructure using Docker</div>
        <div className={ card }>
          <pre children={`git clone https://github.com/helloiampau/pul.se\ncd pul.se\ndocker compose up -d` } />
        </div>
      </LandingPageSection>
    </div>
  );
};
