/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Cohort} from '../models/cohort-models/cohort';
import {GbBackendQuery} from '../models/gb-backend-models/gb-backend-query';
import {TransmartConstraintMapper} from './transmart-utilities/transmart-constraint-mapper';

export class GbBackendMapper {


  public static mapGbBackendQueries(gbBackendQueries: GbBackendQuery[]): Cohort[] {
    let queries: Cohort[] = [];
    gbBackendQueries.forEach(tmQuery => {
      try {
        let query = this.mapGbBackendQuery(tmQuery);
        queries.push(query);
      } catch (err) {
        console.error(`Error while mapping query: ${tmQuery.name}`, tmQuery);
      }
    });
    return queries;
  }

  public static mapGbBackendQuery(gbBackendQuery: GbBackendQuery): Cohort {
    let query = new Cohort(gbBackendQuery.id, gbBackendQuery.name);
    query.type = gbBackendQuery.subjectDimension;
    query.createDate = gbBackendQuery.createDate;
    query.updateDate = gbBackendQuery.updateDate;
    query.bookmarked = gbBackendQuery.bookmarked;
    query.constraint = TransmartConstraintMapper.generateConstraintFromObject(gbBackendQuery.queryBlob['queryConstraintFull']);
    query.apiVersion = gbBackendQuery.apiVersion;
    query.subscribed = gbBackendQuery.subscribed;
    query.subscriptionFreq = gbBackendQuery.subscriptionFreq;
    return query;
  }

  public static mapQuery(query: Cohort): GbBackendQuery {
    let transmartQuery: GbBackendQuery = new GbBackendQuery(query.name, query.type);
    transmartQuery.queryConstraint = TransmartConstraintMapper.mapConstraint(query.constraint, false);
    transmartQuery.queryBlob = {};
    transmartQuery.queryBlob['queryConstraintFull'] = TransmartConstraintMapper.mapConstraint(query.constraint, true);

    return transmartQuery;
  }

}
