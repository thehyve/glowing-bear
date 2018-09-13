/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {QuerySubscriptionFrequency} from '../query-models/query-subscription-frequency';

/**
 * Representation of a query model returned from tranSMART
 */
export class TransmartQuery {

  public id?: string;
  public name?: string;
  // The date of the query creation
  public createDate?: string;
  // The date of a last query update
  public updateDate?: string;
  // Indicate if the set is bookmarked
  public bookmarked?: boolean;
  // The patient constraint part of the query
  public patientsQuery?: object;
  // The observation constraint part of the query
  public observationsQuery?: { data: string[] };
  // Additional information about the query, e.g. a data table state
  public queryBlob?: object;
  // Rest API version
  public apiVersion?: string;
  // Indicate if the set is subscribed
  public subscribed?: boolean;
  // The frequency of the subscription: daily or monthly
  public subscriptionFreq?: QuerySubscriptionFrequency;

  constructor(queryName: string) {
    this.name = queryName;
    this.bookmarked = false;
    this.subscribed = false;
  }
}
