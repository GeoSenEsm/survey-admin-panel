/**
 * `none` and `manual` are always-present fallback sensor types (see `SensorTypeCodes` on the
 * backend), not physical devices: `none` blocks sensor data entirely and `manual` is the implicit
 * fallback used whenever no device connects. Neither should ever be offered as a choice in a
 * "pick a sensor" UI (device registration, active sensor sources, parameter sources, etc.).
 */
const NON_SELECTABLE_SENSOR_TYPE_CODES = new Set(['none', 'manual']);

export function isSelectableSensorTypeCode(code: string | undefined | null): boolean {
  return !!code && !NON_SELECTABLE_SENSOR_TYPE_CODES.has(code);
}

export function excludeNonSelectableSensorTypes<T extends { code: string }>(
  sensorTypes: T[]
): T[] {
  return sensorTypes.filter((sensorType) => isSelectableSensorTypeCode(sensorType.code));
}
