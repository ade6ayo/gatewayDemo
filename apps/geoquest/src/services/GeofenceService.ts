import { booleanPointInPolygon, point } from '@turf/turf';
import type { Polygon } from 'geojson';

export function isUserInsideRegion(
  userLat: number,
  userLng: number,
  region: Polygon,
): boolean {
  const userPoint = point([userLng, userLat]);
  return booleanPointInPolygon(userPoint, region);
}
