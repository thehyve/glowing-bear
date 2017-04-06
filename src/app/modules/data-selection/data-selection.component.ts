import {Component, OnInit, Input} from '@angular/core';
import {WorkflowService} from "../shared/services/workflow.service";

@Component({
  selector: 'data-selection',
  templateUrl: './data-selection.component.html',
  styleUrls: ['./data-selection.component.css']
})
export class DataSelectionComponent implements OnInit {
  @Input() activeIds: string[];

  constructor(private workflowService: WorkflowService) {
    let workflow = workflowService.getCurrentWorkflow();
    this.activeIds = workflow['data-selection']['active-accordion-ids'];
  }

  ngOnInit() {
  }

  handleAccordionToggle(e) {
    let panelId = e['panelId'];
    let state = e['nextState'];
    let workflow = this.workflowService.getCurrentWorkflow();
    workflow.updateDataSelectionAccordion(panelId, state);
  }

}
