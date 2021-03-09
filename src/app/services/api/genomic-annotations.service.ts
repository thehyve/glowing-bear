/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {Observable, of, forkJoin} from 'rxjs';
import {map, tap} from 'rxjs/operators';
import {Constraint} from '../../models/constraint-models/constraint';
import {GenomicAnnotationConstraint} from '../../models/constraint-models/genomic-annotation-constraint';
import {CombinationConstraint} from '../../models/constraint-models/combination-constraint';
import {GenomicAnnotation} from '../../models/constraint-models/genomic-annotation';
import {ApiEndpointService} from '../api-endpoint.service';

@Injectable()
export class GenomicAnnotationsService {
  private static readonly QUERY_RECORD_LIMIT: number = 15;

  private readonly annotationsUrl: string;

  /**
   * @param {AppConfig} config
   * @param apiEndpointService
   */
  constructor(private config: AppConfig, private apiEndpointService: ApiEndpointService) {
    this.annotationsUrl = this.config.getConfig('medco-node-url');
  }

  //  ------------------- api calls ----------------------

  /**
   * Queries for values of a specific annotation.
   * Used for UI autocompletion.
   *
   * @param annotation the queried annotation
   * @param annotationValue partial value of the annotation
   * @return array of corresponding values
   */
  getAnnotationValues(annotation: GenomicAnnotation, annotationValue: string): Observable<string[]> {
    return this.apiEndpointService.getCall(`genomic-annotations/${annotation.name}?` +
      `value=${annotationValue}` +
      `&limit=${GenomicAnnotationsService.QUERY_RECORD_LIMIT}`).pipe(
        map((rep: object) => rep as string[])
    );
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
      .map((c) => this.addVariantIdsToConstraint(c));

    // execute all with forkjoin
    return queries.length === 0 ?
      of(undefined) :
      forkJoin(queries).pipe(
        map(() => undefined)
      );
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

    let queryUrlPart = `genomic-annotations/${constraint.annotation.name}/${constraint.annotationValue}?encrypted=true`;

    if (constraint.zygosityHeterozygous) {
      queryUrlPart = `${queryUrlPart}&zygosity[]=heterozygous`;
    }

    if (constraint.zygosityHomozygous) {
      queryUrlPart = `${queryUrlPart}&zygosity[]=homozygous`;
    }

    if (constraint.zygosityUnknown) {
      queryUrlPart = `${queryUrlPart}&zygosity[]=unknown`;
    }

    return this.apiEndpointService.getCall(queryUrlPart).pipe(
      map((rep: object) => rep as string[]),
      tap((variantIds: string[]) => constraint.variantIds = variantIds),
      tap((variantIds: string[]) => console.log(
        `Fetched ${variantIds.length} variants for ${constraint.annotation.name} = ${constraint.annotationValue}`)
      ),
      map(() => undefined)
    );
  }
}
