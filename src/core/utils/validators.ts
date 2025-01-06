import { AbstractControl, ValidationErrors, Validators } from '@angular/forms';

export function notIn(
  items: any[]
): (control: AbstractControl) => ValidationErrors | null {
  return (control) => {
    return items.includes(control.value) ? { notIn: true } : null;
  };
}

export function macPattern(): (
  control: AbstractControl
) => ValidationErrors | null {
  return Validators.pattern(
    /^[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}([-:])[0-9A-Fa-f]{2}$/
  );
}
