/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartConstraintSerialiser} from './transmart-constraint-serialiser';
import {
  TransmartCombinationConstraint,
  TransmartConstraint, TransmartTrueConstraint
} from '../../models/transmart-models/transmart-constraint';
import {TransmartConstraintReader} from './transmart-constraint-reader';


export class TransmartConstraintMapper {

  static fullSerialiser = new TransmartConstraintSerialiser(true);
  static defaultSerialiser = new TransmartConstraintSerialiser(false);

  static throwMappingError(constraint: Constraint) {
    throw new Error(`Unable to map constraint ${constraint.className} to object.`);
  }

  public static mapConstraint(constraint: Constraint, full?: boolean): TransmartConstraint {
    let result;
    if (full) {
      result = TransmartConstraintMapper.fullSerialiser.visit(constraint);
    } else {
      result = TransmartConstraintMapper.defaultSerialiser.visit(constraint);
    }
    if (!result) {
      TransmartConstraintMapper.throwMappingError(constraint);
    }
    return result;
  }

  public static optimizeConstraintObject(constraintObject: TransmartConstraint): TransmartConstraint {
    if (!['and', 'or'].includes(constraintObject.type)) {
      // Return a copy
      return Object.assign({}, constraintObject);
    }
    const combination = <TransmartCombinationConstraint>Object.assign({}, constraintObject);
    if (combination.args.length > 1) {
      // Remove 'true' constraints if operator is 'and';
      // return true if the operator is 'or' and the arguments contain a 'true' constraint.
      let isOr = combination.type === 'or';
      let hasTrue = false;
      let newArgs = [];
      for (let arg of combination.args) {
        if (arg.type === 'true') {
          hasTrue = true;
        } else {
          let newArg = this.optimizeConstraintObject(arg);
          if (newArg.type === 'true') {
            hasTrue = true;
          } else {
            newArgs.push(newArg);
          }
        }
      }
      if (isOr && hasTrue) {
        return new TransmartTrueConstraint();
      } else {
        combination.args = newArgs;
      }
    }
    if (combination.args.length === 1) {
      // return the singleton argument instead of the combination
      return this.optimizeConstraintObject(combination.args[0]);
    }
    return combination;
  }

  // generate the constraint instance based on given constraint object input
  public static generateConstraintFromObject(constraintObjectInput: TransmartConstraint): Constraint {
    let constraintObject = TransmartConstraintMapper.optimizeConstraintObject(constraintObjectInput);
    const constraintReader = new TransmartConstraintReader();
    return constraintReader.visit(constraintObject);
  }

}
