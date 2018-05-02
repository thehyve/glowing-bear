import {Injectable} from '@angular/core';
import {CrossTable} from '../models/table-models/cross-table';
import {ConceptConstraint} from '../models/constraint-models/concept-constraint';
import {Concept} from '../models/constraint-models/concept';
import {CategoricalAggregate} from '../models/constraint-models/categorical-aggregate';

@Injectable()
export class CrossTableService {

  private _crossTable: CrossTable;

  constructor() {
    this.crossTable = new CrossTable();
    this.mockData();
  }

  mockData() {
    let c1 = new Concept();
    c1.name = 'Race';
    c1.type = 'CATEGORICAL';
    let agg1 = new CategoricalAggregate();
    agg1.valueCounts.set('caucasian', 100);
    agg1.valueCounts.set('latino', 200);
    c1.aggregate = agg1;
    let c2 = new Concept();
    c1.name = 'Gender';
    c1.type = 'CATEGORICAL';
    let agg2 = new CategoricalAggregate();
    agg2.valueCounts.set('male', 300);
    agg2.valueCounts.set('female', 400);
    c2.aggregate = agg2;
    let rc = new ConceptConstraint();
    rc.concept = c1;
    let cc = new ConceptConstraint();
    cc.concept = c2;
    this.crossTable.rowConstraints.push(rc);
    this.crossTable.columnConstraints.push(cc);
  }

  get crossTable(): CrossTable {
    return this._crossTable;
  }

  set crossTable(value: CrossTable) {
    this._crossTable = value;
  }
}
