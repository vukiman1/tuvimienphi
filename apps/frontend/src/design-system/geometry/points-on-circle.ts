const DEGREES_TO_RADIANS = Math.PI / 180;
const FULL_TURN_DEGREES = 360;
const TOP_OF_CIRCLE_DEGREES = -90;

export interface CirclePoint {
  readonly x: number;
  readonly y: number;
}

export function pointsOnCircle(
  count: number,
  radius: number,
  startAngleDeg: number = TOP_OF_CIRCLE_DEGREES,
): readonly CirclePoint[] {
  return Array.from({ length: count }, (_, index) => {
    const angle = (startAngleDeg + (index * FULL_TURN_DEGREES) / count) * DEGREES_TO_RADIANS;
    return { x: radius * Math.cos(angle), y: radius * Math.sin(angle) };
  });
}
