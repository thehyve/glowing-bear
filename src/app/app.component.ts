import {Component, ViewChild, OnInit} from '@angular/core';
import {WorkflowService} from './modules/shared/services/workflow.service';
import {EndpointService} from './modules/shared/services/endpoint.service';
import {ResourceService} from './modules/shared/services/resource.service';
import {DimensionRegistryService} from './modules/shared/services/dimension-registry.service';
import {ConstraintService} from './modules/shared/services/constraint.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  @ViewChild('parentContainer') parentContainer: any;
  @ViewChild('leftPanel') leftPanel: any;
  @ViewChild('gutter') gutter: any;
  @ViewChild('rightPanel') rightPanel: any;

  private isGutterDragged: boolean;
  private x_pos: number; // Stores x coordinate of the mouse pointer
  private x_gap: number; // Stores x gap (edge) between mouse and gutter

  constructor(private endpointService: EndpointService,
              private workflowService: WorkflowService,
              private resourceService: ResourceService,
              private dimensionRegistryService: DimensionRegistryService,
              private constraintService: ConstraintService) {
  }

  ngOnInit() {
    let parentContainerElm = this.parentContainer.nativeElement;
    let gutterElm = this.gutter.nativeElement;
    let leftPanelElm = this.leftPanel.nativeElement;
    let rightPanelElm = this.rightPanel.nativeElement;

    this.isGutterDragged = false;
    this.x_pos = 0;
    this.x_gap = 0;


    let onMouseDown = function (event) {
      // preventDefault() is used to
      // prevent browser change cursor icon while dragging
      event.preventDefault();
      this.isGutterDragged = true;
      this.x_gap = this.x_pos - gutterElm.offsetLeft;
      return false;
    }

    let onMouseMove = function (event) {
      this.x_pos = event.pageX;
      if (this.isGutterDragged) {
        let leftW = this.x_pos - this.x_gap;
        leftPanelElm.style.width = leftW + 'px';

        let bound = parentContainerElm.getBoundingClientRect();
        let rightW = bound.width - leftW - 10 - 2 * 3;
        rightPanelElm.style.width = rightW + 'px';
      }
    }

    let onMouseUp = function (event) {
      this.isGutterDragged = false;
    }

    gutterElm.addEventListener('mousedown', onMouseDown.bind(this));
    parentContainerElm.addEventListener('mousemove', onMouseMove.bind(this));
    parentContainerElm.addEventListener('mouseup', onMouseUp.bind(this));
  }

}
