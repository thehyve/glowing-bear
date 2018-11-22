import { Directive, Input } from '@angular/core';
import { NG_VALIDATORS, Validator, FormControl, ValidationErrors} from '@angular/forms';

@Directive({
  selector: '[gbExcludeValues]',
  providers: [
    {provide: NG_VALIDATORS, useExisting: ExcludeValuesValidatorDirective, multi: true}
  ]
})
export class ExcludeValuesValidatorDirective implements Validator {

  @Input()
  gbExcludeValues: string[];

  constructor() {
  }

  validate(c: FormControl): ValidationErrors | null {
    if (!c.value || !this.gbExcludeValues) {
      return null;
    }
    // Check if the current value is not in the list of values to exclude
    if (!this.gbExcludeValues.includes(c.value.trim())) {
      return null;
    }
    return {
      gbExcludeValues: {
        valid: false
      }
    };
  }

}
