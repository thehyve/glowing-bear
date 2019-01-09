/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CohortSubscriptionFrequency} from '../cohort-models/cohort-subscription-frequency';

/**
 * Representation of a query model returned from gb-backend
 */
export class GbBackendQuery {

  public id?: string;
  public name?: string;
  // The date of the query creation
  public createDate?: string;
  // The date of a last query update
  public updateDate?: string;
  // Indicate if the set is bookmarked
  public bookmarked?: boolean;
  // The patient constraint part of the query
  public queryConstraint?: object;
  // Additional information about the query, e.g. a data table state
  public queryBlob?: object;
  // Rest API version
  public apiVersion?: string;
  // Indicate if the set is subscribed
  public subscribed?: boolean;
  // The frequency of the subscription: daily or monthly
  public subscriptionFreq?: CohortSubscriptionFrequency;
  // Type of the cohort, specifies a subject dimension that the cohort is related to
  // and (optionally) the type of subjects for the subscription
  public subjectDimension: string;

  constructor(queryName: string) {
    this.name = queryName;
    this.bookmarked = false;
    this.subscribed = false;
    this.subjectDimension = 'patient' // TODO TMT-729
  }
}