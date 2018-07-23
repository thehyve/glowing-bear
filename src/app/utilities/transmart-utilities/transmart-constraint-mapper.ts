/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from '../../models/constraint-models/constraint';
import {ValueConstraint} from '../../models/constraint-models/value-constraint';
import {TrueConstraint} from '../../models/constraint-models/true-constraint';
import {TrialVisitConstraint} from '../../models/constraint-models/trial-visit-constraint';
import {TimeConstraint} from '../../models/constraint-models/time-constraint';
import {SubjectSetConstraint} from '../../models/constraint-models/subject-set-constraint';
import {StudyConstraint} from '../../models/constraint-models/study-constraint';
import {PedigreeConstraint} from '../../models/constraint-models/pedigree-constraint';
import {NegationConstraint} from '../../models/constraint-models/negation-constraint';
import {ConceptConstraint} from '../../models/constraint-models/concept-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {CombinationState} from '../../models/constraint-models/combination-state';
import {Study} from '../../models/constraint-models/study';
import {Concept} from '../../models/constraint-models/concept';
import {TrialVisit} from '../../models/constraint-models/trial-visit';
import {TransmartConstraintSerialiser} from './transmart-constraint-serialiser';

export class TransmartConstraintMapper {

  static fullSerialiser = new TransmartConstraintSerialiser(true);
  static defaultSerialiser = new TransmartConstraintSerialiser(false);

  public static mapConstraint(constraint: Constraint, full?: boolean): object {
    let result;
    if (full) {
      result = TransmartConstraintMapper.fullSerialiser.visit(constraint);
    } else {
      result = TransmartConstraintMapper.defaultSerialiser.visit(constraint);
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
    throw new Error(`Unable to map constraint ${constraint.className} to object.`);
  }

  static generateConstraintFromConceptObject(constraintObject: object): Constraint {
    let constraint: Constraint;
    let concept = new Concept();
    const tail = '\\' + constraintObject['name'] + '\\';
    const fullName = constraintObject['fullName'];
    concept.fullName = fullName;
    let head = fullName.substring(0, fullName.length - tail.length);
    concept.name = constraintObject['name'];
    concept.label = constraintObject['name'] + ' (' + head + ')';
    concept.path = constraintObject['conceptPath'];
    concept.type = constraintObject['valueType'];
    concept.code = constraintObject['conceptCode'];
    constraint = new ConceptConstraint();
    (<ConceptConstraint>constraint).concept = concept;
    return constraint;
  }

  static generateConstraintFromStudyObject(constraintObject): Constraint {
    let constraint: Constraint = null;
    let study = new Study();
    study.id = constraintObject['studyId'];
    constraint = new StudyConstraint();
    (<StudyConstraint>constraint).studies.push(study);
    return constraint;
  }

  static generateConstraintFromCombinationObject(constraintObject): Constraint {
    let type = constraintObject['type'];
    let constraint: Constraint = null;
    let operator = type !== 'combination' ? type : constraintObject['operator'];
    constraint = new CombinationConstraint();
    (<CombinationConstraint>constraint).combinationState =
      (operator === 'and') ? CombinationState.And : CombinationState.Or;

    /*
     * sometimes a combination constraint actually corresponds to a concept constraint UI
     * which could have:
     * a) an observation date constraint and/or
     * b) a trial-visit constraint and/or
     * c) value constraints and/or
     * d) time constraints (value date for a DATE concept and/or observation date constraints)
     * >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
     * sometimes a combination contains purely study constraints,
     * in which case we can reduce this combination to a single study constraint containing multiple studies
     */
    let prospectConcept: ConceptConstraint = null;
    let prospectValDate: TimeConstraint = null;
    let prospectObsDate: TimeConstraint = null;
    let prospectTrialVisit: TrialVisitConstraint = null;
    let prospectValues: ValueConstraint[] = [];
    let hasOnlyStudies = true;
    let allStudyIds = [];
    /*
     * go through each argument, construct potential sub-constraints for the concept constraint
     */
    for (let arg of constraintObject['args']) {
      if (arg['type'] === 'concept' && !arg['fullName']) {
        arg['valueType'] = constraintObject['valueType'];
        arg['conceptPath'] = constraintObject['conceptPath'];
        arg['name'] = constraintObject['name'];
        arg['fullName'] = constraintObject['fullName'];
        arg['conceptCode'] = constraintObject['conceptCode'];
      }
      let child = TransmartConstraintMapper.generateConstraintFromObject(arg);
      if (arg['type'] === 'concept') {
        prospectConcept = <ConceptConstraint>child;
      } else if (arg['type'] === 'time') {
        if (arg['isObservationDate']) {
          prospectObsDate = <TimeConstraint>child;
          prospectObsDate.isNegated = arg['isNegated'];
        } else {
          prospectValDate = <TimeConstraint>child;
          prospectValDate.isNegated = arg['isNegated'];
        }
      } else if (arg['type'] === 'field') {
        prospectTrialVisit = <TrialVisitConstraint>child;
      } else if (arg['type'] === 'value') {
        prospectValues.push(<ValueConstraint>child);
      } else if (arg['type'] === 'or') {
        let isValues = true;
        for (let val of (<CombinationConstraint>child).children) {
          if (val.className !== 'ValueConstraint') {
            isValues = false;
          } else {
            prospectValues.push(<ValueConstraint>val);
          }
        }
        if (!isValues) {
          prospectValues = [];
        }
      } else if (arg['type'] === 'negation') {
        let negationArg = arg['arg'];
        if (negationArg['type'] === 'time') {
          if (negationArg['isObservationDate']) {
            prospectObsDate = <TimeConstraint>((<NegationConstraint>child).constraint);
            prospectObsDate.isNegated = true;
          } else {
            prospectValDate = <TimeConstraint>((<NegationConstraint>child).constraint);
            prospectValDate.isNegated = true;
          }
        }
      }
      (<CombinationConstraint>constraint).addChild(child);
      if (arg['type'] === 'study_name') {
        allStudyIds.push(arg['studyId']);
      } else {
        hasOnlyStudies = false;
      }
    }
    // -------------------------------- end for -------------------------------------------

    /*
     * Check conditions for a concept constraint
     */
    if (prospectConcept &&
      (prospectValDate || prospectObsDate || prospectTrialVisit || prospectValues.length > 0)) {
      if (prospectValDate) {
        prospectConcept.applyValDateConstraint = true;
        prospectConcept.valDateConstraint = prospectValDate;
      }
      if (prospectObsDate) {
        prospectConcept.applyObsDateConstraint = true;
        prospectConcept.obsDateConstraint = prospectObsDate;
      }
      if (prospectTrialVisit) {
        prospectConcept.applyTrialVisitConstraint = true;
        prospectConcept.trialVisitConstraint = prospectTrialVisit;
      }
      if (prospectValues) {
        prospectConcept.valueConstraints = prospectValues;
      }
      constraint = prospectConcept;
    }
    /*
     * Check conditions for a study constraint
     */
    if (type === 'or' && hasOnlyStudies) {
      let studyConstraint = new StudyConstraint();
      for (let sid of allStudyIds) {
        let study = new Study();
        study.id = sid;
        studyConstraint.studies.push(study);
      }
      (<CombinationConstraint>constraint).children.length = 0;
      (<CombinationConstraint>constraint).addChild(studyConstraint);
    }
    return constraint;
  }

  static generateConstraintFromPedigreeObject(constraintObject): Constraint {
    let constraint: Constraint;
    constraint = new PedigreeConstraint(constraintObject['relationTypeLabel']);
    (<PedigreeConstraint>constraint).biological = constraintObject['biological'];
    (<PedigreeConstraint>constraint).symmetrical = constraintObject['symmetrical'];
    let rightHandSide =
      this.generateConstraintFromObject(constraintObject['relatedSubjectsConstraint']);
    (<PedigreeConstraint>constraint).rightHandSideConstraint.children.length = 0;
    if (rightHandSide.className === 'CombinationConstraint') {
      (<PedigreeConstraint>constraint).rightHandSideConstraint = <CombinationConstraint>rightHandSide;
      for (let child of (<CombinationConstraint>rightHandSide).children) {
        (<PedigreeConstraint>constraint).rightHandSideConstraint.addChild(child);
      }
    } else {
      if (rightHandSide.className !== 'TrueConstraint') {
        (<PedigreeConstraint>constraint).rightHandSideConstraint.addChild(rightHandSide);
      }
    }
    return constraint;
  }

  static generateConstraintFromTimeObject(constraintObject): Constraint {
    let constraint: Constraint;
    constraint = new TimeConstraint(constraintObject['operator']);
    (<TimeConstraint>constraint).date1 = new Date(constraintObject['values'][0]);
    if (constraintObject['values'].length === 2) {
      (<TimeConstraint>constraint).date2 = new Date(constraintObject['values'][1]);
    }
    (<TimeConstraint>constraint).isNegated = constraintObject['isNegated'];
    (<TimeConstraint>constraint).isObservationDate = constraintObject['isObservationDate'];
    return constraint;
  }

  static generateConstraintFromTrialVisitObject(constraintObject): Constraint {
    let constraint: Constraint;
    constraint = new TrialVisitConstraint();
    for (let id of constraintObject['value']) {
      let visit = new TrialVisit(id);
      (<TrialVisitConstraint>constraint).trialVisits.push(visit);
    }
    return constraint;
  }

  static generateConstraintFromValueObject(constraintObject): Constraint {
    let constraint: Constraint;
    constraint = new ValueConstraint();
    (<ValueConstraint>constraint).operator = constraintObject['operator'];
    (<ValueConstraint>constraint).value = constraintObject['value'];
    (<ValueConstraint>constraint).valueType = constraintObject['valueType'];
    return constraint;
  }

  static generateConstraintFromPatientSetObject(constraintObject): Constraint {
    let constraint: Constraint;
    constraint = new SubjectSetConstraint();
    if (constraintObject['subjectIds']) {
      (<SubjectSetConstraint>constraint).subjectIds = constraintObject['subjectIds'];
    } else if (constraintObject['patientIds']) {
      (<SubjectSetConstraint>constraint).patientIds = constraintObject['patientIds'];
    } else if (constraintObject['patientSetId']) {
      (<SubjectSetConstraint>constraint).id = constraintObject['patientSetId'];
    }
    return constraint;
  }

  public static optimizeConstraintObject(constraintObject) {
    let newConstraintObject = Object.assign({}, constraintObject);

    // if the object has 'args' property
    if (newConstraintObject['args']) {
      if (newConstraintObject['args'].length === 1) {
        newConstraintObject = this.optimizeConstraintObject(newConstraintObject['args'][0]);
      } else if (newConstraintObject['args'].length > 1) {
        let isOr = newConstraintObject['type'] === 'or';
        let hasTrue = false;
        let newArgs = [];
        for (let arg of newConstraintObject['args']) {
          if (arg['type'] === 'true') {
            hasTrue = true;
          } else {
            let newArg = this.optimizeConstraintObject(arg);
            if (newArg['type'] === 'true') {
              hasTrue = true;
            } else {
              newArgs.push(newArg);
            }
          }
        }
        if (isOr && hasTrue) {
          newConstraintObject['args'] = [];
        } else {
          newConstraintObject['args'] = newArgs;
        }
      }
    } else if (newConstraintObject['constraint']) { // if the object has the 'constraint' property
      newConstraintObject = this.optimizeConstraintObject(newConstraintObject['constraint']);
    }
    return newConstraintObject;
  }

  // generate the constraint instance based on given constraint object input
  public static generateConstraintFromObject(constraintObjectInput: object): Constraint {
    let constraintObject = TransmartConstraintMapper.optimizeConstraintObject(constraintObjectInput);
    let type = constraintObject['type'];
    let constraint: Constraint = null;
    if (type === 'concept') { // ------------------------------------> If it is a concept constraint
      constraint = TransmartConstraintMapper.generateConstraintFromConceptObject(constraintObject);
    } else if (type === 'study_name') { // ----------------------------> If it is a study constraint
      constraint = TransmartConstraintMapper.generateConstraintFromStudyObject(constraintObject);
    } else if (type === 'and' ||
      type === 'or' ||
      type === 'combination') { // ------------------------------> If it is a combination constraint
      constraint = TransmartConstraintMapper.generateConstraintFromCombinationObject(constraintObject);
    } else if (type === 'relation') { // ---------------------------> If it is a pedigree constraint
      constraint = TransmartConstraintMapper.generateConstraintFromPedigreeObject(constraintObject);
    } else if (type === 'time') { // -----------------------------------> If it is a time constraint
      constraint = TransmartConstraintMapper.generateConstraintFromTimeObject(constraintObject);
    } else if (type === 'field') { // ---------------------------> If it is a trial-visit constraint
      constraint = TransmartConstraintMapper.generateConstraintFromTrialVisitObject(constraintObject);
    } else if (type === 'value') { // ---------------------------> If it is a value constraint
      constraint = TransmartConstraintMapper.generateConstraintFromValueObject(constraintObject);
    } else if (type === 'patient_set') { // ---------------------> If it is a patient-set constraint
      constraint = TransmartConstraintMapper.generateConstraintFromPatientSetObject(constraintObject);
    } else if (type === 'subselection'
      && constraintObject['dimension'] === 'patient') { // -------> If it is a patient sub-selection
      constraint = TransmartConstraintMapper.generateConstraintFromObject(constraintObject['constraint']);
    } else if (type === 'true') { // -----------------------------------> If it is a true constraint
      constraint = new TrueConstraint();
    } else if (type === 'negation') { // ---------------------------> If it is a negation constraint
      const childConstraint = TransmartConstraintMapper.generateConstraintFromObject(constraintObject['arg']);
      constraint = new NegationConstraint(childConstraint);
    }
    return constraint;
  }

}
