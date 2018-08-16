/**
 * Copyright 2017 - 2018  The Hyve B.V.
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
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {AbstractConstraintVisitor} from '../constraint-utilities/abstract-constraint-visitor';
import {Constraint} from '../../models/constraint-models/constraint';

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

  /**
   * This method is used to unwrap nested combination constraint
   * with single child
   * @param {object} queryObject
   * @returns {object}
   */
  static unWrapNestedQueryObject(queryObject: object): object {
    const type = queryObject['type'];
    // If the query object is a combination constraint
    if (type === 'and' || type === 'or') {
      if (queryObject['args'].length === 1) {
        return this.unWrapNestedQueryObject(queryObject['args'][0]);
      } else {
        return queryObject;
      }
    } else {
      return queryObject;
    }
  }

  /**
   * Wrap a given query object with subselection clause
   * @param {Object} queryObject
   * @returns {Object}
   */
  static wrapWithSubselection(queryObject: object): object {
    let queryObj = this.unWrapNestedQueryObject(queryObject);
    if (queryObj['type'] === 'true') {
      return {'type': 'true'};
    } else if (queryObj['type'] !== 'negation') {
      return {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': queryObj
      };
    } else {
      const arg = queryObj['arg'];
      const sub = {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': arg
      };
      return {
        'type': 'negation',
        'arg': sub
      };
    }
  }

  constructor(full: boolean) {
    super();
    this._full = full;
  }

  visitValueConstraint(constraint: ValueConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      result = {
        type: 'value',
        valueType: constraint.valueType,
        operator: constraint.operator,
        value: constraint.value
      }
    }
    return result;
  }

  visitTrueConstraint(constraint: TrueConstraint): object {
    return {type: 'true'};
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      let values: number[] = [];
      for (let visit of constraint.trialVisits) {
        values.push(Number(visit.id));
      }
      result = {
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
    return result;
  }

  visitTimeConstraint(constraint: TimeConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      // Operator
      let operator = {
        [DateOperatorState.BETWEEN]: '<-->',
        [DateOperatorState.NOT_BETWEEN]: '<-->', // we'll negate it later
        [DateOperatorState.BEFORE]: '<=',
        [DateOperatorState.AFTER]: '>='
      }[constraint.dateOperator];
      // Values (dates)
      let values = [constraint.date1.toISOString()];
      if (constraint.dateOperator === DateOperatorState.BETWEEN ||
        constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
        values.push(constraint.date2.toISOString());
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
    }
    return result;
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
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
      } else {
        result = null;
      }
    }
    return result;
  }

  visitStudyConstraint(constraint: StudyConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
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
    } else if (constraint.mark === ConstraintMark.SUBJECT) {
      constraint.mark = ConstraintMark.OBSERVATION;
      let subObj = this.visitStudyConstraint(constraint);
      constraint.mark = ConstraintMark.SUBJECT;
      result = {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': subObj
      };
    }
    return result;
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      result = {
        type: 'relation',
        relatedSubjectsConstraint: this.visit(constraint.rightHandSideConstraint),
        relationTypeLabel: constraint.label,
        biological: constraint.biological,
        shareHousehold: constraint.shareHousehold
      }
    } else if (constraint.mark === ConstraintMark.SUBJECT) {
      constraint.mark = ConstraintMark.OBSERVATION;
      let subObj = this.visitPedigreeConstraint(constraint);
      constraint.mark = ConstraintMark.SUBJECT;
      result = {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': subObj
      };
    }
    return result;
  }

  visitNegationConstraint(constraint: NegationConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      result = {
        type: 'negation',
        arg: this.visit(constraint.constraint)
      }
    } else if (constraint.mark === ConstraintMark.SUBJECT) {
      result = {
        'type': 'negation',
        'arg': {
          'type': 'subselection',
          'dimension': 'patient',
          'constraint': this.visit(constraint.constraint)
        }
      }
    }
    return result;
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
    if (constraint.mark === ConstraintMark.OBSERVATION) {
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
    } else if (constraint.mark === ConstraintMark.SUBJECT) {
      constraint.mark = ConstraintMark.OBSERVATION;
      let subObj = this.visitConceptConstraint(constraint);
      constraint.mark = ConstraintMark.SUBJECT;
      result = {
        'type': 'subselection',
        'dimension': 'patient',
        'constraint': subObj
      };
    }
    return result;
  }

  /**
   * Collects all non-empty query objects of a combination constraint
   * @returns {Object[]}
   */
  private getNonEmptyChildObjects(constraint: CombinationConstraint): object[] {
    return constraint.children.reduce((result: Object[], child: Constraint) => {
      let queryObject: object = this.visit(child);
      if (queryObject && Object.keys(queryObject).length > 0) {
        result.push(queryObject);
      }
      return result;
    }, []);
  }

  /*
   * --------------------- combination constraint related methods ---------------------
   */
  visitCombinationConstraint(constraint: CombinationConstraint): object {
    let optConstraint = constraint.optimize();
    if (optConstraint.className === 'CombinationConstraint') {
      let constraint1: CombinationConstraint = <CombinationConstraint>optConstraint;
      let result = null;
      // Collect children query objects
      let childQueryObjects: Object[] = this.getNonEmptyChildObjects(constraint1);
      if (childQueryObjects.length > 0) {
        if (constraint1.mark === ConstraintMark.SUBJECT) {
          if (childQueryObjects.length === 1) {
            result = TransmartConstraintSerialiser.wrapWithSubselection(childQueryObjects[0]);
          } else {
            // Wrap the child query objects in subselections
            childQueryObjects = childQueryObjects.map(queryObj => {
              return TransmartConstraintSerialiser.wrapWithSubselection(queryObj);
            });
            // Wrap in and/or constraint
            result = {
              type: constraint1.combinationState === CombinationState.And ? 'and' : 'or',
              args: childQueryObjects
            };
          }
        } else if (constraint1.mark === ConstraintMark.OBSERVATION) {
          if (childQueryObjects.length === 1) {
            result = childQueryObjects[0];
          } else {
            // Wrap in and/or constraint
            result = {
              type: constraint1.combinationState === CombinationState.And ? 'and' : 'or',
              args: childQueryObjects
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
