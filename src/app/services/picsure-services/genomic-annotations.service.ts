/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Injectable} from '@angular/core';
import {AppConfig} from '../../config/app.config';
import {GenKey, AggKeys, EncryptStr, DecryptStr} from '@medco/unlynx-crypto-js-lib'
import {HttpClient} from '@angular/common/http';
import {ErrorHelper} from '../../utilities/error-helper';
import {Observable} from "rxjs";

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
   * @param annotationName name of the queried annotation
   * @param annotationValue partial value of the annotation
   * @return array of corresponding values
   */
  getAnnotationValues(annotationName: string, annotationValue: string): Observable<string[]> {
    let annotationsUrl = this.config.getConfig('medco-genomic-annotations-url');
    return this.http.get(
      `${annotationsUrl}/getAnnotationValues.php?` +
        `annotation_name=${annotationName}` +
        `&annotation_value=${annotationValue}` +
        `&limit=${GenomicAnnotationsService.QUERY_RECORD_LIMIT}`,
      {})
      .catch(ErrorHelper.handleError.bind(this))
      .map((rep: object) => rep as string[]);
  }

  /**
   * Queries for variant identifiers corresponding to a genomic annotation.
   *
   * @param annotationName name of the queried annotation
   * @param annotationValue value of the annotation
   * @param zygosityHeterozygous
   * @param zygosityHomozygous
   * @param zygosityUnknown
   * @return array of variant identifiers
   */
  getVariantIds(annotationName: string, annotationValue: string, zygosityHeterozygous: boolean,
                zygosityHomozygous: boolean, zygosityUnknown: boolean): Observable<string[]> {

    let zygosity: string[] = [];
    zygosityHeterozygous ? zygosity.push('heterozygous') : false;
    zygosityHomozygous ? zygosity.push('homozygous') : false;
    zygosityUnknown ? zygosity.push('unknown') : false;

    let annotationsUrl = this.config.getConfig('medco-genomic-annotations-url');
    return this.http.get(
      `${annotationsUrl}/fetchVariants.php?` +
        `query_type=annotation_and_zygosity` +
        `&annotation_name=${annotationName}` +
        `&annotation_value=${annotationValue}` +
        `&zigosity=${zygosity.join(',')}`,
      {})
      .catch(ErrorHelper.handleError.bind(this))
      .map((rep: object) => rep['variants'] as string[]);
  }
}
