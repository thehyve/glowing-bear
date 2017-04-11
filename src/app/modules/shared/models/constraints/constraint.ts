export interface Constraint {

  getConstraintType(): string;

  toJsonString(): string;
}
