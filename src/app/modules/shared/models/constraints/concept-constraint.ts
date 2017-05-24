import {Constraint} from './constraint';
import {Concept} from "../concept";
import {ValueConstraint} from "./value-constraint";
import {TimeConstraint} from "./time-constraint";

export class ConceptConstraint implements Constraint {
  private _concept:Concept;
  private _values: ValueConstraint[];
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

  get values(): ValueConstraint[] {
    return this._values;
  }

  set values(value: ValueConstraint[]) {
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

    if (this.values.length > 0) {
      if (this._concept.type == 'NUMERIC') {
        // Add numerical values directly to the main constraint
        for (let value of this.values) {
          args.push({
            type: "value",
            valueType: value.valueType,
            operator: value.operator,
            value: value.value
          });
        }
      }
      if (this._concept.type == 'CATEGORICAL_OPTION') {
        // Wrap categorical values in an OR constraint
        args.push({
          type: "or",
          args: this.values.map((value: ValueConstraint) => value.toQueryObject())
        })
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
