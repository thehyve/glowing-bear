/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {PedigreeState} from './pedigree-state';
import {CombinationConstraint} from './combination-constraint';

type TriState = true | false | undefined;

export class PedigreeConstraint extends Constraint {

  private _label: string;
  private _description: string;
  private _biological: TriState;
  private _shareHousehold: TriState;
  private _symmetrical: boolean;
  private _relationType: PedigreeState;
  private _rightHandSideConstraint: CombinationConstraint;

  constructor(label: string) {
    super();
    this.label = label;
    let relation = '';
    switch (label) {
      case 'PAR': {
        this.relationType = PedigreeState.Parent;
        relation = 'Parent of ';
        break;
      }
      case 'CHI': {
        this.relationType = PedigreeState.Child;
        relation = 'Child of ';
        break;
      }
      case 'SPO': {
        this.relationType = PedigreeState.Spouse;
        relation = 'Spouse of ';
        break;
      }
      case 'SIB': {
        this.relationType = PedigreeState.Sibling;
        relation = 'Sibling of ';
        break;
      }
      case 'MZ': {
        this.relationType = PedigreeState.MonozygoticTwin;
        relation = 'Monozygotic Twin to ';
        break;
      }
      case 'DZ': {
        this.relationType = PedigreeState.DizygoticTwin;
        relation = 'Dizygotic Twin to ';
        break;
      }
      case 'COT': {
        this.relationType = PedigreeState.UnknownTwin;
        relation = 'Twin with unknown zygosity to ';
        break;
      }
    }
    this.rightHandSideConstraint = new CombinationConstraint();
    this.rightHandSideConstraint.parent = this;
    this.biological = undefined;
    this.shareHousehold = undefined;
    this.textRepresentation = `Pedigree: ${relation}`;
  }

  get className(): string {
    return 'PedigreeConstraint';
  }

  get rightHandSideConstraint(): CombinationConstraint {
    return this._rightHandSideConstraint;
  }

  set rightHandSideConstraint(value: CombinationConstraint) {
    this._rightHandSideConstraint = value;
    this._rightHandSideConstraint.parent = this;
  }

  get relationType(): PedigreeState {
    return this._relationType;
  }

  set relationType(value: PedigreeState) {
    this._relationType = value;
    switch (value) {
      case PedigreeState.Parent: {
        this.label = 'PAR';
        break;
      }
      case PedigreeState.Child: {
        this.label = 'CHI';
        break;
      }
      case PedigreeState.Spouse: {
        this.label = 'SPO';
        break;
      }
      case PedigreeState.Sibling: {
        this.label = 'SIB';
        break;
      }
      case PedigreeState.DizygoticTwin: {
        this.label = 'DZ';
        break;
      }
      case PedigreeState.MonozygoticTwin: {
        this.label = 'MZ';
        break;
      }
      case PedigreeState.UnknownTwin: {
        this.label = 'COT';
        break;
      }
    }
  }

  get label(): string {
    return this._label;
  }

  set label(value: string) {
    this._label = value;
  }

  get description(): string {
    return this._description;
  }

  set description(value: string) {
    this._description = value;
  }

  get biological(): TriState {
    return this._biological;
  }

  set biological(value: TriState) {
    this._biological = value;
  }

  get shareHousehold(): TriState {
    return this._shareHousehold;
  }

  set shareHousehold(value: TriState) {
    this._shareHousehold = value;
  }

  get symmetrical(): boolean {
    return this._symmetrical;
  }

  set symmetrical(value: boolean) {
    this._symmetrical = value;
  }

  set parent(value: Constraint) {
    this._parent = value;
    if (this.rightHandSideConstraint &&
      this.rightHandSideConstraint.parent !== this) {
      this.rightHandSideConstraint.parent = this;
    }
  }
}
