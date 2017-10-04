import {Constraint} from './constraint';

export class TrueConstraint implements Constraint {

  constructor() {
  }

  getClassName(): string {
    return 'TrueConstraint';
  }

  toPatientQueryObject(): Object {
    return {
      'type': 'subselection',
      'dimension': 'patient',
      'constraint': {'type': 'true'}
    };
  }

  toQueryObject(): Object {
    return {'type': 'true'};
  }

  get textRepresentation(): string {
    return 'True';
  }
}
