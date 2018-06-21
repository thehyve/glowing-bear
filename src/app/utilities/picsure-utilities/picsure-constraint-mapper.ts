import {Constraint} from '../../models/constraint-models/constraint';
import {PicsureConstraintSerialiser} from './picsure-constraint-serialiser';
import {WhereClause} from '../../models/picsure-models/request/where-clause';

export class PicsureConstraintMapper {

  static serialiser = new PicsureConstraintSerialiser();

  public static mapConstraint(constraint: Constraint): WhereClause[] {
    let result = PicsureConstraintMapper.serialiser.visit(constraint);
    console.log(result); // todo: remove
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
