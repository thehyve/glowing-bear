/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {HttpClient} from '@angular/common/http';
import {ErrorHelper} from '../../utilities/error-helper';
import {Observable} from "rxjs";
import {Constraint} from "../../models/constraint-models/constraint";
import {GenomicAnnotationConstraint} from "../../models/constraint-models/genomic-annotation-constraint";
import {CombinationConstraint} from "../../models/constraint-models/combination-constraint";
import {GenomicAnnotation} from "../../models/constraint-models/genomic-annotation";

@Injectable()
export class GenomicAnnotationsService {

  private annotationsUrl: string;
  private static readonly QUERY_RECORD_LIMIT: number = 50;

  /**
   * @param {AppConfig} config
   * @param http
   */
  constructor(private config: AppConfig, private http: HttpClient) {
    this.annotationsUrl = this.config.getConfig('medco-genomic-annotations-url');
  }

  /**
   * Queries for values of a specific annotation.
   * Used for UI autocompletion.
   *
   * @param annotation the queried annotation
   * @param annotationValue partial value of the annotation
   * @return array of corresponding values
   */
  getAnnotationValues(annotation: GenomicAnnotation, annotationValue: string): Observable<string[]> {
    return this.http.get(
      `${this.annotationsUrl}/getAnnotationValues.php?` +
        `annotation_name=${annotation.name}` +
        `&annotation_value=${annotationValue}` +
        `&limit=${GenomicAnnotationsService.QUERY_RECORD_LIMIT}`,
      {})
      .catch(ErrorHelper.handleError.bind(this))
      .map((rep: object) => rep as string[]);
  }

  /**
   * For each GenomicAnnotationConstraint, query the variant identifiers and add them into the constraint.
   * @param constraint
   */
  addVariantIdsToConstraints(constraint: Constraint): Observable<void> {

    // gather the queries to be made
    let genomicAnnotationConstraints: GenomicAnnotationConstraint[] = [];
    this.getGenomicAnnotationConstraints(constraint, genomicAnnotationConstraints);

    let queries: Observable<void>[] = genomicAnnotationConstraints
      .map((constraint) => this.addVariantIdsToConstraint(constraint));

    // execute all with forkjoin
    return queries.length === 0 ?
      Observable.of(undefined) :
      Observable.forkJoin(queries).map(() => undefined);
  }

  private getGenomicAnnotationConstraints(constraint: Constraint, genomicAnnotationConstraints: GenomicAnnotationConstraint[]) {
    if (constraint.className === 'CombinationConstraint') {
      (constraint as CombinationConstraint).children.forEach((child) =>
        this.getGenomicAnnotationConstraints(child, genomicAnnotationConstraints));
    } else if (constraint.className === 'GenomicAnnotationConstraint') {
      genomicAnnotationConstraints.push(constraint as GenomicAnnotationConstraint);
    }
  }

  /**
   * Queries for variant identifiers corresponding to a genomic annotation.
   *
   * @return array of variant identifiers
   * @param constraint
   */
  addVariantIdsToConstraint(constraint: GenomicAnnotationConstraint): Observable<void> {

    let queryUrl = `${this.annotationsUrl}/fetchVariants.php?` +
    `query_type=generic_annotation_and_zygosity` +
    `&annotation_name=${constraint.annotation.name}` +
    `&annotation_value=${constraint.annotationValue}`;

    if (constraint.zygosityHeterozygous) {
      queryUrl = `${queryUrl}&zygosity[]=Heterozygous`;
    }

    if (constraint.zygosityHomozygous) {
      queryUrl = `${queryUrl}&zygosity[]=Homozygous`;
    }

    if (constraint.zygosityUnknown) {
      queryUrl = `${queryUrl}&zygosity[]=Unknown`;
    }

    return this.http.get(queryUrl, {})
      .catch(ErrorHelper.handleError.bind(this))
      .map((rep: object) => rep['variants'] as string[])
      .do((variantIds: string[]) => constraint.variantIds = variantIds)
      .do((variantIds: string[]) => console.log(`Fetched ${variantIds.length} variants for ${constraint.annotation.name} = ${constraint.annotationValue}`))
      .map(() => undefined);
  }
}
