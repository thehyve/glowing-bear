/**
 * Copyright 2020 - 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild} from '@angular/core';
import {Concept} from 'app/models/constraint-models/concept';
import {ConstraintService} from 'app/services/constraint.service';
import {UIHelper} from 'app/utilities/ui-helper';
import {AutoComplete} from 'primeng/autocomplete';
import {TreeNodeService} from 'app/services/tree-node.service';
import {MessageHelper} from 'app/utilities/message-helper';
import {ConceptConstraint} from 'app/models/constraint-models/concept-constraint';
import {Granularity} from 'app/models/survival-analysis/granularity-type';
import {SelectItem} from 'primeng/api';
import {SurvivalService} from 'app/services/survival-analysis.service';
import {TreeNodeType} from 'app/models/tree-models/tree-node-type';
import {When} from 'app/models/survival-analysis/when-type';
import {AnalysisService} from 'app/services/analysis.service';

@Component({
  selector: 'gb-survival-settings',
  templateUrl: './gb-survival-settings.component.html',
  styleUrls: ['./gb-survival-settings.component.css'],
})
export class GbSurvivalSettingsComponent implements OnInit, OnChanges {
  _activated: boolean

  _granularities: SelectItem[] = [
    { label: 'days', value: Granularity.day },
    { label: 'weeks', value: Granularity.week },
    { label: 'months', value: Granularity.month },
    { label: 'years', value: Granularity.year }
  ]

  _temporalBoundaries: SelectItem[] = [
    { label: 'Earliest observation', value: When.earliest },
    { label: 'Latest observation', value: When.latest }
  ]


  _suggestedStartConcepts: Concept[]

  startEventHovering = false
  endEventHovering = false
  _suggestedEndConcepts: Concept[]

  @ViewChild('autoComplete', { static: false }) autoComplete: AutoComplete;
  @ViewChild('autoCompleteContainer', { static: false }) autoCompleteContainer: HTMLElement;

  @Output() changedEventConcepts: EventEmitter<boolean> = new EventEmitter()

  constructor(private analysisService: AnalysisService,
    private constraintService: ConstraintService,
    private survivalService: SurvivalService,
    private element: ElementRef,
    private treeNodeService: TreeNodeService) { }

  ngOnInit() {
    this.changedEventConcepts.emit(
      this.survivalService.startConcept !== undefined && this.survivalService.endConcept !== undefined
    )

  }
  ngOnChanges() {

  }

  searchStart(event) {
    let results = this.constraintService.searchAllConstraints(event.query);
    this.suggestedStartConcepts = results
      .filter(constraint => constraint instanceof ConceptConstraint)
      .map(constraint => (constraint as ConceptConstraint).concept);
    UIHelper.removePrimeNgLoaderIcon(this.element, 200)
  }
  searchEnd(event) {
    let results = this.constraintService.searchAllConstraints(event.query);
    this.suggestedEndConcepts = results
      .filter(constraint => constraint instanceof ConceptConstraint)
      .map(constraint => (constraint as ConceptConstraint).concept);
    UIHelper.removePrimeNgLoaderIcon(this.element, 200)
  }
  onStartDragOver(event: DragEvent) {
    event.preventDefault()
    this.startEventHovering = true
  }
  onEndDragOver(event: DragEvent) {
    event.preventDefault()
    this.endEventHovering = true
  }
  onEndDragLeave(event: DragEvent) {
    this.endEventHovering = false
  }
  onStartDragLeave(event: DragEvent) {
    this.startEventHovering = false

  }

  private onDrop(event: DragEvent): Concept {
    event.preventDefault()
    event.stopPropagation()
    let node = this.treeNodeService.selectedTreeNode
    if (node) {
      if (node.encryptionDescriptor.encrypted) {
        MessageHelper.alert('warn', 'Cannot select this concept as it is encrypted')
        return
      }
      switch (node.nodeType) {
        case TreeNodeType.CONCEPT:
        case TreeNodeType.CONCEPT_FOLDER:
        case TreeNodeType.MODIFIER:
        case TreeNodeType.MODIFIER_FOLDER:
          let constraint = this.constraintService.generateConstraintFromTreeNode(node, node ? node.dropMode : null)
          let concept = (<ConceptConstraint>constraint).clone().concept
          return concept
        case TreeNodeType.CONCEPT_CONTAINER:
        case TreeNodeType.MODIFIER_CONTAINER:
          MessageHelper.alert('warn', `${node.displayName} is a container and cannot be used`)
          break;
        default:
          break;
      }
    }
    return null


  }

  onStartDrop(event: DragEvent) {
    this.startEventHovering = false
    let concept = this.onDrop(event)
    if (concept) {
      this.startConcept = concept
    }
  }
  onEndDrop(event: DragEvent) {
    this.endEventHovering = false
    let concept = this.onDrop(event)
    if (concept) {
      this.endConcept = concept
    }
  }

  onDropdown(event) {

    UIHelper.removePrimeNgLoaderIcon(this.element, 200);

  }

  @Input()
  set activated(bool: boolean) {
    this._activated = bool
  }

  get expanded(): boolean {
    return this.analysisService.survivalSettingsExpanded
  }

  set expanded(val: boolean) {
    this.analysisService.survivalSettingsExpanded = val
  }


  get activated(): boolean {
    return this._activated
  }


  get granularities() {
    return this._granularities
  }

  get temporalBoundaries() {
    return this._temporalBoundaries
  }

  get selectedStartsWhen(): When {
    return this.survivalService.startsWhen
  }

  set selectedStartsWhen(when: When) {
    this.survivalService.startsWhen = when
  }

  get selectedEndsWhen(): When {
    return this.survivalService.endsWhen
  }

  set selectedEndsWhen(when: When) {
    this.survivalService.endsWhen = when
  }

  get selectedGranularity(): Granularity {
    return this.survivalService.granularity
  }

  set selectedGranularity(gran: Granularity) {
    this.survivalService.granularity = gran
  }

  get limit(): number {
    return this.survivalService.limit
  }

  set limit(num: number) {
    this.survivalService.limit = num
  }
  set startConcept(concept: Concept) {
    this.survivalService.startConcept = concept
    this.changedEventConcepts.emit(
      this.survivalService.startConcept !== undefined && this.survivalService.endConcept !== undefined
    )
  }
  get startConcept(): Concept {
    return this.survivalService.startConcept
  }
  set endConcept(concept: Concept) {
    this.survivalService.endConcept = concept
    this.changedEventConcepts.emit(
      this.survivalService.startConcept !== undefined && this.survivalService.endConcept !== undefined
    )
  }
  get endConcept(): Concept {
    return this.survivalService.endConcept
  }
  set suggestedStartConcepts(concepts: Concept[]) {
    this._suggestedStartConcepts = concepts
  }
  get suggestedStartConcepts(): Concept[] {
    return this._suggestedStartConcepts
  }
  set suggestedEndConcepts(concepts: Concept[]) {
    this._suggestedEndConcepts = concepts
  }
  get suggestedEndConcepts(): Concept[] {
    return this._suggestedEndConcepts
  }

  reset() {
    this.limit = 48
    this.selectedGranularity = Granularity.month
    this.startConcept = undefined
    this.selectedStartsWhen = When.earliest
    this.endConcept = undefined
    this.selectedEndsWhen = When.earliest
  }
}
