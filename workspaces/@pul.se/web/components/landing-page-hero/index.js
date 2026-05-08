import { useCallback } from 'react';

import { GithubLogoIcon } from '@phosphor-icons/react';

import Heading from '../heading';
import Button from '../button';

import { wrapper, tag_line, heading, button_line, description } from './styles.module.css';

export default function LandingPageHero() {
  const onGithubClick = useCallback(function() {
    window.open('https://github.com/helloIAmPau/pul.se');
  }, []);

  const onGetStartedClick = useCallback(function() {
    navigation.navigate('/dashboard');
  }, [])

  return (
    <div className={ wrapper }>
      <div className={ tag_line }>
        open-source &#183; self-hosted &#183; saas
      </div>
      <div>
        <Heading className={ heading }>Your stream.</Heading>
        <Heading className={ heading }>Your server.</Heading>
      </div>
      <div className={ description }>
        <div>pul.se is an open-source, self-hosted live streaming platform.</div>
        <div>Broadcasters push a video stream via RTMP (from OBS, ffmpeg, or any compatible encoder).</div>
        <div>Viewers watch it live or on-demand using HLS.</div>
        <div>All recordings are stored automatically on S3 compatible storage and available as VOD after the broadcast ends.</div>
      </div>
      <div className={ button_line }>
        <Button accent onClick={ onGetStartedClick }>Get Started</Button>
        <Button onClick={ onGithubClick }><GithubLogoIcon weight='bold' /> View on Github</Button>
      </div>
    </div>
  );
};
