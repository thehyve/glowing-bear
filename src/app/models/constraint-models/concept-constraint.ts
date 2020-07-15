/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {Concept} from './concept';
import {ValueConstraint} from './value-constraint';
import {TimeConstraint} from './time-constraint';
import {TrialVisitConstraint} from './trial-visit-constraint';
import {FormatHelper} from '../../utilities/format-helper';
import {StudyConstraint} from './study-constraint';
import { ModifierConstraint } from './modifier-constraint';

export class ConceptConstraint extends Constraint {

  private _concept: Concept;
  // the value constraints used for numeric or categorical values of this concept
  private _valueConstraints: ValueConstraint[];
  // the time constraint used for date type constraint of this concept
  private _valDateConstraint: TimeConstraint;
  private _applyValDateConstraint = false;

  // observation date range
  private _applyObsDateConstraint = false;
  private _obsDateConstraint: TimeConstraint;

  // trial visit
  private _applyTrialVisitConstraint = false;
  private _trialVisitConstraint: TrialVisitConstraint;

  // studies
  private _applyStudyConstraint = false;
  private _studyConstraint: StudyConstraint;

  // modifiers
  private _applyModifierConstraint = false;
  private _modifierConstraints: ModifierConstraint[];

  constructor() {
    super();
    this.valueConstraints = [];
    this.valDateConstraint = new TimeConstraint();
    this.valDateConstraint.isObservationDate = false;
    this.obsDateConstraint = new TimeConstraint();
    this.obsDateConstraint.isObservationDate = true;
    this.trialVisitConstraint = new TrialVisitConstraint();
    this.studyConstraint = new StudyConstraint();
    this.textRepresentation = 'Concept';
    this.applyModifierConstraint = false;
    this.modifierConstraints = [];
  }

  get concept(): Concept {
    return this._concept;
  }

  set concept(concept: Concept) {
    this._concept = concept;
    this.textRepresentation = concept ? `Concept: ${concept.label}` : FormatHelper.nullValuePlaceholder;
  }

  get valueConstraints(): ValueConstraint[] {
    return this._valueConstraints;
  }

  set valueConstraints(value: ValueConstraint[]) {
    this._valueConstraints = value;
  }

  get className(): string {
    return 'ConceptConstraint';
  }

  get valDateConstraint(): TimeConstraint {
    return this._valDateConstraint;
  }

  set valDateConstraint(value: TimeConstraint) {
    this._valDateConstraint = value;
  }

  get applyObsDateConstraint(): boolean {
    return this._applyObsDateConstraint;
  }

  set applyObsDateConstraint(value: boolean) {
    this._applyObsDateConstraint = value;
  }

  get obsDateConstraint(): TimeConstraint {
    return this._obsDateConstraint;
  }

  set obsDateConstraint(value: TimeConstraint) {
    this._obsDateConstraint = value;
  }

  get applyTrialVisitConstraint(): boolean {
    return this._applyTrialVisitConstraint;
  }

  set applyTrialVisitConstraint(value: boolean) {
    this._applyTrialVisitConstraint = value;
  }

  get trialVisitConstraint(): TrialVisitConstraint {
    return this._trialVisitConstraint;
  }

  set trialVisitConstraint(value: TrialVisitConstraint) {
    this._trialVisitConstraint = value;
  }

  get applyValDateConstraint(): boolean {
    return this._applyValDateConstraint;
  }

  set applyValDateConstraint(value: boolean) {
    this._applyValDateConstraint = value;
  }

  get applyStudyConstraint(): boolean {
    return this._applyStudyConstraint;
  }

  set applyStudyConstraint(value: boolean) {
    this._applyStudyConstraint = value;
  }

  get studyConstraint(): StudyConstraint {
    return this._studyConstraint;
  }

  set studyConstraint(value: StudyConstraint) {
    this._studyConstraint = value;
    value.parentConstraint = this;
  }

  get modifierConstraints(): ModifierConstraint[] {
    return this._modifierConstraints;
  }

  set modifierConstraints(value: ModifierConstraint[]) {
    this._modifierConstraints = value;
  }

  get applyModifierConstraint() {
    return this._applyModifierConstraint;
  }

  set applyModifierConstraint(value) {
    this._applyModifierConstraint = value;
  }

  clone(): ConceptConstraint {
    const clone = new ConceptConstraint();
    clone.concept = this.concept;
    clone.valueConstraints = this.valueConstraints.map(child => child.clone());
    clone.applyValDateConstraint = this.applyValDateConstraint;
    clone.valDateConstraint = this.valDateConstraint.clone();
    clone.applyObsDateConstraint = this.applyObsDateConstraint;
    clone.obsDateConstraint = this.obsDateConstraint.clone();
    clone.applyTrialVisitConstraint = this.applyTrialVisitConstraint;
    clone.trialVisitConstraint = this.trialVisitConstraint.clone();
    clone.applyStudyConstraint = this.applyStudyConstraint;
    clone.studyConstraint = this.studyConstraint.clone();
    clone.negated = this.negated;
    clone.applyModifierConstraint = this.applyModifierConstraint;
    clone.modifierConstraints = this.modifierConstraints.slice(0)
    return clone;
  }

}
