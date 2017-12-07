import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'gb-data-selection',
  templateUrl: './gb-data-selection.component.html',
  styleUrls: ['./gb-data-selection.component.css']
})
export class GbDataSelectionComponent implements OnInit {

  constructor() {
  }

  ngOnInit() {}

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
}
