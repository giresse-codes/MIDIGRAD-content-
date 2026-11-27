import React from 'react';
import {Composition} from 'remotion';
import {DUREE, Predication01} from './predications/Predication01';
import {FPS, H, W} from './style';

export const Root: React.FC = () => (
  <>
    <Composition id="predication-01" component={Predication01} durationInFrames={Math.ceil(DUREE * FPS)} fps={FPS} width={W} height={H} />
  </>
);
