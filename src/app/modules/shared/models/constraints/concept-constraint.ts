import {Constraint} from './constraint';
import {Concept} from "../concept";
import {Value} from "../value";
import {TimeConstraint} from "./time-constraint";


export class ConceptConstraint implements Constraint {
  
  private _concept:Concept;
  private _values: Value[];
  applyDateConstraint: boolean = false;
  timeConstraint: TimeConstraint = new TimeConstraint();

  constructor() {
    this.values = [];
  }

  get concept(): Concept {
    return this._concept;
  }

  set concept(value: Concept) {
    this._concept = value;
  }

  get values(): Value[] {
    return this._values;
  }

  set values(value: Value[]) {
    this._values = value;
  }

  getClassName(): string {
    return 'ConceptConstraint';
  }

  toQueryObject(): Object {
    let args = [];
    args.push({
      type: 'concept',
      path: this._concept.path
    });

    if(this.values) {
      for(let value of this.values) {
        args.push({
          type: "value",
          valueType: value.valueType,
          operator: value.operator,
          value: value.value
        });
      }
    }

    if (this.applyDateConstraint) {
      args.push(this.timeConstraint.toQueryObject());
    }

    return {
      type: "and",
      args: args
    };
  }

  get textRepresentation(): string {
    if (this._concept) {
      return `Concept: ${this._concept.path}`;
    }
    return 'Concept';
  }

}
