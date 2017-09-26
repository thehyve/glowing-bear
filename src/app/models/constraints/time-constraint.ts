import {Constraint} from './constraint';
import {DateOperatorState} from "../../modules/data-selection/constraint-components/concept-constraint/date-operator-state";

export class TimeConstraint implements Constraint {

  dateOperator: DateOperatorState = DateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();

  constructor() {
  }

  getClassName(): string {
    return 'TimeConstraint';
  }

  /** Builds a query object for the date constraint.
   * @returns {Object}
   */
  toQueryObject():Object {
    // Operator
    let operator = {
      [DateOperatorState.BETWEEN]: "<-->",
      [DateOperatorState.NOT_BETWEEN]: "<-->", // we'll negate it later
      [DateOperatorState.BEFORE]: "<-",
      [DateOperatorState.AFTER]: "->"
    }[this.dateOperator];

    // Values (dates)
    let values = [this.date1.toISOString()];
    if (this.dateOperator == DateOperatorState.BETWEEN ||
      this.dateOperator == DateOperatorState.NOT_BETWEEN) {
      values.push(this.date2.toISOString());
    }

    // Construct the date constraint
    let query:Object = {
      type: "time",
      field: {
        dimension: "start time",
        fieldName: "startDate",
        type: "DATE"
      },
      operator: operator,
      values: values
    };

    // Wrap date constraint in a negation if required
    if (this.dateOperator == DateOperatorState.NOT_BETWEEN) {
      query = {
        type: "negation",
        arg: query
      };
    }

    return query;
  }

  get textRepresentation(): string {
    return "Time constraint";
  }
}
