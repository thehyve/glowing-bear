/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, OnInit} from '@angular/core';
import {FormatHelper} from '../../utilities/format-helper';
import {QueryService} from '../../services/query.service';
import {ExploreQueryType} from '../../models/query-models/explore-query-type';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';

@Component({
  selector: 'gb-explore',
  templateUrl: './gb-explore.component.html',
  styleUrls: ['./gb-explore.component.css']
})
export class GbExploreComponent implements OnInit {

  constructor(public queryService: QueryService) {
  }

  ngOnInit() {
  }

  get globalCount(): Observable<string> {
    return this.queryService.queryResults.pipe(map((queryResults) =>
      queryResults ? FormatHelper.formatCountNumber(queryResults.globalCount) : '0'
    ));
  }

  get availableQueryTypes(): ExploreQueryType[] {
    return this.queryService.availableExploreQueryTypes;
  }

  get selectedQueryType(): ExploreQueryType {
    return this.queryService.query.type;
  }

  set selectedQueryType(queryType: ExploreQueryType) {
    this.queryService.query.type = queryType;
  }

  execQuery(event) {
    event.stopPropagation();
    this.queryService.execQuery();
  }

}
