import {Constraint} from './constraint';
import {Concept} from '../concept';
import {ValueConstraint} from './value-constraint';
import {TimeConstraint} from './time-constraint';
import {TrialVisitConstraint} from './trial-visit-constraint';

export class ConceptConstraint implements Constraint {
  private _concept: Concept;
  // the value constraints used for numeric or categorical values of this concept
  private _values: ValueConstraint[];
  // the time constraint used for date type constraint of this concept
  private _valDateConstraint: TimeConstraint;
  private _applyValDateConstraint = false;

  // observation date range
  private _applyObsDateConstraint = false;
  private _obsDateConstraint: TimeConstraint;

  // trial visit
  private _applyTrialVisitConstraint = false;
  private _trialVisitConstraint: TrialVisitConstraint;


  constructor() {
    this.values = [];
    this.valDateConstraint = new TimeConstraint();
    this.valDateConstraint.dimension = 'value';
    this.obsDateConstraint = new TimeConstraint();
    this.obsDateConstraint.dimension = 'start time';
    this.trialVisitConstraint = new TrialVisitConstraint();
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

  toPatientQueryObject(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  toQueryObject(): Object {
    // When no concept is selected, we cannot create a query object (it should be ignored)
    if (!this.concept) {
      return null;
    }

    let args = [];
    args.push({
      type: 'concept',
      conceptCode: this.concept.code,
      name: this.concept.name,
      fullName: this.concept.fullName,
      conceptPath: this.concept.path,
      valueType: this.concept.type
    });

    if (this.values.length > 0) {
      if (this.concept.type === 'NUMERIC') {
        // Add numerical values directly to the main constraint
        for (let value of this.values) {
          args.push(value.toQueryObject());
        }
      } else if (this.concept.type === 'CATEGORICAL') {
        // Wrap categorical values in an OR constraint
        args.push({
          type: 'or',
          args: this.values.map((value: ValueConstraint) => value.toQueryObject())
        });
      }
    }

    if (this.applyValDateConstraint) {
      args.push(this.valDateConstraint.toQueryObject());
    }

    if (this.applyObsDateConstraint) {
      args.push(this.obsDateConstraint.toQueryObject());
    }

    if (this.applyTrialVisitConstraint) {
      args.push(this.trialVisitConstraint.toQueryObject());
    }

    return {
      type: 'and',
      args: args
    };
  }

  get textRepresentation(): string {
    if (this.concept) {
      return `Concept: ${this.concept.label}`;
    }
    return 'Concept';
  }

  get valDateConstraint(): TimeConstraint {
    return this._valDateConstraint;
  }

  set valDateConstraint(value: TimeConstraint) {
    this._valDateConstraint = value;
  }

  get applyObsDateConstraint(): boolean {
    return this._applyObsDateConstraint;
  }

  set applyObsDateConstraint(value: boolean) {
    this._applyObsDateConstraint = value;
  }

  get obsDateConstraint(): TimeConstraint {
    return this._obsDateConstraint;
  }

  set obsDateConstraint(value: TimeConstraint) {
    this._obsDateConstraint = value;
  }

  get applyTrialVisitConstraint(): boolean {
    return this._applyTrialVisitConstraint;
  }

  set applyTrialVisitConstraint(value: boolean) {
    this._applyTrialVisitConstraint = value;
  }

  get trialVisitConstraint(): TrialVisitConstraint {
    return this._trialVisitConstraint;
  }

  set trialVisitConstraint(value: TrialVisitConstraint) {
    this._trialVisitConstraint = value;
  }

  get applyValDateConstraint(): boolean {
    return this._applyValDateConstraint;
  }

  set applyValDateConstraint(value: boolean) {
    this._applyValDateConstraint = value;
  }
}
