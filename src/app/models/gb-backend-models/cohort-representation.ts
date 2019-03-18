/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {CohortSubscriptionFrequency} from '../cohort-models/cohort-subscription-frequency';
import {TransmartConstraint} from '../transmart-models/transmart-constraint';

export class CohortBlob {
  queryConstraintFull: TransmartConstraint;
}

/**
 * Representation of a query model returned from gb-backend
 */
export class CohortRepresentation {

  id?: string;
  name?: string;
  description?: string;
  // The date of the query creation
  createDate?: string;
  // The date of a last query update
  updateDate?: string;
  // Indicate if the set is bookmarked
  bookmarked?: boolean;
  // The patient constraint part of the query
  queryConstraint?: TransmartConstraint;
  // Additional information about the query, e.g. tree nodes information
  queryBlob?: CohortBlob;
  // Rest API version
  apiVersion?: string;
  // Indicate if the set is subscribed
  subscribed?: boolean;
  // The frequency of the subscription: daily or monthly
  subscriptionFreq?: CohortSubscriptionFrequency;
  // Type of the cohort, specifies a subject dimension that the cohort is related to
  // and (optionally) the type of subjects for the subscription
  subjectDimension: string;

  constructor(queryName: string, subjectDimension: string) {
    this.name = queryName;
    this.subjectDimension = subjectDimension;
    this.bookmarked = false;
    this.subscribed = false;
  }

}
