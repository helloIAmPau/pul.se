import { VideoCameraIcon, MonitorPlayIcon, FilmReelIcon, UsersThreeIcon } from '@phosphor-icons/react';

import LandingPageSection from '../landing-page-section';
import LandingPageFeature from '../landing-page-feature';

import { wrapper } from './styles.module.css';

export default function LandingPageFeatures() {
  return (
    <LandingPageSection className={ wrapper } title='Everything you need to go live' pretitle='features'>
      <LandingPageFeature icon={ <VideoCameraIcon /> } title='RTMP Ingest'>
        Push live stream from OBS, ffmpeg or any RTMP-compatible encoder. Standard stream keys, no special software needed.
      </LandingPageFeature>
      <LandingPageFeature icon={ <MonitorPlayIcon /> } title='HLS Delivery'>
        RTMP is converted to HLS in real time. Viewers get low-latency playback directly in the browser with no plugins.
      </LandingPageFeature>
      <LandingPageFeature icon={ <FilmReelIcon /> } title='Auto Recording'>
        Every broadcast is saved as VOD automatically. Go back and watch anything, share recordings with a link.
      </LandingPageFeature>
      <LandingPageFeature icon={ <UsersThreeIcon /> } title='Multi-user'>
        Each user manages their own streams and recordings. Sign In with Google and stream indepedently.
      </LandingPageFeature>
    </LandingPageSection>
  );
};
