import {Directive} from '@angular/core';
import {NG_VALIDATORS, Validator, AbstractControl} from '@angular/forms';

@Directive({
  selector: '[gbNonEmpty][ngModel]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: NonEmptyValidatorDirective, multi: true}
  ]
})
export class NonEmptyValidatorDirective implements Validator {

  validate(c: AbstractControl) {
    if (c.value === null || c.value === undefined) {
      return null;
    }
    // Check if the current value is not an empty string
    if (c.value.trim() === '') {
      // The value is empty, return validation error
      return {
        gbNonEmpty: {
          valid: false
        }
      };
    }
    // The value is not empty
    return null;
  }

}
