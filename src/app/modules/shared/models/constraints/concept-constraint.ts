import {Constraint} from './constraint';
import {Concept} from "../concept";
import {Value} from "../value";
import {DateOperatorState} from "../../../data-selection/constraint-components/concept-constraint/date-operator-state";

export class ConceptConstraint implements Constraint {

  private _type: string;
  private _concept:Concept;
  private _values: Value[];
  applyDateConstraint: boolean = false;
  dateOperator: DateOperatorState = DateOperatorState.BETWEEN;
  date1: Date = new Date();
  date2: Date = new Date();

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

    if (this.applyDateConstraint) {
      args.push(this.buildDateConstraint());
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

  buildDateConstraint():Object {
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
    let dateConstraint:Object = {
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
      dateConstraint = {
        type: "negation",
        arg: dateConstraint
      };
    }

    return dateConstraint;
  }
}
