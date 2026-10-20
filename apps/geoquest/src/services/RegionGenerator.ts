export function generateClueRegion(
  answerLat: number,
  answerLng: number,
): { polygon: GeoJSON.Polygon; centerLat: number; centerLng: number } {
  const offsetBearing = Math.random() * 360;
  const offsetDistance = 200 + Math.random() * 500;

  const metersPerDegreeLat = 111320;
  const metersPerDegreeLng = 111320 * Math.cos((answerLat * Math.PI) / 180);

  const centerLat =
    answerLat +
    (offsetDistance * Math.cos((offsetBearing * Math.PI) / 180)) / metersPerDegreeLat;
  const centerLng =
    answerLng +
    (offsetDistance * Math.sin((offsetBearing * Math.PI) / 180)) / metersPerDegreeLng;

  const numPoints = 24;
  const baseRadius = 1000;
  const coordinates: [number, number][] = [];

  for (let i = 0; i < numPoints; i += 1) {
    const baseAngle = (360 / numPoints) * i;
    const angleJitter = (Math.random() - 0.5) * 14;
    const angle = baseAngle + angleJitter;
    const radiusVariation = (Math.random() - 0.5) * 700;
    const radius = baseRadius + radiusVariation;

    const pointLat =
      centerLat + (radius * Math.cos((angle * Math.PI) / 180)) / metersPerDegreeLat;
    const pointLng =
      centerLng + (radius * Math.sin((angle * Math.PI) / 180)) / metersPerDegreeLng;
    coordinates.push([pointLng, pointLat]);
  }

  coordinates.push(coordinates[0]);

  return {
    polygon: {
      type: 'Polygon',
      coordinates: [coordinates],
    },
    centerLat,
    centerLng,
  };
}
