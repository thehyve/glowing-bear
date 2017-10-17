import {Constraint} from './constraint';
import {GbDateOperatorState} from '../../modules/gb-data-selection-module/constraint-components/gb-concept-constraint/gb-date-operator-state';

export class TimeConstraint implements Constraint {

  dateOperator: GbDateOperatorState = GbDateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();

  constructor() {
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
    let query: Object = {
      type: 'time',
      field: {
        dimension: 'start time',
        fieldName: 'startDate',
        type: 'DATE'
      },
      operator: operator,
      values: values
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

  get textRepresentation(): string {
    return 'Time constraint';
  }
}
