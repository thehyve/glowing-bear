import {Constraint} from '../../models/constraint-models/constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {DateOperatorState} from '../../models/constraint-models/date-operator-state';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';

export class TransmartConstraintMapper {

  public static mapConstraint(constraint: Constraint): object {
    let result = null;
    switch (constraint.className) {
      case 'CombinationConstraint': {
        result = TransmartConstraintMapper.mapCombinationConstraint(<CombinationConstraint>constraint);
        break;
      }
      case 'ConceptConstraint': {
        result = TransmartConstraintMapper.mapConceptConstraint(<ConceptConstraint>constraint);
        break;
      }
      case 'NegationConstraint': {
        result = TransmartConstraintMapper.mapNegationConstraint(<NegationConstraint>constraint);
        break;
      }
      case 'TrueConstraint': {
        result = TransmartConstraintMapper.mapTrueConstraint(<TrueConstraint>constraint);
        break;
      }
      case 'PedigreeConstraint': {
        result = TransmartConstraintMapper.mapPedigreeConstraint(<PedigreeConstraint>constraint);
        break;
      }
      case 'StudyConstraint': {
        result = TransmartConstraintMapper.mapStudyConstraint(<StudyConstraint>constraint);
        break;
      }
      case 'TimeConstraint': {
        result = TransmartConstraintMapper.mapTimeConstraint(<TimeConstraint>constraint);
        break;
      }
      case 'TrialVisitConstraint': {
        result = TransmartConstraintMapper.mapTrialVisitConstraint(<TrialVisitConstraint>constraint);
        break;
      }
      case 'ValueConstraint': {
        result = TransmartConstraintMapper.mapValueConstraint(<ValueConstraint>constraint);
        break;
      }
      case 'SubjectSetConstraint': {
        result = TransmartConstraintMapper.mapSubjectSetConstraint(<SubjectSetConstraint>constraint);
        break;
      }
    }
    result = TransmartConstraintMapper.verifyConstraintObject(constraint, result);
    return result;
  }

  public static verifyConstraintObject(constraint: Constraint, result: object): object {
    if (!result) {
      TransmartConstraintMapper.throwMappingError(constraint);
    }
    return result;
  }

  static throwMappingError(constraint: Constraint) {
    throw new Error(`Unable to map constraint ${constraint.textRepresentation} of class ${constraint.className} to object.`);
  }

  public static mapValueConstraint(constraint: ValueConstraint): object {
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

  public static mapTrueConstraint(constraint: TrueConstraint): object {
    return {type: 'true'};
  }

  public static mapTrialVisitConstraint(constraint: TrialVisitConstraint): object {
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

  public static mapTimeConstraint(constraint: TimeConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      // Operator
      let operator = {
        [DateOperatorState.BETWEEN]: '<-->',
        [DateOperatorState.NOT_BETWEEN]: '<-->', // we'll negate it later
        [DateOperatorState.BEFORE]: '<-',
        [DateOperatorState.AFTER]: '->'
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

  public static mapSubjectSetConstraint(constraint: SubjectSetConstraint): object {
    let result = null;
    if (constraint.mark = ConstraintMark.OBSERVATION) {
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

  public static mapStudyConstraint(constraint: StudyConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      if (constraint.studies.length !== 0) {
        // Construct query objects for all studies
        let childQueryObjects: Object[] = [];
        for (let study of constraint.studies) {
          childQueryObjects.push({
            'type': 'study_name',
            'studyId': study.studyId
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
    }
    return result;
  }

  public static mapPedigreeConstraint(constraint: PedigreeConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      result = {
        type: 'relation',
        relatedSubjectsConstraint: TransmartConstraintMapper.mapConstraint(constraint.rightHandSideConstraint),
        relationTypeLabel: constraint.label,
        biological: constraint.biological,
        shareHousehold: constraint.shareHousehold
      }
    }
    return result;
  }

  public static mapNegationConstraint(constraint: NegationConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      result = {
        type: 'negation',
        arg: TransmartConstraintMapper.mapConstraint(constraint.constraint)
      }
    } else if (constraint.mark === ConstraintMark.SUBJECT) {
      result = {
        'type': 'negation',
        'arg': {
          'type': 'subselection',
          'dimension': 'patient',
          'constraint': TransmartConstraintMapper.mapConstraint(constraint.constraint)
        }
      }
    }
    return result;
  }

  public static mapConceptConstraint(constraint: ConceptConstraint): object {
    let result = null;
    if (constraint.mark === ConstraintMark.OBSERVATION) {
      if (constraint.concept) {
        let args = [];
        let conceptObj = {
          type: 'concept',
          conceptCode: constraint.concept.code,
        };
        // TODO: only add these four attributes when saving a query, maybe in transmart-resource-service
        // conceptObj['name'] = constraint.concept.name;
        // conceptObj['fullName'] = constraint.concept.fullName;
        // conceptObj['conceptPath'] = constraint.concept.path;
        // conceptObj['valueType'] = constraint.concept.type;
        args.push(conceptObj);

        if (constraint.values.length > 0) {
          if (constraint.concept.type === 'NUMERIC') {
            // Add numerical values directly to the main constraint
            for (let val of constraint.values) {
              args.push(TransmartConstraintMapper.mapConstraint(val));
            }
          } else if (constraint.concept.type === 'CATEGORICAL') {
            // Wrap categorical values in an OR constraint
            let categorical = {
              type: 'or',
              args: constraint.values.map((val: ValueConstraint) => TransmartConstraintMapper.mapConstraint(val))
            };
            if (categorical.args.length === 1) {
              args.push(categorical.args[0]);
            } else {
              args.push(categorical);
            }
          }
        }
        if (constraint.applyValDateConstraint) {
          args.push(TransmartConstraintMapper.mapConstraint(constraint.valDateConstraint));
        }
        if (constraint.applyObsDateConstraint) {
          args.push(TransmartConstraintMapper.mapConstraint(constraint.obsDateConstraint));
        }
        if (constraint.applyTrialVisitConstraint) {
          args.push(TransmartConstraintMapper.mapConstraint(constraint.trialVisitConstraint));
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
    }
    return result;
  }

  /*
   * --------------------- combination constraint related methods ---------------------
   */
  public static mapCombinationConstraint(constraint: CombinationConstraint): object {
    let result = null;
    // Collect children query objects
    let childQueryObjects: Object[] = TransmartConstraintMapper.getNonEmptyChildObjects(constraint);
    if (childQueryObjects.length > 0) {
      if (constraint.mark === ConstraintMark.SUBJECT) {
        if (childQueryObjects.length === 1) {
          result = TransmartConstraintMapper.wrapWithSubselection(childQueryObjects[0]);
        } else {
          // Wrap the child query objects in subselections
          childQueryObjects = childQueryObjects.map(queryObj => {
            return TransmartConstraintMapper.wrapWithSubselection(queryObj);
          });
          // Wrap in and/or constraint
          result = {
            type: constraint.combinationState === CombinationState.And ? 'and' : 'or',
            args: childQueryObjects
          };
        }
      } else if (constraint.mark === ConstraintMark.OBSERVATION) {
        if (childQueryObjects.length === 1) {
          result = childQueryObjects[0];
        } else {
          // Wrap in and/or constraint
          result = {
            type: constraint.combinationState === CombinationState.And ? 'and' : 'or',
            args: childQueryObjects
          };
        }
      }
    }
    return result;
  }

  /**
   * This method is used to unwrap nested combination constraint
   * with single child
   * @param {object} queryObject
   * @returns {object}
   */
  public static unWrapNestedQueryObject(queryObject: object): object {
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
   * Collects all non-empty query objects of a combination constraint
   * @returns {Object[]}
   */
  public static getNonEmptyChildObjects(constraint: CombinationConstraint): object[] {
    let childQueryObjects: Object[] =
      constraint.children.reduce((result: Object[], child: Constraint) => {
        let queryObject: object = TransmartConstraintMapper.mapConstraint(child);
        if (queryObject && Object.keys(queryObject).length > 0) {
          result.push(queryObject);
        }
        return result;
      }, []);
    return childQueryObjects;
  }

  /**
   * Wrap a given query object with subselection clause
   * @param {Object} queryObject
   * @returns {Object}
   */
  public static wrapWithSubselection(queryObject: object): object {
    let queryObj = TransmartConstraintMapper.unWrapNestedQueryObject(queryObject);
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

}
