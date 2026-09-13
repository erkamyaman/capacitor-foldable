import type { SizeClass } from './definitions';

const REGULAR_WIDTH = 600;
const REGULAR_HEIGHT = 480;

export function sizeClassOf(width: number, height: number): SizeClass {
  return {
    horizontal: width >= REGULAR_WIDTH ? 'regular' : 'compact',
    vertical: height >= REGULAR_HEIGHT ? 'regular' : 'compact',
  };
}
