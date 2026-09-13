import type { FoldState } from './definitions';

export interface SegmentRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

const EDGE_TOLERANCE = 1;

export function splitViewport(fold: FoldState | null, width: number, height: number): SegmentRect[] {
  const whole = [{ x: 0, y: 0, width, height }];

  const hinge = fold?.hingeBounds;
  if (!fold?.isSeparating || !hinge) return whole;

  if (fold.hingeOrientation === 'vertical') {
    const right = hinge.x + hinge.width;
    const spansHeight = hinge.y <= EDGE_TOLERANCE && hinge.y + hinge.height >= height - EDGE_TOLERANCE;
    if (!spansHeight || hinge.x <= 0 || right >= width) return whole;

    return [
      { x: 0, y: 0, width: hinge.x, height },
      { x: right, y: 0, width: width - right, height },
    ];
  }

  const bottom = hinge.y + hinge.height;
  const spansWidth = hinge.x <= EDGE_TOLERANCE && hinge.x + hinge.width >= width - EDGE_TOLERANCE;
  if (!spansWidth || hinge.y <= 0 || bottom >= height) return whole;

  return [
    { x: 0, y: 0, width, height: hinge.y },
    { x: 0, y: bottom, width, height: height - bottom },
  ];
}
