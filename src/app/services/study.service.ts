/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Study} from '../models/constraint-models/study';
import {ResourceService} from './resource.service';
import {Injectable} from '@angular/core';
import {AsyncSubject, Observable} from 'rxjs';
import {map} from 'rxjs/operators';

/**
 * This service loads all studies at startup and makes them available
 * for other components.
 */
@Injectable({
  providedIn: 'root',
})
export class StudyService {

  private _loaded: AsyncSubject<boolean> = new AsyncSubject<boolean>();
  private _studies: Study[] = [];
  private _existsPublicStudy = false;
  private _existsTrialVisitDimension = false;

  constructor(private resourceService: ResourceService) {
    this.loadStudies();
  }

  private loadStudies() {
    this.resourceService.getStudies()
      .subscribe(
        (studies: Study[]) => {
          this.studies = studies;
          this._existsPublicStudy = studies.some((study: Study) => study.public);
          this._existsTrialVisitDimension = studies.some((study: Study) =>
            study.dimensions.includes('trial visit')
          );
          this._loaded.next(true);
          this._loaded.complete();
        },
        err => {
          console.error(err);
          this._loaded.next(false);
          this._loaded.complete();
        }
      );
  }

  get studies(): Study[] {
    return this._studies;
  }

  set studies(value: Study[]) {
    this._studies = value;
  }

  get studiesLoaded(): AsyncSubject<boolean> {
    return this._loaded;
  }

  get existsPublicStudy(): Observable<boolean> {
    return this._loaded.asObservable().pipe(map(() =>
        this._existsPublicStudy
    ));
  }

  get existsTrialVisitDimension(): Observable<boolean> {
    return this._loaded.asObservable().pipe(map(() =>
      this._existsTrialVisitDimension
    ));
  }

}
