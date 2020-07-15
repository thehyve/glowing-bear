import {Constraint} from './constraint';
import { ValueConstraint } from './value-constraint';

export class ModifierConstraint extends Constraint {

  dimensionName: string;
  path: string;
  modifierCode: string;
  values: ValueConstraint[];

  constructor() {
    super();
    this.textRepresentation = 'Modifier constraint';
    this.values = [];
  }

  get className(): string {
    return 'ModifierConstraint';
  }

  clone(): ModifierConstraint {
    const clone = new ModifierConstraint();
    clone.dimensionName = this.dimensionName;
    clone.path = this.path;
    clone.modifierCode = this.modifierCode;
    clone.values = this.values;
    clone.negated = this.negated;
    return clone;
  }

}
