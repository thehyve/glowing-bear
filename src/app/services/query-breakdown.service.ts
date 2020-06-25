/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Injectable } from '@angular/core';
import { QueryBreakdown } from '../models/breakdown-models/breakdown';
import { BreakdownType } from 'app/models/breakdown-models/breakdown-type';

@Injectable()
export class QueryBreakdownService {
  private queryBreakdown : QueryBreakdown


  constructor() {
    this.queryBreakdown= new QueryBreakdown()
  }

  retrieve(id: string) : {
    breakdownType: BreakdownType;
    selected: boolean;
}{
    return this.queryBreakdown.retrieve(id)
  }

  change(id: string) : void{
    this.queryBreakdown.change(id)
  }
  
}
