/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Constraint} from './constraint';
import {GenomicAnnotation} from './genomic-annotation';

export class GenomicAnnotationConstraint extends Constraint {

  private _annotation: GenomicAnnotation;
  private _annotationValue: string;
  private _variantIds: string[];

  /*
  * zygosity
  */
  private _zygosityHomozygous: boolean;
  private _zygosityHeterozygous: boolean;
  private _zygosityUnknown: boolean;

  constructor() {
    super();
    this.textRepresentation = 'Genomic Annotation';
    this.annotation = new GenomicAnnotation();
  }

  get className(): string {
    return 'GenomicAnnotationConstraint';
  }

  get annotationValue(): string {
    return this._annotationValue;
  }

  set annotationValue(value: string) {
    this._annotationValue = value;
  }

  get variantIds(): string[] {
    return this._variantIds;
  }

  set variantIds(value: string[]) {
    this._variantIds = value;
  }

  get zygosityHomozygous(): boolean {
    return this._zygosityHomozygous;
  }

  set zygosityHomozygous(value: boolean) {
    this._zygosityHomozygous = value;
  }

  get zygosityHeterozygous(): boolean {
    return this._zygosityHeterozygous;
  }

  set zygosityHeterozygous(value: boolean) {
    this._zygosityHeterozygous = value;
  }

  get zygosityUnknown(): boolean {
    return this._zygosityUnknown;
  }

  set zygosityUnknown(value: boolean) {
    this._zygosityUnknown = value;
  }

  get annotation(): GenomicAnnotation {
    return this._annotation;
  }

  set annotation(value: GenomicAnnotation) {
    this._annotation = value;
  }
}
