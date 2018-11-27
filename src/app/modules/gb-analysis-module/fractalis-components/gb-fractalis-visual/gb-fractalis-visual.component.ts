/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Component, ElementRef, OnInit} from '@angular/core';
import {CompactType, DisplayGrid, GridsterConfig, GridsterItem, GridType} from 'angular-gridster2';
import {FractalisService} from '../../../../services/fractalis.service';
import {Chart} from '../../../../models/chart-models/chart';

@Component({
  selector: 'gb-fractalis-visual',
  templateUrl: './gb-fractalis-visual.component.html',
  styleUrls: ['./gb-fractalis-visual.component.css']
})
export class GbFractalisVisualComponent implements OnInit {

  cellWidth = 300;
  cellHeight = 300;
  margin = 10;
  options: GridsterConfig;

  /*
   * TODO: modify fractalis.js so that it is responsive to gridster layout
   */
  constructor(private fractalisService: FractalisService, private el: ElementRef) {
  }

  ngOnInit() {
    this.options = {
      gridType: GridType.VerticalFixed,
      compactType: CompactType.None,
      margin: this.margin,
      outerMargin: true,
      outerMarginTop: null,
      outerMarginRight: null,
      outerMarginBottom: null,
      outerMarginLeft: null,
      mobileBreakpoint: 640,
      minCols: 3,
      maxCols: 3,
      minRows: 1,
      maxRows: 100,
      maxItemCols: 30,
      minItemCols: 1,
      maxItemRows: 30,
      minItemRows: 1,
      maxItemArea: 2500,
      minItemArea: 1,
      defaultItemCols: 1,
      defaultItemRows: 1,
      fixedColWidth: this.cellWidth,
      fixedRowHeight: this.cellHeight,
      keepFixedHeightInMobile: false,
      keepFixedWidthInMobile: false,
      scrollSensitivity: 10,
      scrollSpeed: 20,
      enableEmptyCellClick: false,
      enableEmptyCellContextMenu: false,
      enableEmptyCellDrop: false,
      enableEmptyCellDrag: false,
      emptyCellDragMaxCols: 50,
      emptyCellDragMaxRows: 50,
      ignoreMarginInRow: false,
      draggable: {
        enabled: true,
      },
      resizable: {
        enabled: true,
      },
      swap: false,
      pushItems: true,
      disablePushOnDrag: false,
      disablePushOnResize: false,
      pushDirections: {north: true, east: true, south: true, west: true},
      pushResizeItems: false,
      displayGrid: DisplayGrid.Always,
      disableWindowResize: false,
      disableWarnings: false,
      scrollToNewItems: false,
      itemChangeCallback: this.adjustHeight.bind(this)
    };
    this.adjustHeight();
  }

  private adjustHeight() {
    let numRows = 0;
    this.charts.forEach((chart: Chart) => {
      const item = chart.gridsterItem;
      const row = item.y + item.rows - 1;
      numRows = item.y > numRows ? item.y : numRows;
    });
    numRows += 2;
    const h = numRows * (this.cellHeight + this.margin) + 20;
    this.el.nativeElement
      .querySelector('.fractalis-visual-container').style['height'] = 'auto';
  }

  onRemoveChart(e, chart: Chart) {
    e.preventDefault();
    e.stopPropagation();
    this.fractalisService.removeChart(chart);
  }

  onClearCharts() {
    this.fractalisService.charts.length = 0;
    this.adjustHeight();
  }

  get charts(): Chart[] {
    return this.fractalisService.charts;
  }

}
