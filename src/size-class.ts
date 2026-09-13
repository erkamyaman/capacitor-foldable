import type { SizeClass } from './definitions';

const MEDIUM_WIDTH = 600;
const EXPANDED_WIDTH = 840;
const LARGE_WIDTH = 1200;
const EXTRA_LARGE_WIDTH = 1600;
const MEDIUM_HEIGHT = 480;
const EXPANDED_HEIGHT = 900;

function widthClassOf(width: number): SizeClass['widthClass'] {
  if (width >= EXTRA_LARGE_WIDTH) return 'extraLarge';
  if (width >= LARGE_WIDTH) return 'large';
  if (width >= EXPANDED_WIDTH) return 'expanded';
  if (width >= MEDIUM_WIDTH) return 'medium';
  return 'compact';
}

function heightClassOf(height: number): SizeClass['heightClass'] {
  if (height >= EXPANDED_HEIGHT) return 'expanded';
  if (height >= MEDIUM_HEIGHT) return 'medium';
  return 'compact';
}

export function sizeClassOf(width: number, height: number): SizeClass {
  return {
    horizontal: width >= MEDIUM_WIDTH ? 'regular' : 'compact',
    vertical: height >= MEDIUM_HEIGHT ? 'regular' : 'compact',
    widthClass: widthClassOf(width),
    heightClass: heightClassOf(height),
  };
}
