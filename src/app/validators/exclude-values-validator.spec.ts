import {ExcludeValuesValidatorDirective} from './exclude-values-validator.directive';
import {FormControl} from '@angular/forms';

describe('ExcludeValuesValidatorDirective', () => {

  const validator = new ExcludeValuesValidatorDirective();
  const invalidResultObj = {
    gbExcludeValues: {
      valid: false
    }
  };

  it('should validate any value when passing an empty list of values', () => {
    validator.gbExcludeValues = null;
    expect(validator.validate(new FormControl('Test'))).toEqual(null);
    expect(validator.validate(new FormControl(''))).toEqual(null);
    expect(validator.validate(new FormControl(null))).toEqual(null);
    validator.gbExcludeValues = [];
    expect(validator.validate(new FormControl('Test'))).toEqual(null);
    expect(validator.validate(new FormControl(''))).toEqual(null);
    expect(validator.validate(new FormControl(null))).toEqual(null);
  });

  it('should validate an input when passing a list of distinct values', () => {
    validator.gbExcludeValues = ['Test', 'A B C', 'Invalid'];
    expect(validator.validate(new FormControl('Valid'))).toEqual(null);
    expect(validator.validate(new FormControl(''))).toEqual(null);
    expect(validator.validate(new FormControl(null))).toEqual(null);
  });

  it('should not validate an input which is included in the list of values', () => {
    validator.gbExcludeValues = ['Test', 'A B C', 'Invalid'];
    expect(validator.validate(new FormControl('Test'))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl(' Test'))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('Test '))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('   Test   '))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('A B C'))).toEqual(invalidResultObj);
    expect(validator.validate(new FormControl('Invalid'))).toEqual(invalidResultObj);
  });

});
