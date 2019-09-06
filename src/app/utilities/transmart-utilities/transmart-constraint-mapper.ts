/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartConstraintSerialiser} from './transmart-constraint-serialiser';
import {TransmartConstraint} from '../../models/transmart-models/transmart-constraint';
import {TransmartConstraintReader} from './transmart-constraint-reader';
import {TransmartConstraintRewriter} from './transmart-constraint-rewriter';


export class TransmartConstraintMapper {

  static fullSerialiser = new TransmartConstraintSerialiser(true);
  static defaultSerialiser = new TransmartConstraintSerialiser(false);

  static throwMappingError(constraint: Constraint) {
    throw new Error(`Unable to map constraint ${constraint ? constraint.className : constraint} to object.`);
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

  /**
   * Read a TranSMART constraint and convert it into a Glowing Bear constraint for use
   * in the cohort selection module.
   *
   * @param constraintObjectInput the TranSMART constraint
   */
  public static generateConstraintFromObject(constraintObjectInput: TransmartConstraint): Constraint {
    const rewriter = new TransmartConstraintRewriter();
    let constraintObject = rewriter.visit(constraintObjectInput);
    const reader = new TransmartConstraintReader();
    return reader.visit(constraintObject);
  }

}
