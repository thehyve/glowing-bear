/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import {SurvivalResultsService} from '../../services/survival-results.service';

@Injectable()
export class GbSurvivalResultsGuard implements CanActivate {

  constructor(private router: Router, private survivalResultsService: SurvivalResultsService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    let urlTokens = state.url.split('/')
    let resultIDString = urlTokens[urlTokens.length - 1]
    let resultID = parseInt(resultIDString, 10)

    if ((isNaN(resultID)) || (resultID <= 0) || (resultID > this.survivalResultsService.survivalResults.length)) {
      console.log(`${resultIDString} not in survival results, redirect to /analysis ...`)
      this.router.navigateByUrl('/analysis')
      return false
    }

    return true
  }
}
