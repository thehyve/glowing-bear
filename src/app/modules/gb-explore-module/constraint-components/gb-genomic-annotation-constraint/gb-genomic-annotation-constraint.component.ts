/**
 * Copyright 2018 EPFL LCA1
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';
import {GbConstraintComponent} from '../gb-constraint/gb-constraint.component';
import {AutoComplete} from 'primeng/components/autocomplete/autocomplete';
import {MessageHelper} from '../../../../utilities/message-helper';
import {TreeNode} from '../../../../models/tree-models/tree-node';
import {GenomicAnnotationConstraint} from "../../../../models/constraint-models/genomic-annotation-constraint";
import {Subject} from "rxjs";
import {debounceTime, distinctUntilChanged, switchMap} from 'rxjs/operators';
import {GenomicAnnotation} from "../../../../models/constraint-models/genomic-annotation";

@Component({
  selector: 'gb-genomic-annotation-constraint',
  templateUrl: './gb-genomic-annotation-constraint.component.html',
  styleUrls: ['./gb-genomic-annotation-constraint.component.css', '../gb-constraint/gb-constraint.component.css']
})
export class GbGenomicAnnotationConstraintComponent extends GbConstraintComponent implements OnInit {

  @ViewChild('annotationNameAutoComplete', { static: true }) annotationNameAutoComplete: AutoComplete;
  @ViewChild('annotationValueAutoComplete', { static: true }) annotationValueAutoComplete: AutoComplete;

  private _searchedAnnotations: GenomicAnnotation[];
  private _searchedAnnotationValues: string[];
  private annotationValuesSearchTerm: Subject<string>;

  /*
   * flag indicating if to show more options
   */
  private _showMoreOptions = false;

  ngOnInit() {
    this.initializeConstraints();
  }

  initializeConstraints(): Promise<any> {
    return new Promise<any>((resolve, reject) => {

      // default zygosity
      this.zygosityHomozygous = true;
      this.zygosityHeterozygous = true;
      this.zygosityUnknown = true;

      this.searchedAnnotations = [];
      this.searchedAnnotationValues = [];

      this.annotationValuesSearchTerm = new Subject();
      this.annotationValuesSearchTerm.pipe(
        debounceTime(200),
        distinctUntilChanged(),
        switchMap( (searchTerm: string) =>  this.genomicAnnotationsService.getAnnotationValues(this.selectedAnnotation, searchTerm))
      ).subscribe((vals: string[]) => this.searchedAnnotationValues = vals);

      this.showMoreOptions = false;
    });
  }

  /*
   * -------------------- event handlers: autocompletes --------------------
   */
  /**
   * when the user searches through annotation names list
   * @param event
   */
  annotationNameOnSearch(event) {
    let query = event.query.toLowerCase();
    let annotations = this.constraintService.genomicAnnotations;
    if (query) {
      this.searchedAnnotations = annotations.filter((genAnnotation: GenomicAnnotation) =>
        genAnnotation.displayName.toLowerCase().includes(query) ||
        genAnnotation.name.toLowerCase().includes(query)
      );
    } else {
      this.searchedAnnotations = annotations;
    }
  }

  /**
   * when the user searches through annotation values
   * @param event
   */
  annotationValueOnSearch(event) {
    let query = event.query.toLowerCase();
    if (query && this.selectedAnnotation) {
      this.annotationValuesSearchTerm.next(query);
    }
  }

  /**
   * Toggle the 'more options' panel
   */
  toggleMoreOptions() {
    this.showMoreOptions = !this.showMoreOptions;
  }

  onDrop(event: DragEvent) {
    event.stopPropagation();
    let selectedNode: TreeNode = this.treeNodeService.selectedTreeNode;
    this.droppedConstraint =
      this.constraintService.generateConstraintFromTreeNode(selectedNode, selectedNode ? selectedNode.dropMode : null);

    if (this.droppedConstraint && this.droppedConstraint.className === 'GenomicAnnotationConstraint') {
      this.genomicConstraint = this.droppedConstraint as GenomicAnnotationConstraint;
      this.initializeConstraints()
        .then(() => {
          this.update();
        });
    } else {
      const summary = `Dropped a ${this.droppedConstraint.className}, incompatible with GenomicAnnotationConstraint.`;
      MessageHelper.alert('error', summary);
    }
    this.treeNodeService.selectedTreeNode = null;
    this.droppedConstraint = null;
  }

  /*
   * -------------------- getters and setters --------------------
   */

  get genomicConstraint(): GenomicAnnotationConstraint {
    return this.constraint as GenomicAnnotationConstraint;
  }

  set genomicConstraint(value: GenomicAnnotationConstraint) {
    this.constraint = value;
  }

  get selectedAnnotation(): GenomicAnnotation {
    return this.genomicConstraint.annotation;
  }

  set selectedAnnotation(value: GenomicAnnotation) {
    this.genomicConstraint.annotation = value;
    this.initializeConstraints();
    this.update();
  }

  get selectedAnnotationValue(): string {
    return this.genomicConstraint.annotationValue;
  }

  set selectedAnnotationValue(value: string) {
    this.genomicConstraint.annotationValue = value;
    this.initializeConstraints();
    this.update();
  }

  get zygosityHomozygous(): boolean {
    return this.genomicConstraint.zygosityHomozygous;
  }

  set zygosityHomozygous(value: boolean) {
    this.genomicConstraint.zygosityHomozygous = value;
  }

  get zygosityHeterozygous(): boolean {
    return this.genomicConstraint.zygosityHeterozygous;
  }

  set zygosityHeterozygous(value: boolean) {
    this.genomicConstraint.zygosityHeterozygous = value;
  }

  get zygosityUnknown(): boolean {
    return this.genomicConstraint.zygosityUnknown;
  }

  set zygosityUnknown(value: boolean) {
    this.genomicConstraint.zygosityUnknown = value;
  }

  get searchedAnnotations(): GenomicAnnotation[] {
    return this._searchedAnnotations;
  }

  set searchedAnnotations(value: GenomicAnnotation[]) {
    this._searchedAnnotations = value;
  }

  get searchedAnnotationValues(): string[] {
    return this._searchedAnnotationValues;
  }

  set searchedAnnotationValues(value: string[]) {
    this._searchedAnnotationValues = value;
  }

  get showMoreOptions(): boolean {
    return this._showMoreOptions;
  }

  set showMoreOptions(value: boolean) {
    this._showMoreOptions = value;
  }
}
