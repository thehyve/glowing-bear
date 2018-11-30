import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {AbstractConstraintVisitor} from '../constraint-utilities/abstract-constraint-visitor';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {WhereClause} from '../../models/picsure-models/request/where-clause';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {MedcoService} from '../../services/picsure-services/medco.service';
import {GenomicAnnotationConstraint} from "../../models/constraint-models/genomic-annotation-constraint";
import {Injector} from "@angular/core";
import {GenomicAnnotationsService} from "../../services/picsure-services/genomic-annotations.service";
import {EncryptIdsAggregate} from "../../models/aggregate-models/encrypt-ids-aggregate";

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
  private medcoService: MedcoService;
  private genomicAnnotationsService: GenomicAnnotationsService;

  constructor(injector: Injector) {
    super();
    this.medcoService = injector.get(MedcoService);
    this.genomicAnnotationsService = injector.get(GenomicAnnotationsService);
  }


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
    throw new Error('TrueConstraint not supported by PIC-SURE');
  }

  visitStudyConstraint(constraint: StudyConstraint): WhereClause[] {
    throw new Error('StudyConstraint not supported by PIC-SURE');
  }

  visitTrialVisitConstraint(constraint: TrialVisitConstraint): WhereClause[] {
    throw new Error('TrialVisitConstraint not supported by PIC-SURE');
  }

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
    throw new Error('SubjectSetConstraint not supported by PIC-SURE');
  }

  visitPedigreeConstraint(constraint: PedigreeConstraint): WhereClause[] {
    throw new Error('PedigreeConstraint not supported by PIC-SURE');
  }

  visitNegationConstraint(constraint: NegationConstraint): WhereClause[] {
    if (!constraint.constraint) {
      return [];
    }

    // negated constraint must be a combination constraint
    if (constraint.constraint.className !== 'CombinationConstraint') {
      throw new Error('Non-combination constraint in negation not supported.');
    }

    let negConstraint = this.visitCombinationConstraint(constraint.constraint as CombinationConstraint);
    negConstraint.forEach((clause) => {
      if (clause.logicalOperator === 'AND') {
        clause.logicalOperator = 'NOT';
      }
    });
    negConstraint[0].logicalOperator = 'NOT';
    return negConstraint;
  }

  visitGenomicAnnotationConstraint(constraint: GenomicAnnotationConstraint): WhereClause[] {
    if (constraint.variantIds.length === 0) {
      return [];
    }

    return constraint.variantIds.map((variantId, idx: number) => {
      // let encId = this.medcoService.encryptInteger(variantId);
      let splitPath = constraint.annotation.path.split('/');
      let encPath = `/${splitPath[1]}/${splitPath[2]}/ENCRYPTED_KEY/${variantId}/${this.medcoService.publicKey}/`;

      let whereClause = {
        predicate: 'CONTAINS',
        field: {
          pui: encPath,
          dataType: 'ENC_CONCEPT'
        },
        logicalOperator: 'OR'
      };

      if (idx === 0) {
        delete whereClause.logicalOperator;
      }
      return whereClause;
    });
  }


  /**
   * @param {ConceptConstraint} constraint
   * @returns {WhereClause[]}
   */
  visitConceptConstraint(constraint: ConceptConstraint): WhereClause[] {
    if (!constraint.concept) {
      return [];
    }

    // todo: if modifier, it should be the concept, with a CONSTRAIN_MODIFIER

    let whereClauses: WhereClause[] = [];
    switch (constraint.concept.type) {
      case ConceptType.SIMPLE:
        whereClauses.push({
          predicate: 'CONTAINS',
          field: {
            pui: constraint.concept.path,
            dataType: 'CONCEPT'
          }
        });
        break;

      case ConceptType.ENCRYPTED:
        if (!this.medcoService) {
          throw new Error(`MedCo service should be loaded`);
        }

        // format: /<pic-sure resource>/<i2b2 project>/ENCRYPTED_KEY/<b64-encoded encryption>/<b64-encoded user's public key>/
        let id = (constraint.concept.aggregate as EncryptIdsAggregate).ownId;
        let encId = this.medcoService.encryptInteger(id);
        let splitPath = constraint.concept.path.split('/');
        let encPath = `/${splitPath[1]}/${splitPath[2]}/ENCRYPTED_KEY/${encId}/${this.medcoService.publicKey}/`;

        whereClauses.push({
          predicate: 'CONTAINS',
          field: {
            pui: encPath,
            dataType: 'ENC_CONCEPT'
          }
        });
        break;

      case ConceptType.CATEGORICAL:
      case ConceptType.NUMERICAL:
        for (let val of constraint.valueConstraints) {
          let valWhereClauses: WhereClause[] = this.visit(val)
            .map((valWhereClause) => {
              valWhereClause.predicate = 'CONSTRAIN_VALUE'; // todo this
              valWhereClause.field = {
                pui: constraint.concept.path,
                dataType: constraint.concept.type.toString()
              };
              valWhereClause.fields['OPERATOR'] = ''; // todo (from visitValue) LIKE[exact]
              valWhereClause.fields['CONSTRAINT'] = ''; // todo (from visitValue)
              valWhereClause.logicalOperator =
                constraint.concept.type === ConceptType.CATEGORICAL ? 'OR' : 'AND';
              return valWhereClause;
            });
          whereClauses.push(...valWhereClauses);
        }
        break;

      case ConceptType.DATE:
        // todo
        break;

      default:
        throw new Error(`Concept type not supported: ${constraint.concept.type.toString()}`);
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

  /**
   * Maps recursively combination constraint, setting appropriately the logical operator.
   *
   * Note: the logical operator of the first WhereClause of the list should always be empty for the PIC-SURE API.
   * However this implementation might in some cases not leave it empty, but this does not seem to be a problem.
   *
   * @param {CombinationConstraint} constraint
   * @returns {WhereClause[]}
   */
  visitCombinationConstraint(constraint: CombinationConstraint): WhereClause[] {
    // assume that all constraint (not combination) that generate several where clauses will leave first logical operator empty
    if (constraint.children.length === 0) {
      return [];
    } else if (constraint.children.length === 1) {
      return this.visit(constraint.children[0]);
    } else {
      let queryObj: WhereClause[] = [];
      let logicalOp = constraint.combinationState === CombinationState.And ? 'AND' : 'OR';

      for (let childIdx in constraint.children) {
        let childClauses: WhereClause[] = this.visit(constraint.children[childIdx]);

        //if (Number(childIdx) > 0 && constraint.children[childIdx].className !== 'CombinationConstraint') {
        if (Number(childIdx) > 0) {
          //childClauses.forEach((clause) => clause.logicalOperator = logicalOp);
          childClauses[0].logicalOperator = logicalOp;

        }
        //else if (constraint.children[childIdx].className === 'CombinationConstraint') {
        //  childClauses[0].logicalOperator = logicalOp;

        //}
        queryObj.push(...childClauses);
      }
      return queryObj;
    }
  }

}
