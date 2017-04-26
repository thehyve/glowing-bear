import {Constraint} from './constraint';
import {Concept} from "../concept";
import {Value} from "../value";

export class ConceptConstraint implements Constraint {

  private _type: string;
  private _concept:Concept;
  private _values: Value[];

  constructor() {
    this._type = 'ConceptConstraint';
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

  getConstraintType(): string {
    return this._type;
  }

  toQueryObject(): Object {
    let args = [];
    args.push({
      type: this._concept.type,
      path: this._concept.path
    });

    if(this.values) {
      for(let value of this.values) {
        args.push({
          type: value.type,
          valueType: value.valueType,
          operator: value.operator,
          value: value.value
        });
      }
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
