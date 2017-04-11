import {Constraint} from './constraint';

export class CombinationConstraint implements Constraint {

  private children: Constraint[];
  public NOT: boolean;
  public AND: boolean;
  public OR: boolean;


  constructor() {
    this.children = [];
    this.NOT = false;
    this.AND = true;
    this.OR = false;
  }

  getConstraintType(): string {
    return 'combination-constraint';
  }

  toJsonString(): string {
    return '';
  }

  addChildConstraint(constraint: Constraint) {
    this.children.push(constraint);
  }

  getChildConstraints(): Constraint[] {
    return this.children;
  }
}
