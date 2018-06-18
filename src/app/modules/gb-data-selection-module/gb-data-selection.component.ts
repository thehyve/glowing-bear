import {Component, OnInit} from '@angular/core';
import {FormatHelper} from '../../utilities/format-helper';
import {QueryService} from '../../services/query.service';

@Component({
  selector: 'gb-data-selection',
  templateUrl: './gb-data-selection.component.html',
  styleUrls: ['./gb-data-selection.component.css']
})
export class GbDataSelectionComponent implements OnInit {

  constructor(public queryService: QueryService) {
  }

  ngOnInit() {
  }

  /**
   * The event handler for the accordion tab open event,
   * to access the accordion, use event.index
   * @param event
   */
  openAccordion(event) {
  }

  /**
   * The event handler for the accordion tab close event,
   * to access the accordion, use event.index
   * @param event
   */
  closeAccordion(event) {
  }

  get subjectCount_0(): string {
    return FormatHelper.formatCountNumber(this.queryService.subjectCount_0);
  }

  get subjectCount_1(): string {
    return FormatHelper.formatCountNumber(this.queryService.subjectCount_1);
  }

  get subjectCount_2(): string {
    return FormatHelper.formatCountNumber(this.queryService.subjectCount_2);
  }

  get subjectCountPercentage_1(): string {
    return FormatHelper.percentage(this.queryService.subjectCount_1, this.queryService.subjectCount_0);
  }

  get subjectCountPercentage_2(): string {
    return FormatHelper.percentage(this.queryService.subjectCount_2, this.queryService.subjectCount_1);
  }

  get observationCount_0(): string {
    return FormatHelper.formatCountNumber(this.queryService.observationCount_0);
  }

  get observationCount_1(): string {
    return FormatHelper.formatCountNumber(this.queryService.observationCount_1);
  }

  get observationCount_2(): string {
    return FormatHelper.formatCountNumber(this.queryService.observationCount_2);
  }

  get observationCountPercentage_1(): string {
    return FormatHelper.percentage(this.queryService.observationCount_1, this.queryService.observationCount_0);
  }

  get observationCountPercentage_2(): string {
    return FormatHelper.percentage(this.queryService.observationCount_2, this.queryService.observationCount_1);
  }

  update_1(event) {
    event.stopPropagation();
    this.queryService.update_1();
  }

  update_2(event) {
    event.stopPropagation();
    this.queryService.update_2();
  }

  update_3(event) {
    event.stopPropagation();
    this.queryService.update_3();
  }
}
