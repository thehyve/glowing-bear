import {Component, ViewChild, OnInit} from '@angular/core';
import {EndpointService} from './services/endpoint.service';
import {ResourceService} from './services/resource.service';
import {ConstraintService} from './services/constraint.service';
import {TreeNodeService} from './services/tree-node.service';
import {QueryService} from './services/query.service';
import {TableService} from './services/table.service';
import {TransmartResourceService} from './services/transmart-resource/transmart-resource.service';

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
              private resourceService: ResourceService,
              private transmartResourceService: TransmartResourceService,
              private treeNodeService: TreeNodeService,
              private constraintService: ConstraintService,
              private queryService: QueryService,
              private tableService: TableService) {
  }

  ngOnInit() {
    const parentContainerElm = this.parentContainer.nativeElement;
    const gutterElm = this.gutter.nativeElement;
    const leftPanelElm = this.leftPanel.nativeElement;
    const rightPanelElm = this.rightPanel.nativeElement;

    this.isGutterDragged = false;
    this.x_pos = 0;
    this.x_gap = 0;

    const adjustNavbarWidth = function () {
      const navbar = parentContainerElm.querySelector('.gb-navbar');
      if (navbar) {
        const leftWidth = leftPanelElm.clientWidth;
        const rightWidth = rightPanelElm.clientWidth;
        const percentage = rightWidth / (rightWidth + leftWidth + 36);
        navbar.style.width = (percentage * 100) + '%';
      }
    }

    const onMouseDown = function (event) {
      // preventDefault() is used to
      // prevent browser change cursor icon while dragging
      event.preventDefault();
      this.isGutterDragged = true;
      this.x_gap = this.x_pos - gutterElm.offsetLeft;
      return false;
    };

    const onMouseMove = function (event) {
      this.x_pos = event.pageX;
      if (this.isGutterDragged) {
        let leftW = this.x_pos - this.x_gap;
        leftPanelElm.style.width = leftW + 'px';
        let bound = parentContainerElm.getBoundingClientRect();
        let rightW = bound.width - leftW - 10 - 2 * 3;
        rightPanelElm.style.width = rightW + 'px';
        adjustNavbarWidth();
      }
    };

    const onMouseUp = function (event) {
      this.isGutterDragged = false;
    };

    const onResize = function (event) {
      if (leftPanelElm.style.width !== '') {
        leftPanelElm.style.width = '';
      }
      if (rightPanelElm.style.width !== '') {
        rightPanelElm.style.width = '';
      }
      adjustNavbarWidth();
    };

    gutterElm.addEventListener('mousedown', onMouseDown.bind(this));
    parentContainerElm.addEventListener('mousemove', onMouseMove.bind(this));
    parentContainerElm.addEventListener('mouseup', onMouseUp.bind(this));
    window.addEventListener('resize', onResize.bind(this));
  }

  logout() {
    this.resourceService.logout()
      .subscribe(
        res => {
          this.endpointService.invalidateToken();
        }
      );
  }

}
