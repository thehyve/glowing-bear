import {Component, OnInit, Input} from '@angular/core';
import {WorkflowService} from "../shared/services/workflow.service";

@Component({
  selector: 'data-selection',
  templateUrl: './data-selection.component.html',
  styleUrls: ['./data-selection.component.css']
})
export class DataSelectionComponent implements OnInit {
  @Input() activeIds: string[];

  constructor(private workflowService: WorkflowService) { console.log('ds construct');
    let workflow = workflowService.getCurrentWorkflow();
    this.activeIds = workflow['data-selection']['active-accordion-ids'];
  }

  ngOnInit() {
    console.log('ds init');
  }

  handleAccordionToggle(e) {
    this.workflowService.getCurrentWorkflow()
      .updateDataSelectionAccordion(e['panelId'], e['nextState']);
  }

}
