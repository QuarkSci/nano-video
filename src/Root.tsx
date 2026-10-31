import W from './warp.json';
import React from 'react';
import {Composition} from 'remotion';
import {GLTest} from './scenes/GLTest';
import {LookDev} from './scenes/LookDev';
import {TestClip} from './scenes/TestClip';
import {LookDev2} from './scenes/LookDev2';
import {TestClip2} from './scenes/TestClip2';
import {Ch2} from './scenes/Ch2';
import {Ch3} from './scenes/Ch3';
import {Ch4} from './scenes/Ch4';
import {Ch5} from './scenes/Ch5';
import {Ch6} from './scenes/Ch6';
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="GLTest" component={GLTest} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="LookDev" component={LookDev} durationInFrames={30} fps={30} width={1080} height={1920} />
    <Composition id="TestClip" component={TestClip} durationInFrames={270} fps={30} width={1080} height={1920} />
    <Composition id="LookDev2" component={LookDev2} durationInFrames={4} fps={30} width={1080} height={1920} />
    <Composition id="TestClip2" component={TestClip2} durationInFrames={(W as any).durations?.TestClip2 ?? 300} fps={30} width={1080} height={1920} />
    <Composition id="Ch2" component={Ch2} durationInFrames={(W as any).durations?.Ch2 ?? 300} fps={30} width={1080} height={1920} />
    <Composition id="Ch3" component={Ch3} durationInFrames={(W as any).durations?.Ch3 ?? 270} fps={30} width={1080} height={1920} />
    <Composition id="Ch4" component={Ch4} durationInFrames={(W as any).durations?.Ch4 ?? 240} fps={30} width={1080} height={1920} />
    <Composition id="Ch5" component={Ch5} durationInFrames={(W as any).durations?.Ch5 ?? 300} fps={30} width={1080} height={1920} />
    <Composition id="Ch6" component={Ch6} durationInFrames={(W as any).durations?.Ch6 ?? 300} fps={30} width={1080} height={1920} />
  </>
);
