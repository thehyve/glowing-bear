/**
 * Copyright 2017 - 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {DateOperatorState} from '../../models/constraint-models/date-operator-state';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {AbstractConstraintVisitor} from '../constraint-utilities/abstract-constraint-visitor';
import {
  TransmartCombinationConstraint,
  TransmartConceptConstraint,
  TransmartConstraint,
  TransmartFieldConstraint,
  TransmartNegationConstraint,
  TransmartOperator,
  TransmartOperatorValues,
  TransmartPatientSetConstraint,
  TransmartRelationConstraint,
  TransmartSubSelectionConstraint,
  TransmartTimeConstraint,
  TransmartTrueConstraint,
  TransmartType,
  TransmartValueConstraint
} from '../../models/transmart-models/transmart-constraint';
import {Constraint} from '../../models/constraint-models/constraint';
import {TransmartConstraintRewriter} from './transmart-constraint-rewriter';

/**
 * Serialisation class for serialising constraint objects for use in the TranSMART API.
 * There are two modes:
 * - default: generating objects with only the fields allowed by the API;
 *   (Create with <code>let serialiser = new TransmartConstraintSerialiser(false)</code>)
 * - full: decorating concept constraints with extra information, to be used when saving
 *   queries to be later restored.
 *   (Create with <code>let serialiser = new TransmartConstraintSerialiser(true)</code>)
 *
 * To serialise a constraint, use <code>serialiser.visit(constraint)</code>.
 */
export class TransmartConstraintSerialiser extends AbstractConstraintVisitor<TransmartConstraint> {

  private readonly _full: boolean;

  /**
   * This method is used to unwrap nested combination constraint
   * with single child
   * @param {TransmartConstraint} constraint
   * @returns {TransmartConstraint}
   */
  static unWrapNestedQueryObject(constraint: TransmartConstraint): TransmartConstraint {
    // If the query object is a combination constraint
    if (constraint.type === 'and' || constraint.type === 'or') {
      if (constraint['args'].length === 1) {
        return this.unWrapNestedQueryObject(constraint['args'][0]);
      } else {
        return constraint;
      }
    } else {
      return constraint;
    }
  }

  /**
   * Wrap a given query object with subselection clause
   * @param {string} dimension
   * @param {TransmartConstraint} constraint
   * @returns {TransmartConstraint}
   */
  static wrapWithSubselection(dimension: string, constraint: TransmartConstraint): TransmartConstraint {
    let queryConstraint: TransmartConstraint = this.unWrapNestedQueryObject(constraint);
    if (queryConstraint.type === 'true') {
      return {'type': 'true'};
    } else if (queryConstraint.type === 'negation') {
      const arg = (<TransmartNegationConstraint>queryConstraint).arg;
      return {
        type: 'negation',
        arg: {
          type: 'subselection',
          dimension: dimension,
          constraint: arg
        } as TransmartSubSelectionConstraint
      } as TransmartNegationConstraint;
    } else {
      return {
        type: 'subselection',
        dimension: dimension,
        constraint: queryConstraint
      } as TransmartSubSelectionConstraint;
    }
  }

  static convertOperator(operator: string): TransmartOperator {
    if ((TransmartOperatorValues as string[]).includes(operator)) {
      return <TransmartOperator>operator;
    }
    throw new Error(`Unknown operator: ${operator}`);
  }

  constructor(full: boolean) {
    super();
    this._full = full;
  }

  visitValueConstraint(constraint: ValueConstraint): TransmartValueConstraint {
    return {
      type: 'value',
      valueType: <TransmartType>constraint.valueType,
      operator: TransmartConstraintSerialiser.convertOperator(constraint.operator),
      value: constraint.value
    }
  }

  visitTrueConstraint(constraint: TrueConstraint): TransmartTrueConstraint {
    return {type: 'true'};
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): TransmartFieldConstraint {
    const trialVisitIds = constraint.trialVisits.map(trialVisit => Number(trialVisit.id));
    return {
      type: 'field',
      field: {
        dimension: 'trial visit',
        fieldName: 'id',
        type: TransmartType.numeric
      },
      operator: TransmartOperator.in,
      value: trialVisitIds
    };
  }

  visitTimeConstraint(constraint: TimeConstraint): TransmartConstraint {
    // Operator
    const operator: TransmartOperator = {
      [DateOperatorState.BETWEEN]: TransmartOperator.between,
      [DateOperatorState.NOT_BETWEEN]: TransmartOperator.between, // we'll negate it later
      [DateOperatorState.BEFORE]: TransmartOperator.before,
      [DateOperatorState.AFTER]: TransmartOperator.after
    }[constraint.dateOperator];
    // Values (dates)
    let values = [constraint.date1.getTime()];
    if (constraint.dateOperator === DateOperatorState.BETWEEN ||
      constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
      values.push(constraint.date2.getTime());
    }
    // Construct the date constraint
    // if it is observation date, then the dimension is 'start time', otherwise 'value'
    // the 'start time' dimension applies to the observations with observed date values
    // the 'value' dimension applies to the observations with actual date values
    let dimension = constraint.isObservationDate ? 'start time' : 'value';
    let fieldName = constraint.isObservationDate ? 'startDate' : 'numberValue';
    const result: TransmartTimeConstraint = {
      type: 'time',
      field: {
        dimension: dimension,
        fieldName: fieldName,
        type: TransmartType.date
      },
      operator: operator,
      values: values
    };
    // Wrap date constraint in a negation if required
    if (constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
      return new TransmartNegationConstraint(result);
    }
    return result;
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): TransmartPatientSetConstraint {
    let result = null;
    const type = 'patient_set';
    if (constraint.subjectIds.length > 0) {
      result = {
        type: type,
        subjectIds: constraint.subjectIds
      };
    } else if (constraint.patientIds.length > 0) {
      result = {
        type: type,
        patientIds: constraint.patientIds
      };
    } else if (constraint.id) {
      result = {
        type: type,
        patientSetId: constraint.id
      };
    }
    return result;
  }

  visitStudyConstraint(constraint: StudyConstraint): TransmartConstraint {
    let result = null;
    if (constraint.studies.length !== 0) {
      // Construct query objects for all studies
      let childQueryObjects: Object[] = [];
      for (let study of constraint.studies) {
        childQueryObjects.push({
          type: 'study_name',
          studyId: study.id
        });
      }
      if (childQueryObjects.length === 1) {
        // Don't wrap in 'or' if we only have one study
        result = childQueryObjects[0];
      } else {
        // Wrap study query objects in 'or' constraint
        result = {
          type: 'or',
          args: childQueryObjects
        };
      }
    }
    return result;
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): TransmartRelationConstraint {
    return {
      type: 'relation',
      relatedSubjectsConstraint: this.visit(constraint.rightHandSideConstraint),
      relationTypeLabel: constraint.label,
      biological: constraint.biological,
      shareHousehold: constraint.shareHousehold
    }
  }

  visitNegationConstraint(constraint: NegationConstraint): TransmartNegationConstraint {
    return {
      type: 'negation',
      arg: this.visit(constraint.constraint)
    }
  }

  /**
   * Map a concept constraint to its object form,
   * the full param is a flag indicating if the four attributes: name, fullName, conceptPath and valueType
   * should be incldued in the final object.
   * These four attributes are needed for saving and restoring a query, otherwise not needed.
   * @param {ConceptConstraint} constraint
   * @returns {object}
   */
  visitConceptConstraint(constraint: ConceptConstraint): TransmartConstraint {
    let result = null;
    if (constraint.concept) {
      const args = [];
      const conceptConstraint: TransmartConceptConstraint = {
        type: 'concept',
        conceptCode: constraint.concept.code,
      };
      if (this._full) {
        conceptConstraint['name'] = constraint.concept.name;
        conceptConstraint['fullName'] = constraint.concept.fullName;
        conceptConstraint['conceptPath'] = constraint.concept.path;
        conceptConstraint['valueType'] = constraint.concept.type;
      }
      args.push(conceptConstraint);

      if (constraint.valueConstraints.length > 0) {
        if (constraint.concept.type === 'NUMERIC') {
          // Add numerical values directly to the main constraint
          for (let val of constraint.valueConstraints) {
            args.push(this.visit(val));
          }
        } else if (constraint.concept.type === 'CATEGORICAL') {
          // Wrap categorical values in an OR constraint
          let categorical = {
            type: 'or',
            args: constraint.valueConstraints.map((val: ValueConstraint) => this.visit(val))
          };
          if (categorical.args.length === 1) {
            args.push(categorical.args[0]);
          } else {
            args.push(categorical);
          }
        }
      }
      if (constraint.applyValDateConstraint) {
        args.push(this.visit(constraint.valDateConstraint));
      }
      if (constraint.applyObsDateConstraint) {
        args.push(this.visit(constraint.obsDateConstraint));
      }
      if (constraint.applyTrialVisitConstraint) {
        args.push(this.visit(constraint.trialVisitConstraint));
      }
      if (args.length === 1) {
        result = args[0];
      } else {
        result = {
          type: 'and',
          args: args
        };
      }
    }
    return result;
  }

  /**
   * Collects all non-empty query objects of a combination constraint
   * @returns {Object[]}
   */
  private getNonEmptyChildObjects(constraint: CombinationConstraint): TransmartConstraint[] {
    return constraint.children.reduce((result: TransmartConstraint[], child: Constraint) => {
      let queryObject: TransmartConstraint = this.visit(child);
      if (queryObject && Object.keys(queryObject).length > 0) {
        result.push(queryObject);
      }
      return result;
    }, []);
  }

  /*
   * --------------------- combination constraint related methods ---------------------
   */
  visitCombinationConstraint(constraint: CombinationConstraint): TransmartConstraint {
    const dimension = constraint.dimension;
    // Collect children query objects
    const childQueryObjects = this.getNonEmptyChildObjects(constraint);
    const parentDimension = constraint.parentConstraint ? (<CombinationConstraint>constraint.parentConstraint).dimension : null;
    const applySubselection = (parentDimension && parentDimension !== dimension) ||
      (!parentDimension && dimension !== CombinationConstraint.TOP_LEVEL_DIMENSION);
    let args = childQueryObjects.map(queryObj =>
      applySubselection ? TransmartConstraintSerialiser.wrapWithSubselection(dimension, queryObj) : queryObj
    );
    const result = {
      type: constraint.combinationState === CombinationState.And ? 'and' : 'or',
      args: args
    } as TransmartCombinationConstraint;
    return new TransmartConstraintRewriter().visit(result);
  }

}
