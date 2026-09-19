import type { SegmentRect } from './segments';

export const CSS_CLASSES = [
  'horizontal-viewport-segments-2',
  'vertical-viewport-segments-2',
  'device-posture-continuous',
  'device-posture-folded',
];

export const BAR_CLASSES = ['vertical-bars-leading', 'vertical-bars-trailing'];

export const FOLD_CLASSES = ['fold-vertical', 'fold-horizontal'];

export const FOLD_VARIABLES = ['--fold-left', '--fold-top', '--fold-width', '--fold-height'];

export function foldCssFor(
  hingeBounds: SegmentRect | undefined,
  hingeOrientation: 'horizontal' | 'vertical' | undefined,
): { variables: Record<string, string>; className: string | null } {
  if (!hingeBounds || !hingeOrientation) return { variables: {}, className: null };

  return {
    variables: {
      '--fold-left': `${hingeBounds.x}px`,
      '--fold-top': `${hingeBounds.y}px`,
      '--fold-width': `${hingeBounds.width}px`,
      '--fold-height': `${hingeBounds.height}px`,
    },
    className: `fold-${hingeOrientation}`,
  };
}

export function barClassFor(edge: 'leading' | 'trailing' | null): string | null {
  return edge ? `vertical-bars-${edge}` : null;
}

const TAB_BAR_MARGIN = 24;
const CAMERA_GAP = 15;

export function verticalTabBarBottom(cameras: SegmentRect[], viewportHeight: number): number {
  const below = cameras.filter((camera) => camera.y > viewportHeight / 2);
  const camera = below.sort((a, b) => a.width * a.height - b.width * b.height)[0];
  if (!camera) return TAB_BAR_MARGIN;
  return Math.max(TAB_BAR_MARGIN, Math.round(viewportHeight - camera.y + CAMERA_GAP));
}

export function cssFor(
  segments: SegmentRect[],
  posture: 'continuous' | 'folded',
): { variables: Record<string, string>; classes: string[] } {
  const stacked = segments.length > 1 && segments[1].y > segments[0].y;
  const variables: Record<string, string> = {};

  segments.forEach((segment, index) => {
    const suffix = stacked ? `0-${index}` : `${index}-0`;
    variables[`--viewport-segment-top-${suffix}`] = `${segment.y}px`;
    variables[`--viewport-segment-left-${suffix}`] = `${segment.x}px`;
    variables[`--viewport-segment-bottom-${suffix}`] = `${segment.y + segment.height}px`;
    variables[`--viewport-segment-right-${suffix}`] = `${segment.x + segment.width}px`;
    variables[`--viewport-segment-width-${suffix}`] = `${segment.width}px`;
    variables[`--viewport-segment-height-${suffix}`] = `${segment.height}px`;
  });

  const classes = [`device-posture-${posture}`];
  if (segments.length > 1) {
    classes.push(stacked ? 'vertical-viewport-segments-2' : 'horizontal-viewport-segments-2');
  }

  return { variables, classes };
}
