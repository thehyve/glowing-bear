import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {DateOperatorState} from '../../models/constraint-models/date-operator-state';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {AbstractConstraintVisitor} from '../constraints/abstract-constraint-visitor';
import {Constraint} from '../../models/constraint-models/constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {WhereClause} from '../../models/picsure-models/request/where-clause';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';

/**
 * Serialisation class for serialising constraint objects for use in the PIC-SURE API.
 * There are two modes:
 * - default: generating objects with only the fields allowed by the API;
 *   (Create with <code>let serialiser = new PicsureConstraintSerialiser(false)</code>)
 * - full: decorating concept constraints with extra information, to be used when saving
 *   queries to be later restored.
 *   (Create with <code>let serialiser = new PicsureConstraintSerialiser(true)</code>)
 *
 * To serialise a constraint, use <code>serialiser.visit(constraint)</code>.
 */
export class PicsureConstraintSerialiser extends AbstractConstraintVisitor<WhereClause[]> {

  constructor() {
    super();
  }


  // todo: check if needed!
  // toQueryObject(): WhereClause[] {
  //   let whereClause: WhereClause = {
  //     predicate: 'SUBJECT_SET'
  //   };
  //   if (this.subjectIds.length > 0) {
  //     whereClause.fields = {
  //       SUBJECT_IDS: this.subjectIds
  //     };
  //   } else if (this.patientIds.length > 0) {
  //     whereClause.fields = {
  //       PATIENT_IDS: this.patientIds
  //     };
  //   } else if (this.id) {
  //     whereClause.fields = {
  //       PATIENT_SET_ID: this.id
  //     };
  //   } else {
  //     console.warn('Empty patient set constraint generated');
  //   }
  //   return [whereClause];
  // }

  // todo: check if needed?
  // this should generate where clause
  // toQueryObject(full?: boolean): WhereClause[] {
  //   // When no concept is selected, we cannot create a query object (it should be ignored)
  //   if (!this.concept) {
  //     return [];
  //   }
  //
  //   let whereClauses: WhereClause[] = [];
  //   for (let opIdx in this.operators) {
  //     whereClauses.push({
  //       predicate: 'CONCEPT',
  //       field: {
  //         pui: this.concept.path,
  //         dataType: this.concept.type.toString()
  //       },
  //       logicalOperator: 'AND'
  //     });
  //
  //     switch (this.concept.type) {
  //       case ConceptType.CONCEPT:
  //         break;
  //
  //       // 1 operator = 1 value
  //       case ConceptType.CONCEPT_NUMERIC:
  //       case ConceptType.CONCEPT_STRING:
  //         whereClauses[-1].fields = {
  //           operator: this.operators[opIdx],
  //           value: this.values[opIdx]
  //         };
  //         break;
  //
  //       // 1 operator = 1+ values
  //       case ConceptType.CONCEPT_DATE:
  //       case ConceptType.CONCEPT_CATEGORICAL:
  //         whereClauses[-1].fields = {
  //           operator: this.operators[opIdx],
  //           values: this.values
  //         };
  //         break;
  //
  //       case ConceptType.CONCEPT_HIGH_DIM:
  //         // todo ??
  //         break;
  //
  //       case ConceptType.UNKNOWN:
  //       default:
  //         console.warn(`Concept type not recognized: ${this.concept.type}`);
  //     }
  //
  //   }
  //
  //   if (this.applyTrialVisitConstraint) {
  //     whereClauses.push(...this.trialVisitConstraint.toQueryObject());
  //   }
  //   if (this.applyObsDateConstraint) {
  //     whereClauses.push(...this.obsDateConstraint.toQueryObject());
  //   }
  //
  //   delete whereClauses[0].logicalOperator;
  //   return whereClauses;
  // }


  visitValueConstraint(constraint: ValueConstraint): WhereClause[] {
    // let result = null;
    // if (constraint.mark === ConstraintMark.OBSERVATION) {
    //   result = {
    //     type: 'value',
    //     operator: constraint.operator,
    //     value: constraint.value
    //   }
    // }
    // return result;
    return []; // todo
  }

  visitTrueConstraint(constraint: TrueConstraint): WhereClause[] {
    throw new Error('Constraint not supported by PIC-SURE');
    // return [];
  }

  visitStudyConstraint(constraint: StudyConstraint): WhereClause[] {
    return []; // todo
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): WhereClause[] {
    return []; // todo
  }

  // todo: to visitDimensionFieldConstraint
  // visitTrialVisitConstraint(constraint: TrialVisitConstraint): object {
  //   let result = null;
  //   if (constraint.mark === ConstraintMark.OBSERVATION) {
  //     let values: number[] = [];
  //     for (let visit of constraint.trialVisits) {
  //       values.push(Number(visit.id));
  //     }
  //     result = {
  //       'type': 'field',
  //       'field': {
  //         'dimension': 'trial visit',
  //         'fieldName': 'id',
  //         'type': 'NUMERIC'
  //       },
  //       'operator': 'in',
  //       'value': values
  //     };
  //   }
  //   return result;
  // }

  visitTimeConstraint(constraint: TimeConstraint): WhereClause[] {
    // let result = null;
    // if (constraint.mark === ConstraintMark.OBSERVATION) {
    //   // Operator
    //   let operator = {
    //     [DateOperatorState.BETWEEN]: '<-->',
    //     [DateOperatorState.NOT_BETWEEN]: '<-->', // we'll negate it later
    //     [DateOperatorState.BEFORE]: '<-',
    //     [DateOperatorState.AFTER]: '->'
    //   }[constraint.dateOperator];
    //   // Values (dates)
    //   let values = [constraint.date1.toISOString()];
    //   if (constraint.dateOperator === DateOperatorState.BETWEEN ||
    //     constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
    //     values.push(constraint.date2.toISOString());
    //   }
    //   // Construct the date constraint
    //   // if it is observation date, then the dimension is 'start time', otherwise 'value'
    //   // the 'start time' dimension applies to the observations with observed date values
    //   // the 'value' dimension applies to the observations with actual date values
    //   let dimension = constraint.isObservationDate ? 'start time' : 'value';
    //   let fieldName = constraint.isObservationDate ? 'startDate' : 'numberValue';
    //   result = {
    //     type: 'time',
    //     field: {
    //       dimension: dimension,
    //       fieldName: fieldName,
    //       type: 'DATE'
    //     },
    //     operator: operator,
    //     values: values
    //   };
    //   // Wrap date constraint in a negation if required
    //   if (constraint.dateOperator === DateOperatorState.NOT_BETWEEN) {
    //     result = {
    //       type: 'negation',
    //       arg: result
    //     };
    //   }
    // }
    // return result;
    return []; // todo
  }

  visitSubjectSetConstraint(constraint: SubjectSetConstraint): WhereClause[] {
    // let result = null;
    // if (constraint.mark = ConstraintMark.OBSERVATION) {
    //   const type = 'patient_set';
    //   if (constraint.subjectIds.length > 0) {
    //     result = {
    //       type: type,
    //       subjectIds: constraint.subjectIds
    //     };
    //   } else if (constraint.patientIds.length > 0) {
    //     result = {
    //       type: type,
    //       patientIds: constraint.patientIds
    //     };
    //   } else if (constraint.id) {
    //     result = {
    //       type: type,
    //       patientSetId: constraint.id
    //     };
    //   } else {
    //     result = null;
    //   }
    // }
    // return result;
    return []; // todo
  }

  // todo: to visitDimensionFieldConstraint
  // visitStudyConstraint(constraint: StudyConstraint): object {
  //   let result = null;
  //   if (constraint.mark === ConstraintMark.OBSERVATION) {
  //     if (constraint.studies.length !== 0) {
  //       // Construct query objects for all studies
  //       let childQueryObjects: Object[] = [];
  //       for (let study of constraint.studies) {
  //         childQueryObjects.push({
  //           'type': 'study_name',
  //           'studyId': study.studyId
  //         });
  //       }
  //       if (childQueryObjects.length === 1) {
  //         // Don't wrap in 'or' if we only have one study
  //         result = childQueryObjects[0];
  //       } else {
  //         // Wrap study query objects in 'or' constraint
  //         result = {
  //           'type': 'or',
  //           'args': childQueryObjects
  //         };
  //       }
  //     }
  //   }
  //   return result;
  // }

  visitPedigreeConstraint(constraint: PedigreeConstraint): WhereClause[] {
    // let result = null;
    // if (constraint.mark === ConstraintMark.OBSERVATION) {
    //   result = {
    //     type: 'relation',
    //     relatedSubjectsConstraint: this.visit(constraint.rightHandSideConstraint),
    //     relationTypeLabel: constraint.label,
    //     biological: constraint.biological,
    //     shareHousehold: constraint.shareHousehold
    //   }
    // }
    // return result;
    return []; // todo
  }

  visitNegationConstraint(constraint: NegationConstraint): WhereClause[] {
    // let result = null;
    // if (constraint.mark === ConstraintMark.OBSERVATION) {
    //   result = {
    //     type: 'negation',
    //     arg: this.visit(constraint.constraint)
    //   }
    // } else if (constraint.mark === ConstraintMark.SUBJECT) {
    //   result = {
    //     'type': 'negation',
    //     'arg': {
    //       'type': 'subselection',
    //       'dimension': 'patient',
    //       'constraint': this.visit(constraint.constraint)
    //     }
    //   }
    // }
    // return result;
    return []; // todo
  }

  /**
   * Map a concept constraint to its object form,
   * the full param is a flag indicating if the four attributes: name, fullName, conceptPath and valueType
   * should be incldued in the final object.
   * These four attributes are needed for saving and restoring a query, otherwise not needed.
   * @param {ConceptConstraint} constraint
   * @returns {object}
   */
  visitConceptConstraint(constraint: ConceptConstraint): WhereClause[] {
    // todo: condition on mark === observation?
    if (!constraint.concept) {
      return [];
    }

    let whereClauses: WhereClause[] = [];
    if (constraint.values.length === 0) {
      whereClauses.push({
        predicate: 'CONTAINS',
        field: {
          pui: constraint.concept.path,
          dataType: 'STRING' // todo: constraint.concept.type.toString()
        }
      });
    } else {
      for (let val of constraint.values) {
        let valWhereClauses: WhereClause[] = this.visit(val)
          .map((valWhereClause) => {
            valWhereClause.predicate = 'CONCEPTTODO'; // todo this
            valWhereClause.field = {
              pui: constraint.concept.path,
              dataType: constraint.concept.type.toString()
            };
            valWhereClause.logicalOperator =
              constraint.concept.type === ConceptType.CATEGORICAL ? 'OR' : 'AND';
            return valWhereClause;
          });
        whereClauses.push(...valWhereClauses);
      }
    }

    if (constraint.applyTrialVisitConstraint) {
      whereClauses.push(...this.visit(constraint.trialVisitConstraint));
    }
    if (constraint.applyObsDateConstraint) {
      whereClauses.push(...this.visit(constraint.obsDateConstraint));
    }
    if (constraint.applyValDateConstraint) {
      whereClauses.push(...this.visit(constraint.valDateConstraint));
    }

    delete whereClauses[0].logicalOperator;
    return whereClauses;
  }

  /*
   * --------------------- combination constraint related methods ---------------------
   */
  visitCombinationConstraint(constraint: CombinationConstraint): WhereClause[] {
    if (constraint.children.length === 0) {
      return [];
    } else if (constraint.children.length === 1) {
      return this.visit(constraint.children[0]);
    } else {
      let queryObj: WhereClause[] = [];
      if (!constraint.isRoot) {
        queryObj.push({
          predicate: 'NESTING',
          fields: {
            type: '('
          }
        });
      }
// todo: does nesting predicate makes sense with potential new plan??? -> NO remove it
      for (let child of constraint.children) {
        queryObj.push(...this.visit(child));
        queryObj[queryObj.length - 1].logicalOperator = constraint.combinationState === CombinationState.And ? 'AND' : 'OR';
      }

      if (!constraint.isRoot) {
        queryObj.push({
          predicate: 'NESTING',
          fields: {
            type: ')'
          }
        });
      }
      if (queryObj[0].predicate === 'NESTING') {
        delete queryObj[1].logicalOperator;
      } else if (queryObj.length > 1) {
        delete queryObj[0].logicalOperator;
      }
      return queryObj;
    }
  }

}
