import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {ExcludeValuesValidatorDirective} from './exclude-values-validator.directive';
import {NonEmptyValidatorDirective} from './non-empty-validator.directive';

@NgModule({
  imports: [FormsModule],
  declarations: [
    ExcludeValuesValidatorDirective,
    NonEmptyValidatorDirective
  ],
  exports: [
    ExcludeValuesValidatorDirective,
    NonEmptyValidatorDirective
  ]
})
export class GbValidatorsModule {
}
