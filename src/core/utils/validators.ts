import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function notIn(
  items: any[]
): (control: AbstractControl) => ValidationErrors | null {
  return (control) => {
    if (!control.value) {
      return null;
    }
    return items.includes(control.value) ? { notIn: true } : null;
  };
}

/** Matches the backend's `SensorMacDtoIn.sensorMac` pattern: colon-separated only. */
export function macPattern(): (
  control: AbstractControl
) => ValidationErrors | null {
  return Validators.pattern(
    /^[0-9A-Fa-f]{2}(:[0-9A-Fa-f]{2}){5}$/
  );
}

/**
 * Converts common MAC address input variants (dash-separated, no separators,
 * lowercase) into the colon-separated uppercase format the backend requires,
 * so the field stays valid regardless of how the user typed or pasted it.
 */
export function normalizeMacInput(value: string): string {
  const hex = (value ?? '').replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
  if (hex.length !== 12) {
    return value;
  }
  return hex.match(/.{2}/g)!.join(':');
}
