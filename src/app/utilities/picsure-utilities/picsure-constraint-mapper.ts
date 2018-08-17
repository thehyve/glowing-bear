import {Constraint} from '../../models/constraint-models/constraint';
import {PicsureConstraintSerialiser} from './picsure-constraint-serialiser';
import {WhereClause} from '../../models/picsure-models/request/where-clause';
import {MedcoService} from '../../services/picsure-services/medco.service';

export class PicsureConstraintMapper {

  private static serialiser: PicsureConstraintSerialiser;
  static getSerialiser(medcoService?: MedcoService): PicsureConstraintSerialiser {
    if (!PicsureConstraintMapper.serialiser) {
      PicsureConstraintMapper.serialiser = new PicsureConstraintSerialiser(medcoService);
    }
    return PicsureConstraintMapper.serialiser;
  }

  public static mapConstraint(constraint: Constraint, medcoService?: MedcoService): WhereClause[] {
    let result = PicsureConstraintMapper.getSerialiser(medcoService).visit(constraint);
    return PicsureConstraintMapper.verifyConstraintObject(constraint, result);
  }

  public static verifyConstraintObject(constraint: Constraint, result: WhereClause[]): WhereClause[] {
    if (!result) {
      PicsureConstraintMapper.throwMappingError(constraint);
    }
    return result;
  }

  static throwMappingError(constraint: Constraint) {
    throw new Error(`Unable to map constraint ${constraint.textRepresentation} of class ${constraint.className} to object.`);
  }
}
