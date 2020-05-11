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
