/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Cohort} from '../../models/cohort-models/cohort';
import {CohortRepresentation} from '../../models/gb-backend-models/cohort-representation';
import {TransmartConstraintMapper} from '../transmart-utilities/transmart-constraint-mapper';

export class CohortMapper {

  static serialise(cohort: Cohort): CohortRepresentation {
    const obj: CohortRepresentation = new CohortRepresentation(cohort.name, cohort.type);
    obj.id = cohort.id;
    obj.name = cohort.name;
    obj.bookmarked = cohort.bookmarked;
    obj.subscribed = cohort.subscribed;
    obj.subjectDimension = cohort.type;
    if (cohort.subscribed) {
      obj.subscriptionFreq = cohort.subscriptionFreq;
    }
    if (cohort.description) {
      obj.description = cohort.description;
    }
    if (cohort.createDate) {
      obj.createDate = cohort.createDate;
    }
    if (cohort.updateDate) {
      obj.updateDate = cohort.updateDate;
    }
    if (cohort.constraint) {
      obj.queryConstraint = TransmartConstraintMapper.mapConstraint(cohort.constraint);
      obj.queryBlob = {
        queryConstraintFull: TransmartConstraintMapper.mapConstraint(cohort.constraint, true)
      };
    }
    return obj;
  }

  /**
   * Read a cohort from plain object.
   * @param {CohortRepresentation} obj
   * @returns {Cohort}
   */
  static deserialise(obj: CohortRepresentation): Cohort {
    const cohort = new Cohort(obj.id, obj.name);
    cohort.type = obj.subjectDimension;
    cohort.createDate = obj.createDate;
    cohort.updateDate = obj.updateDate;
    cohort.bookmarked = obj.bookmarked;
    if (obj.queryBlob) {
      cohort.constraint = TransmartConstraintMapper.generateConstraintFromObject(obj.queryBlob.queryConstraintFull);
    } else if (obj.queryConstraint) {
      cohort.constraint = TransmartConstraintMapper.generateConstraintFromObject(obj.queryConstraint);
    }
    cohort.apiVersion = obj.apiVersion;
    cohort.subscribed = obj.subscribed;
    cohort.subscriptionFreq = obj.subscriptionFreq;
    return cohort;
  }

  /**
   * Read a list of cohorts from plain objects.
   * @param {CohortRepresentation[]} list
   * @returns {Cohort[]}
   */
  public static deserialiseList(list: CohortRepresentation[]): Cohort[] {
    let cohorts: Cohort[] = [];
    list.forEach(obj => {
      try {
        let cohort = this.deserialise(obj);
        cohorts.push(cohort);
      } catch (err) {
        console.error(`Error while mapping query: ${obj.name}`, obj);
      }
    });
    return cohorts;
  }

}
