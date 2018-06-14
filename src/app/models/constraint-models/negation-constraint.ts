import {Constraint} from './constraint';

export class NegationConstraint extends Constraint {

  private _constraint: Constraint;

  constructor(constraint: Constraint) {
    super();
    this.constraint = constraint;
    this.textRepresentation = 'Negation';
  }

  get constraint(): Constraint {
    return this._constraint;
  }

  set constraint(value: Constraint) {
    this._constraint = value;
  }

  get className(): string {
    return 'NegationConstraint';
  }
}
