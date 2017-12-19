import {Component, OnInit} from '@angular/core';
import {QueryService} from '../../services/query.service';
import { FormatHelper } from '../../util/format-helper';
import { TreeNodeService } from '../../services/tree-node.service';

@Component({
  selector: 'gb-data-selection',
  templateUrl: './gb-data-selection.component.html',
  styleUrls: ['./gb-data-selection.component.css']
})
export class GbDataSelectionComponent implements OnInit {

  constructor(public queryService: QueryService, public treeNodeService: TreeNodeService) {
  }

  ngOnInit() {
  }

  /**
   * The event handler for the accordion tab open event,
   * to access the accordion, use event.index
   * @param event
   */
  openAccordion(event) {
    if (event.index === 1) {
      // open projection
      this.queryService.prepareStep2();
    } else if (event.index === 3) {
      // open export
      this.queryService.updateExports();
    }
  }

  /**
   * The event handler for the accordion tab close event,
   * to access the accordion, use event.index
   * @param event
   */
  closeAccordion(event) {
  }

  updateCounts_1(event) {
    event.stopPropagation();
    this.queryService.updateCounts_1();
  }

  updateCounts_2(event) {
    event.stopPropagation();
    this.queryService.updateCounts_2();
  }

  get subjectCount_0(): string {
    return FormatHelper.formatNumber(this.queryService.subjectCount_0);
  }

  get subjectCount_1(): string {
    return FormatHelper.formatNumber(this.queryService.subjectCount_1);
  }

  get subjectCount_2(): string {
    return FormatHelper.formatNumber(this.queryService.subjectCount_2);
  }

  get subjectCountPercentage_1(): string {
      return FormatHelper.percentage(this.queryService.subjectCount_1, this.queryService.subjectCount_0);
  }

  get subjectCountPercentage_2(): string {
    return FormatHelper.percentage(this.queryService.subjectCount_2, this.queryService.subjectCount_1);
  }

  get observationCount_0(): string {
    return FormatHelper.formatNumber(this.queryService.observationCount_0);
  }

  get observationCount_1(): string {
    return FormatHelper.formatNumber(this.queryService.observationCount_1);
  }

  get observationCount_2(): string {
    return FormatHelper.formatNumber(this.queryService.observationCount_2);
  }

  get observationCountPercentage_1(): string {
    return FormatHelper.percentage(this.queryService.observationCount_1, this.queryService.observationCount_0);
  }

  get observationCountPercentage_2(): string {
    return FormatHelper.percentage(this.queryService.observationCount_2, this.queryService.observationCount_1);
  }

  get selectedConcepts(): number {
    return this.treeNodeService.selectionCount ? this.treeNodeService.selectionCount.concepts : null;
  }

  get selectedConceptCount(): string {
    return FormatHelper.formatNumber(this.selectedConcepts);
  }

  get conceptCount_2(): string {
    return FormatHelper.formatNumber(this.queryService.conceptCount_2);
  }

  get selectedConceptCountPercentage(): string {
    return FormatHelper.percentage(this.selectedConcepts, this.queryService.conceptCount_2);
  }

  get selectedStudies(): number {
    return this.treeNodeService.selectionCount ? this.treeNodeService.selectionCount.studies : null;
  }

  get selectedStudyCount(): string {
    return FormatHelper.formatNumber(this.selectedStudies);
  }

  get studyCount_2(): string {
    return FormatHelper.formatNumber(this.queryService.studyCount_2);
  }

  get selectedStudyCountPercentage(): string {
    return FormatHelper.percentage(this.selectedStudies, this.queryService.studyCount_2);
  }

  get counting_1() {
    return this.queryService.isUpdating_1;
  }

  get counting_2() {
    return this.queryService.isUpdating_2;
  }

  get dirty_1() {
    return this.queryService.dirty_1;
  }

  get dirty_2() {
    return this.queryService.dirty_2;
  }

}
