import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {DropMode} from '../../../../models/drop-mode';

@Component({
  selector: 'queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent implements OnInit, AfterViewInit {

  observer: MutationObserver;
  collapsed = false;

  constructor(public treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private element: ElementRef) {
  }

  ngOnInit() {
  }

  ngAfterViewInit() {
    this.observer = new MutationObserver(this.update.bind(this));
    const config = {
      attributes: false,
      subtree: true,
      childList: true,
      characterData: false
    };

    this.observer.observe(this.element.nativeElement, config);
  }

  update() {
    let panels = this.element.nativeElement.querySelectorAll('.gb-query-panel');
    let index = 0;
    for (let panel of panels) {
      let correspondingQuery = this.treeNodeService.queries[index];
      panel.addEventListener('dragstart', (function () {
        correspondingQuery['dropMode'] = DropMode.Query;
        this.constraintService.selectedNode = correspondingQuery;
      }).bind(this));
      index++;
    }
  }

  toggleQueryPanel(query) {
    query['collapsed'] = !query['collapsed'];
  }

  getQueryToggleButtonIcon(query) {
    return query['collapsed'] ? 'fa-angle-down' : 'fa-angle-up';
  }

  toggleQueryBookmark(query) {
    query['bookmarked'] = !query['bookmarked'];
    const queryObject = {
      bookmarked: query['bookmarked']
    };
    this.constraintService.updateQuery(query['id'], queryObject);
  }

  getQueryBookmarkButtonIcon(query) {
    return query['bookmarked'] ? 'fa-star' : 'fa-star-o';
  }

  selectQuery(selectedQuery) {
    for (let query of this.treeNodeService.queries) {
      query['selected'] = false;
    }
    selectedQuery['selected'] = true;
    // Update patient constraint
    this.constraintService.clearSelectionConstraint();
    let patientConstraint =
      this.constraintService.generateConstraintFromConstraintObject(selectedQuery['patientsQuery']);
    this.constraintService.putPatientConstraint(patientConstraint);

    // Update observation constraint
    this.constraintService.clearObservationConstraint();
    let observationConstraint =
      this.constraintService.generateConstraintFromConstraintObject(selectedQuery['observationsQuery']);
    this.constraintService.putObservationConstraint(observationConstraint);
  }

  getQuerySelectionButtonIcon(query) {
    return query['selected'] ? 'fa-arrow-circle-right' : 'fa-arrow-circle-o-right';
  }

  removeQuery(query) {
    this.constraintService.deleteQuery(query);
  }

  editQueryName(event, query) {
    event.preventDefault();
    event.stopPropagation();
    query['nameEditable'] = true;
  }

  onQueryPanelClick(query) {
    // Save the query if its name has been modified
    if (query['nameEditable']) {
      query['nameEditable'] = false;
      const queryObject = {
        name: query['name']
      };
      this.constraintService.updateQuery(query['id'], queryObject);
    }
  }
}
