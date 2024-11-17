import { ErrorStateMatcher } from '@angular/material/core';

export class FormlessErrorStateMatcher implements ErrorStateMatcher {
  constructor(
    private readonly errorFactory: () => string | null | boolean | undefined
  ) {}

  isErrorState() {
    return (
      this.errorFactory() !== null &&
      this.errorFactory() !== undefined &&
      this.errorFactory() !== true
    );
  }
}
