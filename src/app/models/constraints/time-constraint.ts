import {Constraint} from './constraint';
import {GbDateOperatorState} from '../../modules/gb-data-selection-module/constraint-components/gb-concept-constraint/gb-date-operator-state';

export class TimeConstraint implements Constraint {

  private _parent: Constraint;
  dateOperator: GbDateOperatorState = GbDateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();
  // the 'start time' dimension applies to the observations with observed date values
  // the 'value' dimension applies to the observations with actual date values
  private _dimension = 'start time';
  private _isPatientSelection: boolean;

  // the flag indicating if the constraint is negated
  private _isNegated = false;
  // the flag indicating if the constraint is related to observation date
  private _isObservationDate = false;

  constructor(operator?: string) {
    this.parent = null;
    if (operator) {
      switch (operator) {
        case '<-->': {
          this.dateOperator = GbDateOperatorState.BETWEEN;
          break;
        }
        case '<-': {
          this.dateOperator = GbDateOperatorState.BEFORE;
          break;
        }
        case '->': {
          this.dateOperator = GbDateOperatorState.AFTER;
          break;
        }
      }
    }
  }

  getClassName(): string {
    return 'TimeConstraint';
  }

  toPatientQueryObject(): Object {
    // TODO: implement the 'subselection' wrapper on a normal query object
    return null;
  }

  /** Builds a query object for the date constraint.
   * @returns {Object}
   */
  toQueryObject(): Object {
    if (this.isPatientSelection) {
      return this.toPatientQueryObject();
    } else {
      // Operator
      let operator = {
        [GbDateOperatorState.BETWEEN]: '<-->',
        [GbDateOperatorState.NOT_BETWEEN]: '<-->', // we'll negate it later
        [GbDateOperatorState.BEFORE]: '<-',
        [GbDateOperatorState.AFTER]: '->'
      }[this.dateOperator];

      // Values (dates)
      let values = [this.date1.toISOString()];
      if (this.dateOperator === GbDateOperatorState.BETWEEN ||
        this.dateOperator === GbDateOperatorState.NOT_BETWEEN) {
        values.push(this.date2.toISOString());
      }

      // Construct the date constraint
      // we assume if the dimension is not 'start time', it would be 'value'
      let fieldName = this.dimension === 'start time' ? 'startDate' : 'numberValue';
      let query: Object = {
        type: 'time',
        field: {
          dimension: this.dimension,
          fieldName: fieldName,
          type: 'DATE'
        },
        operator: operator,
        values: values,
        isNegated: this.isNegated,
        isObservationDate: this.isObservationDate
      };

      // Wrap date constraint in a negation if required
      if (this.dateOperator === GbDateOperatorState.NOT_BETWEEN) {
        query = {
          type: 'negation',
          arg: query
        };
      }

      return query;
    }
  }

  get textRepresentation(): string {
    return 'Time constraint';
  }

  get dimension(): string {
    return this._dimension;
  }

  set dimension(value: string) {
    this._dimension = value;
  }

  get isPatientSelection(): boolean {
    return this._isPatientSelection;
  }

  set isPatientSelection(value: boolean) {
    this._isPatientSelection = value;
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
      this.dateOperator = GbDateOperatorState.NOT_BETWEEN;
    }
  }

  get isObservationDate(): boolean {
    return this._isObservationDate;
  }

  set isObservationDate(value: boolean) {
    this._isObservationDate = value;
  }
}
