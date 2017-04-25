import {Constraint} from './constraint';
import {Concept} from "../concept";
import {Value} from "./value";

export class ConceptConstraint implements Constraint {

  private _concept:Concept;
  private _values: Value[];

  constructor() {

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
    return ConceptConstraint.name;
  }

  toQueryObject(): Object { console.log('to query obj with concept: ', this._concept, this._values);
    return {
      type: "concept",
      path: this.concept.path
    };

    // return {
    //   type: "and",
    //   args: [
    //     {
    //       type: "_concept",
    //       path: this._concept.path
    //     },
    //     {"type": "_concept", "path":" \\Public Studies\\EHR\\Vital Signs\\Heart Rate\\"}
    //   ]
    // }
  }

  get textRepresentation(): string {
    if (this._concept) {
      return `Concept: ${this._concept.path}`;
    }
    return 'Concept';
  }
}
