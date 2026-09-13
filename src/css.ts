import type { SegmentRect } from './segments';

export const CSS_CLASSES = [
  'horizontal-viewport-segments-2',
  'vertical-viewport-segments-2',
  'device-posture-continuous',
  'device-posture-folded',
];

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
