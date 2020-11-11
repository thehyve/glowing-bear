/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import { Component, OnInit, Input, Output, EventEmitter, ElementRef, ViewChild, OnChanges } from '@angular/core';
import { Concept } from 'app/models/constraint-models/concept';
import { ConstraintService } from 'app/services/constraint.service';
import { UIHelper } from 'app/utilities/ui-helper';
import { AutoComplete } from 'primeng/autocomplete';
import { TreeNodeService } from 'app/services/tree-node.service';
import { MessageHelper } from 'app/utilities/message-helper';
import { ConceptConstraint } from 'app/models/constraint-models/concept-constraint';
import { Granularity } from 'app/models/survival-analysis/granularity-type';
import { SelectItem } from 'primeng/api';
import { SurvivalAnalysisServiceMock } from 'app/services/survival-analysis-mock.service';

@Component({
  selector: 'gb-survival-settings',
  templateUrl: './gb-survival-settings.component.html',
  styleUrls: ['./gb-survival-settings.component.css'],
})
export class GbSurvivalSettingsComponent implements OnInit, OnChanges {
  _activated: boolean

  _granularities: SelectItem[] = [
    { label: 'Day', value: Granularity.day },
    { label: 'Week', value: Granularity.week },
    { label: 'Month', value: Granularity.month },
    { label: 'Year', value: Granularity.month }
  ]


  _suggestedStartConcepts: Concept[]

  startEventHovering = false
  endEventHovering = false
  _suggestedEndConcepts: Concept[]

  @ViewChild('autoComplete', { static: false }) autoComplete: AutoComplete;
  @ViewChild('autoCompleteContainer', { static: false }) autoCompleteContainer: HTMLElement;

  @Output() changedEventConcepts: EventEmitter<boolean> = new EventEmitter()

  constructor(private constraintService: ConstraintService,
    private survivalService: SurvivalAnalysisServiceMock,
    private element: ElementRef,
    private treeNodeService: TreeNodeService) { }

  ngOnInit() {
    this.changedEventConcepts.emit(
      this.survivalService.startConcept !== undefined && this.survivalService.endConcept !== undefined
    )

  }
  ngOnChanges() {
    let autoCompleteContainer2 = document.querySelector('#autoCompleteContainer')
    console.log('containers', this.autoCompleteContainer, autoCompleteContainer2)
    if (this.autoCompleteContainer) {
      this.autoCompleteContainer.addEventListener('dragenter', () => { console.log('dragenter') })
    }

  }

  searchStart(event) {

    let q = event.query.toLowerCase();

    let concepts = this.constraintService.concepts;
    console.log('q', q, 'concepts', concepts)
    if (q) {
      this.suggestedStartConcepts = concepts.filter((concept: Concept) => concept.path.toLowerCase().includes(q));
    } else {
      this.suggestedStartConcepts = concepts;
    }
    console.log('element', this.element)
    UIHelper.removePrimeNgLoaderIcon(this.element, 200)

  }
  searchEnd(event) {

    let q = event.query.toLowerCase();

    let concepts = this.constraintService.concepts;
    console.log('q', q, 'concepts', concepts)
    if (q) {
      this.suggestedEndConcepts = concepts.filter((concept: Concept) => concept.path.toLowerCase().includes(q));
    } else {
      this.suggestedEndConcepts = concepts;
    }
    console.log('element', this.element)
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


  onStartDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.startEventHovering = false
    let node = this.treeNodeService.selectedTreeNode
    if (node) {
      if (node.encryptionDescriptor.encrypted) {
        MessageHelper.alert('warn', 'Cannot select this concept as it is encrypted')
        return
      }


      let constraint = this.constraintService.generateConstraintFromTreeNode(node, node ? node.dropMode : null)
      let concept = (<ConceptConstraint>constraint).clone().concept
      if (!concept.code || concept.code === '') {
        MessageHelper.alert('warn', 'This concept has no code. Please, select one of its children.')
        return
      }
      this.startConcept = concept
    }

  }
  onEndDrop(event: DragEvent) {
    event.preventDefault()
    event.stopPropagation()
    this.endEventHovering = false
    let node = this.treeNodeService.selectedTreeNode
    if (node) {
      if (node.encryptionDescriptor.encrypted) {
        MessageHelper.alert('warn', 'Cannot select this concept as it is encrypted')
        return
      }

      let constraint = this.constraintService.generateConstraintFromTreeNode(node, node ? node.dropMode : null)
      let concept = (<ConceptConstraint>constraint).clone().concept
      if (!concept.code || concept.code === '') {
        MessageHelper.alert('warn', 'This concept has no code. Please, select one of its children.')
        return
      }
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


  get activated(): boolean {
    return this._activated
  }


  get granularities() {
    return this._granularities
  }

  get selectedGranularity(): Granularity {
    return this.survivalService.granularity
  }

  set selectedGranularity(gran: Granularity) {
    console.log(gran)
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

  set endModifier(mod: string) {
    this.survivalService.endModifier = mod
  }
  set startModifier(mod: string) {
    this.survivalService.startModifier = mod
  }

  get startModifier(): string {
    return this.survivalService.startModifier
  }

  get endModifier(): string {
    return this.survivalService.endModifier
  }


}
