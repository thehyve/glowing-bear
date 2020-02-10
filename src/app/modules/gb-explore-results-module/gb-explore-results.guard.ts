/**
 * Copyright 2020 EPFL LDS
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {QueryService} from '../../services/query.service';
import {Observable} from 'rxjs';
import {map, tap} from 'rxjs/operators';

/**
 * Activation guard for GbExploreResultsModule preventing activation if no results are available for display.
 */
@Injectable()
export class GbExploreResultsGuard implements CanActivate {

  constructor(private router: Router,
              private queryService: QueryService) {
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.queryService.displayExploreResultsComponent.pipe(tap((display) => {
      if (!display) {
        console.log('No results available for display, redirecting ...');
        this.router.navigateByUrl('/explore');
      }
    }));
  }
}
