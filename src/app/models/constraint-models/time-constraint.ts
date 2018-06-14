import {Constraint} from './constraint';
import {DateOperatorState} from './date-operator-state';

export class TimeConstraint extends Constraint {

  dateOperator: DateOperatorState = DateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();

  // the flag indicating if the constraint is negated
  private _isNegated = false;
  // the flag indicating if the constraint is related to observation date
  private _isObservationDate = false;

  constructor(operator?: string) {
    super();
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
    this.textRepresentation = 'Time constraint';
  }

  get className(): string {
    return 'TimeConstraint';
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
