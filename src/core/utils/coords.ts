import { LatLong } from '../../domain/models/lat_long';

export default function isClockwise(coords: LatLong[]): boolean {
  let sum = 0;

  const n = coords.length;
  for (let i = 0; i < n; i++) {
    const current = coords[i];
    const next = coords[(i + 1) % n];
    sum +=
      (next.longitude - current.longitude) * (next.latitude + current.latitude);
  }

  return sum > 0;
}
