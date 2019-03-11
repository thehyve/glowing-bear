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
import {SubselectionConstraint} from '../../models/constraint-models/subselection-constraint';

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
export class TransmartConstraintSerialiser extends AbstractConstraintVisitor<object> {

  private _full: boolean;

  constructor(full: boolean) {
    super();
    this._full = full;
  }

  visitSubselectionConstraint(constraint: SubselectionConstraint) {
    if (constraint.child.className === 'TrueConstraint') {
      return {'type': 'true'};
    } else {
      const sub = {
        'type': 'subselection',
        'dimension': constraint.dimension,
        'constraint': this.visit(constraint.child)
      };
      if (constraint.child.className === 'NegationConstraint') {
        return {
          'type': 'negation',
          'arg': sub
        };
      } else {
        return sub;
      }
    }
  }

  visitValueConstraint(constraint: ValueConstraint): object {
    return {
      type: 'value',
      valueType: constraint.valueType,
      operator: constraint.operator,
      value: constraint.value
    }
  }

  visitTrueConstraint(constraint: TrueConstraint): object {
    return {type: 'true'};
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): object {
    let values: number[] = [];
    for (let visit of constraint.trialVisits) {
      values.push(Number(visit.id));
    }
    return {
      'type': 'field',
      'field': {
        'dimension': 'trial visit',
        'fieldName': 'id',
        'type': 'NUMERIC'
      },
      'operator': 'in',
      'value': values
    };
  }

  visitTimeConstraint(constraint: TimeConstraint): object {
    let result = null;
    // Operator
    let operator = {
      [DateOperatorState.BETWEEN]: '<-->',
      [DateOperatorState.NOT_BETWEEN]: '<-->', // we'll negate it later
      [DateOperatorState.BEFORE]: '<=',
      [DateOperatorState.AFTER]: '>='
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
    result = {
      type: 'time',
      field: {
        dimension: dimension,
        fieldName: fieldName,
        type: 'DATE'
      },
      operator: operator,
      values: values
    };
    // Wrap date constraint in a negation if required
    if (constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
      result = {
        type: 'negation',
        arg: result
      };
    }
    return result;
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): object {
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

  visitStudyConstraint(constraint: StudyConstraint): object {
    let result = null;
    if (constraint.studies.length !== 0) {
      // Construct query objects for all studies
      let childQueryObjects: Object[] = [];
      for (let study of constraint.studies) {
        childQueryObjects.push({
          'type': 'study_name',
          'studyId': study.id
        });
      }
      if (childQueryObjects.length === 1) {
        // Don't wrap in 'or' if we only have one study
        result = childQueryObjects[0];
      } else {
        // Wrap study query objects in 'or' constraint
        result = {
          'type': 'or',
          'args': childQueryObjects
        };
      }
    }
    return result;
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): object {
    return {
      type: 'relation',
      relatedSubjectsConstraint: this.visit(constraint.rightHandSideConstraint),
      relationTypeLabel: constraint.label,
      biological: constraint.biological,
      shareHousehold: constraint.shareHousehold
    }
  }

  visitNegationConstraint(constraint: NegationConstraint): object {
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
  visitConceptConstraint(constraint: ConceptConstraint): object {
    let result = null;
    if (constraint.concept) {
      let args = [];
      let conceptObj = {
        type: 'concept',
        conceptCode: constraint.concept.code,
      };
      if (this._full) {
        conceptObj['name'] = constraint.concept.name;
        conceptObj['fullName'] = constraint.concept.fullName;
        conceptObj['conceptPath'] = constraint.concept.path;
        conceptObj['valueType'] = constraint.concept.type;
      }
      args.push(conceptObj);

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
        let arg = this.visit(constraint.obsDateConstraint);
        if (this._full) {
          arg['isObservationDate'] = true;
        }
        args.push(arg);
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

  /*
   * --------------------- combination constraint related methods ---------------------
   */
  visitCombinationConstraint(constraint: CombinationConstraint): object {
    let optConstraint = constraint.optimize();
    if (optConstraint.className === 'CombinationConstraint') {
      let combination: CombinationConstraint = <CombinationConstraint>optConstraint;
      let result = null;
      // Collect children query objects
      // let childQueryObjects: Object[] = this.getNonEmptyChildObjects(combination);
      if (combination.children.length > 0) {
        if (combination.isDimensionSubselectionRequired) {
          if (combination.children.length === 1) {
            result = this.visit(new SubselectionConstraint(combination.dimension, combination.children[0]))
          } else {
            result = {
              type: combination.combinationState === CombinationState.And ? 'and' : 'or',
              args: combination.children.map(child =>
                this.visit(new SubselectionConstraint(combination.dimension, child)))
            }
          }

        } else {
          if (combination.children.length === 1) {
            result = this.visit(combination.children[0]);
          } else {
            // Wrap in and/or constraint
            result = {
              type: combination.combinationState === CombinationState.And ? 'and' : 'or',
              args: combination.children.map(child =>
                this.visit(child))
            };
          }
        }
      }
      return result;
    } else {
      return this.visit(optConstraint);
    }
  }

}
