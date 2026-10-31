import {getInputProps} from 'remotion';
// render quality: 3D backing-store scale (1 = full 1080×1920, 0.5 = animatic). Pass --props '{"q":0.5}'
export const Q: number = +((getInputProps() as any).q ?? 1);
