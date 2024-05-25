import { ErrorStateMatcher } from "@angular/material/core";

export class FormlessErrorStateMatcher implements ErrorStateMatcher {
    constructor(private readonly errorFactory: () => string | null){
    }

    isErrorState() {
        return this.errorFactory() !== null;
    }
}