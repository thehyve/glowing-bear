import {Constraint} from './constraint';
import {DateOperatorState} from './date-operator-state';

export class TimeConstraint implements Constraint {

  private _parent: Constraint;
  dateOperator: DateOperatorState = DateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();
  private _isSubselection: boolean;

  // the flag indicating if the constraint is negated
  private _isNegated = false;
  // the flag indicating if the constraint is related to observation date
  private _isObservationDate = false;

  constructor(operator?: string) {
    this.parent = null;
    if (operator) {
      switch (operator) {
        case '<-->': {
          this.dateOperator = DateOperatorState.BETWEEN;
          break;
        }
        case '<-': {
          this.dateOperator = DateOperatorState.BEFORE;
          break;
        }
        case '->': {
          this.dateOperator = DateOperatorState.AFTER;
          break;
        }
      }
    }
  }

  getClassName(): string {
    return 'TimeConstraint';
  }

  toQueryObjectWithSubselection(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  toQueryObjectWithoutSubselection(): object {
    // Operator
    let operator = {
      [DateOperatorState.BETWEEN]: '<-->',
      [DateOperatorState.NOT_BETWEEN]: '<-->', // we'll negate it later
      [DateOperatorState.BEFORE]: '<-',
      [DateOperatorState.AFTER]: '->'
    }[this.dateOperator];

    // Values (dates)
    let values = [this.date1.toISOString()];
    if (this.dateOperator === DateOperatorState.BETWEEN ||
      this.dateOperator === DateOperatorState.NOT_BETWEEN) {
      values.push(this.date2.toISOString());
    }

    // Construct the date constraint
    // if it is observation date, then the dimension is 'start time', otherwise 'value'
    // the 'start time' dimension applies to the observations with observed date values
    // the 'value' dimension applies to the observations with actual date values
    let dimension = this.isObservationDate ? 'start time' : 'value';
    let fieldName = this.isObservationDate ? 'startDate' : 'numberValue';
    let query: Object = {
      type: 'time',
      field: {
        dimension: dimension,
        fieldName: fieldName,
        type: 'DATE'
      },
      operator: operator,
      values: values,
      isNegated: this.isNegated,
      isObservationDate: this.isObservationDate
    };

    // Wrap date constraint in a negation if required
    if (this.dateOperator === DateOperatorState.NOT_BETWEEN) {
      query = {
        type: 'negation',
        arg: query
      };
    }

    return query;
  }

  /** Builds a query object for the date constraint.
   * @returns {Object}
   */
  toQueryObject(): Object {
    if (this.isSubselection) {
      return this.toQueryObjectWithSubselection();
    } else {
      return this.toQueryObjectWithoutSubselection();
    }
  }

  get textRepresentation(): string {
    return 'Time constraint';
  }

  get isSubselection(): boolean {
    return this._isSubselection;
  }

  set isSubselection(value: boolean) {
    this._isSubselection = value;
  }

  get parent(): Constraint {
    return this._parent;
  }

  set parent(value: Constraint) {
    this._parent = value;
  }

  get isNegated(): boolean {
    return this._isNegated;
  }

  set isNegated(value: boolean) {
    this._isNegated = value;
    if (value) {
      this.dateOperator = DateOperatorState.NOT_BETWEEN;
    }
  }

  get isObservationDate(): boolean {
    return this._isObservationDate;
  }

  set isObservationDate(value: boolean) {
    this._isObservationDate = value;
  }
}
