/**
 * `none` and `manual` are always-present fallback sensor types (see `SensorTypeCodes` on the
 * backend), not physical devices: `none` blocks sensor data entirely and `manual` is a formal,
 * admin-configurable fallback source (see `isSelectableAsParameterSource` for that one context).
 * Neither should be offered as a choice when picking a *physical* sensor (device registration,
 * respondent assignment, the Integrations enable/disable list, etc.).
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

/**
 * A used sensor data parameter's list of *sources* is the one place `manual` belongs alongside
 * physical sensor types: it's a formal, priority-ordered fallback like any other source, not a
 * separate always-on mechanism (see `SensorParameterSource` in `survey-settings.ts` and the
 * mobile `SensorParameterDefinition.sourceFor` / manual-entry gap-filling it drives). `none` still
 * never applies here — it isn't a data source, it's "sensor data is off."
 */
export function isSelectableAsParameterSource(code: string | undefined | null): boolean {
  return !!code && code !== 'none';
}
