import {FormControl} from '@angular/forms';
import {NonEmptyValidatorDirective} from './non-empty-validator.directive';

describe('NonEmptyValidatorDirective', () => {

  const validator = new NonEmptyValidatorDirective();
  const invalidResultObj = {
    gbNonEmpty: {
      valid: false
    }
  };

  it('should validate null values', () => {
    expect(validator.validate(new FormControl(null))).toEqual(null);
  });

  it('should validate any non-empty value', () => {
    expect(validator.validate(new FormControl('Test'))).toEqual(null);
    expect(validator.validate(new FormControl(' Test   '))).toEqual(null);
    expect(validator.validate(new FormControl('\tFoo\tBar'))).toEqual(null);
  });

  it('should not validate an input which only contains whitespace', () => {
    expect(validator.validate(new FormControl(''))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl(' '))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('      '))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('   \t   '))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('  \n \t '))).toEqual(invalidResultObj);
  });

});
