import {ElementRef} from '@angular/core';

export class UIHelper {

  /**
   * The PrimeNg library often produces unwanted loader spinning icon,
   * which needs to manually removed
   * @param {number} delay
   */
  public static removePrimeNgLoaderIcon(element: ElementRef, delay: number) {
    window.setTimeout((function () {
      let loaderIcon = element.nativeElement.querySelector('.ui-autocomplete-loader');
      if (loaderIcon) {
        loaderIcon.remove();
      }
    }).bind(this), delay);
  }
}
