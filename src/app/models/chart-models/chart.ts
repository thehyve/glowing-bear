import {ChartType} from './chart-type';
import {FormatHelper} from '../../utilities/format-helper';
import {Concept} from '../constraint-models/concept';
import {ConceptType} from '../constraint-models/concept-type';
import {Cohort} from '../cohort-models/cohort';

export class Chart {

  public readonly id: string;
  private _type: ChartType;
  private _cohortIds: string[] = [];
  private _numericVariables: Concept[] = [];
  private _categoricalVariables: Concept[] = [];
  private _isValid: boolean;

  constructor(type: ChartType) {
    this.id = FormatHelper.generateId();
    this.type = type;
    this.isValid = true;
  }

  get type(): ChartType {
    return this._type;
  }

  set type(value: ChartType) {
    this._type = value;
  }

  get categoricalVariables(): Concept[] {
    return this._categoricalVariables;
  }

  set categoricalVariables(value: Concept[]) {
    this._categoricalVariables = value;
  }

  get numericVariables(): Concept[] {
    return this._numericVariables;
  }

  set numericVariables(value: Concept[]) {
    this._numericVariables = value;
  }

  get isValid(): boolean {
    return this._isValid;
  }

  set isValid(value: boolean) {
    this._isValid = value;
  }

  get cohortIds(): string[] {
    return this._cohortIds;
  }

  set cohortIds(value: string[]) {
    this._cohortIds = value;
  }
}
