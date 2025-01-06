import { LatLong } from "../../domain/models/lat_long";
import isClockwise from "./coords";

describe('isClockwise', () => {
    it('should return false for anti-clockwise convex polygon', () => {
        const polygon: LatLong[] = [
            { latitude: 53.3521, longitude: 20.4949},
            { latitude: 52.4643, longitude: 18.5284 },
            { latitude: 51.5377, longitude: 18.9239 },
            { latitude: 51.8034, longitude: 21.4947 },
            { latitude: 53.3521, longitude: 20.4949},
        ];
        expect(isClockwise(polygon)).toBe(false);
    });

    it('should return true for clockwise convex polygon', () => {
        const polygon: LatLong[] = [
            { latitude: 53.3521, longitude: 20.4949},
            { latitude: 51.8034, longitude: 21.4947 },
            { latitude: 51.5377, longitude: 18.9239 },
            { latitude: 52.4643, longitude: 18.5284 },
            { latitude: 53.3521, longitude: 20.4949},
        ];
        expect(isClockwise(polygon)).toBe(true);
    });

    it('should return false for anti-clockwise concave polygon', () => {
        const polygon: LatLong[] = [
            { latitude: 53.3521, longitude: 20.4949},
            { latitude: 52.4643, longitude: 18.5284 },
            { latitude: 51.5377, longitude: 18.9239 },
            { latitude: 51.8034, longitude: 21.4947 },
            { latitude: 52.2630, longitude: 20.0005 },
            { latitude: 53.3521, longitude: 20.4949},
        ];
        expect(isClockwise(polygon)).toBe(false);
    });

    it('should return true for clockwise concave polygon', () => {
        const polygon: LatLong[] = [
            { latitude: 53.3521, longitude: 20.4949},
            { latitude: 52.2630, longitude: 20.0005 },
            { latitude: 51.8034, longitude: 21.4947 },
            { latitude: 51.5377, longitude: 18.9239 },
            { latitude: 52.4643, longitude: 18.5284 },
            { latitude: 53.3521, longitude: 20.4949},
        ];
        expect(isClockwise(polygon)).toBe(true);
    });
});
