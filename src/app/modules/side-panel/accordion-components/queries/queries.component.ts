import {Component, OnInit, ElementRef, AfterViewInit} from '@angular/core';
import {ConstraintService} from '../../../../services/constraint.service';
import {DimensionRegistryService} from '../../../../services/dimension-registry.service';
import {DropMode} from '../../../../models/drop-mode';
import {ResourceService} from '../../../../services/resource.service';

@Component({
  selector: 'app-queries',
  templateUrl: './queries.component.html',
  styleUrls: ['./queries.component.css']
})
export class QueriesComponent implements OnInit, AfterViewInit {

  observer: MutationObserver;
  collapsed = false;

  constructor(public dimensionRegistry: DimensionRegistryService,
              private constraintService: ConstraintService,
              private resourceService: ResourceService,
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
      let correspondingQuery = this.dimensionRegistry.queries[index];
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
    this.resourceService.updateQuery(query['id'], queryObject)
      .subscribe(
        () => {
        },
        err => console.error(err)
      );
  }

  getQueryBookmarkButtonIcon(query) {
    return query['bookmarked'] ? 'fa-star' : 'fa-star-o';
  }

  selectQuery(selectedQuery) {
    for (let query of this.dimensionRegistry.queries) {
      query['selected'] = false;
    }
    selectedQuery['selected'] = true;
    // TODO: fill the patient and observation selection accordions with the selected query
  }

  getQuerySelectionButtonIcon(query) {
    return query['selected'] ? 'fa-arrow-circle-right' : 'fa-arrow-circle-o-right';
  }

  removeQuery(query) {
    this.resourceService.deleteQuery(query['id'])
      .subscribe(
        () => {
          const index = this.dimensionRegistry.queries.indexOf(query);
          if (index > -1) {
            this.dimensionRegistry.queries.splice(index, 1);
          }
          // An alternative would be to directly update the queries
          // this.dimensionRegistry.updateQueries()
          // but this approach leaves the all queries to remain collapsed
        },
        err => console.error(err)
      );
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
      console.log('save query: ', queryObject);
      this.resourceService.updateQuery(query['id'], queryObject)
        .subscribe(
          () => {
          },
          err => console.error(err)
        );
    }
  }
}
