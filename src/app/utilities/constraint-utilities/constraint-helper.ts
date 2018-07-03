import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {ConceptType} from '../../models/constraint-models/concept-type';
import {Constraint} from '../../models/constraint-models/constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {ConstraintMark} from '../../models/constraint-models/constraint-mark';
import {TransmartConstraintMapper} from '../transmart-utilities/transmart-constraint-mapper';
import {Query} from '../../models/query-models/query';
import {QuerySubscriptionFrequency} from '../../models/query-models/query-subscription-frequency';
import {MessageHelper} from '../message-helper';

export class ConstraintHelper {

  /**
   * Tests if the constraint is a concept constraint for a categorical concept.
   *
   * @param {Constraint} constraint
   * @return {boolean} true if the constraint is a categorical concept constraint; false otherwise.
   */
  public static isCategoricalConceptConstraint(constraint: Constraint): boolean {
    if (constraint.className !== 'ConceptConstraint') {
      return false;
    }
    let conceptConstraint = <ConceptConstraint>constraint;
    return conceptConstraint.concept.type === ConceptType.CATEGORICAL;
  }

  /**
   * Make permutations of constraints from lists of constraints.
   * Example: for input lists [[a, b], [x, y, z]] this will generate
   * a sequence [[a, x], [a, y], [a, z], [b, x], [b, y], [b, z]].
   *
   * @param {Constraint[][]} constraints the lists to draw constraints from.
   * @return {Constraint[][]} a list of lists with the length of the input list,
   * enumerating all combinations with an elements from the first list, one from the second list, etc.
   */
  public static permuteConstraints(constraints: Constraint[][]): Constraint[][] {
    if (constraints.length < 1) {
      return [[]];
    }
    let head: Constraint[] = constraints.shift();
    let tailPermutations = this.permuteConstraints(constraints);
    let result: Constraint[][] = [];
    head.forEach((constraint: Constraint) => {
      tailPermutations.forEach((permutation: Constraint[]) => {
        result.push([constraint].concat(permutation));
      });
    });
    return result;
  }

  /**
   * Combine subject-level constraints into a subject-level combination constraint.
   * If the input is a singleton list, the contained element is returned, for
   * an empty list, a True constraint is returned.
   *
   * @param {Constraint[]} constraints the input subject-level constraints.
   * @return {Constraint} True, if the list is empty, the contained element if it is singleton,
   * or a subject-level combination constraint otherwise.
   */
  public static combineSubjectLevelConstraints(constraints: Constraint[]): Constraint {
    if (constraints.length < 1) {
      // empty list of patient level constraints
      return new TrueConstraint();
    } else if (constraints.length === 1) {
      // singleton constraint
      return constraints[0];
    } else {
      // wrap patient level constraints in a patient-level combination
      let combination = new CombinationConstraint();
      combination.combinationState = CombinationState.And;
      combination.mark = ConstraintMark.SUBJECT;
      constraints.forEach(child => combination.addChild(child));
      return combination;
    }
  }

  /**
   * Checks if the constraint is a conjunctive combination constraint with one categorical concept constraint
   * as child.
   *
   * @param {Constraint} constraint
   * @return {boolean} true iff the constraint is a conjunctive combination constraint with one categorical concept constraint
   * as child.
   */
  static isConjunctiveAndHasOneCategoricalConstraint(constraint: Constraint): boolean {
    if (constraint.className === 'CombinationConstraint') {
      let combiConstraint = <CombinationConstraint>constraint;
      if (combiConstraint.isAnd()) {
        let categoricalConceptConstraints = combiConstraint.children.filter((child: Constraint) =>
          ConstraintHelper.isCategoricalConceptConstraint(child)
        );
        return categoricalConceptConstraints.length === 1;
      }
    }
    return false;
  }

  /**
   * Checks if the combination has any children other than combinations
   * without non-empty children.
   *
   * @param {CombinationConstraint} combination
   * @return {boolean} true iff the combination has any children other than combinations
   * or this property holds recursively for any of its children.
   */
  static hasNonEmptyChildren(combination: CombinationConstraint): boolean {
    return combination.children.some((child: Constraint) => {
      if (child.className === 'CombinationConstraint') {
        return this.hasNonEmptyChildren(<CombinationConstraint>child);
      }
      // all other types of constraints count as non-empty children.
      return true;
    });
  }

  /**
   * map a constraint to plain object that can be downloaded in json, and later imported as well
   * @param {Constraint} constraint
   * @returns {object}
   */
  static mapConstraintToObject(constraint: Constraint): object {
    let obj: object = TransmartConstraintMapper.mapConstraint(constraint, true);
    return obj;
  }

  /**
   * map an object to constraint
   * @param {object} obj
   * @returns {Constraint}
   */
  static mapObjectToConstraint(obj: object): Constraint {
    let constraint: Constraint = TransmartConstraintMapper.generateConstraintFromObject(obj);
    return constraint;
  }

  static mapQueryToObject(query: Query): object {
    let obj = {};
    obj['id'] = query.id;
    obj['name'] = query.name;
    obj['bookmarked'] = query.bookmarked;
    obj['subscribed'] = query.subscribed;
    if (query.subscriptionFreq) {
      obj['subscriptionFreq'] = query.subscriptionFreq;
    }
    if (query.description) {
      obj['description'] = query.description;
    }
    if (query.createDate) {
      obj['createDate'] = query.createDate;
    }
    if (query.updateDate) {
      obj['updateDate'] = query.updateDate;
    }
    if (query.subjectQuery) {
      obj['subjectQuery'] = ConstraintHelper.mapConstraintToObject(query.subjectQuery);
    }
    if (query.observationQuery) {
      obj['observationQuery'] = query.observationQuery;
    }
    // TODO: create function for mappding dataTable to object
    // if (this.dataTable) {
    //   obj['dataTable'] = this.dataTable;
    // }
    return obj;
  }

  static mapObjectToQuery(obj: object): Query {
    try {
      let query = new Query(obj['id'], obj['name']);
      query.bookmarked = obj['bookmarked'] ? true : false;
      query.subscribed = obj['subscribed'] ? true : false;
      if (query.subscribed) {
        query.subscriptionFreq = obj['subscriptionFreq'] ?
          obj['subscriptionFreq'] : QuerySubscriptionFrequency.WEEKLY;
      }
      query.createDate = obj['createDate'] ? obj['createDate'] : new Date().toISOString();
      query.updateDate = obj['updateDate'] ? obj['updateDate'] : new Date().toISOString();
      query.subjectQuery = ConstraintHelper.mapObjectToConstraint(obj['subjectQuery']);
      query.observationQuery = obj['observationQuery'];
      return query;
    } catch (e) {
      const message = 'Failed to convert to query.';
      console.error(message);
      MessageHelper.alert('error', message);
    }
    return null;
  }

}
