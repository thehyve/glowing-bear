import {Component, OnInit} from '@angular/core';
import {Dimension} from '../../../../models/table-models/dimension';
import {TableService} from '../../../../services/table.service';
import {DimensionZoneEnum} from '../../../../models/table-models/dimension-zone-enum';

@Component({
  selector: 'gb-table-dimensions',
  templateUrl: './gb-table-dimensions.component.html',
  styleUrls: ['./gb-table-dimensions.component.css']
})
export class GbTableDimensionsComponent implements OnInit {

  public DimensionZoneEnum: typeof DimensionZoneEnum = DimensionZoneEnum;
  public previouslySelectedDimensions: Dimension[];
  public selectedDimensions: Dimension[];

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
    this.previouslySelectedDimensions = [];
    this.selectedDimensions = [];
  }

  selectDimension(event: MouseEvent, dim: Dimension, originZone: DimensionZoneEnum) {
    let originArr = [];

    const len = this.previouslySelectedDimensions.length;
    let recentDim = len > 0 ? this.previouslySelectedDimensions[len - 1] : null;

    switch (originZone) {
      case DimensionZoneEnum.Candidates: {
        originArr = this.candidates;
        break;
      }
      case DimensionZoneEnum.Rows: {
        originArr = this.rows;
        break;
      }
      case DimensionZoneEnum.Columns: {
        originArr = this.cols;
        break;
      }
    }
    // multi selection key+mouse combo
    if (event.altKey) {
      // separate selections
      for (let sDim of this.selectedDimensions) {
        const idx = originArr.indexOf(sDim);
        if (idx === -1) {
          originArr.splice(idx, 1);
        }
      }
      this.selectedDimensions.push(dim);
    } else if (event.shiftKey) {
      // consecutive selections
      this.selectedDimensions = [];
      let startIndex = originArr.indexOf(recentDim) > -1 ? originArr.indexOf(recentDim) : 0;
      let endIndex = originArr.indexOf(dim);
      if (endIndex < startIndex) {
        const temp = endIndex;
        endIndex = startIndex;
        startIndex = temp;
      }
      for (let i = startIndex; i <= endIndex; i++) {
        this.selectedDimensions.push(originArr[i]);
      }
    } else {
      if (dim.selected) {
        dim.selected = false;
        const idx = this.selectedDimensions.indexOf(dim);
        if (idx > -1) {
          this.selectedDimensions.splice(idx, 1);
        }
      } else {
        this.selectedDimensions = [dim];
      }
    }

    // update selected dimensions flags
    for (let aDim of this.rows) {
      aDim.selected = false;
    }
    for (let aDim of this.cols) {
      aDim.selected = false;
    }
    for (let aDim of this.candidates) {
      aDim.selected = false;
    }
    for (let sDim of this.selectedDimensions) {
      sDim.selected = true;
    }

    // update previously selected dimensions
    if (dim.selected) {
      let pIndex = this.previouslySelectedDimensions.indexOf(dim);
      if (pIndex > -1) {
        this.previouslySelectedDimensions.splice(pIndex, 1);
      }
      this.previouslySelectedDimensions.push(dim);
    }
  }

  moveDimensions(origin: Dimension[], destination: Dimension[], moveAll?: boolean) {
    let dimensionsToBeMoved = this.selectedDimensions.concat([]);
    if (moveAll) {
      dimensionsToBeMoved = origin.concat([]);
    }
    if (dimensionsToBeMoved && dimensionsToBeMoved.length > 0) {
      for (let dim of dimensionsToBeMoved) {
        let index = origin.indexOf(dim);
        if (index > -1) {
          destination.push(dim);
          origin.splice(index, 1);
        }
      }
      for (let dim of this.selectedDimensions) {
        dim.selected = false;
      }
      this.selectedDimensions = [];
      this.previouslySelectedDimensions = [];
    }
  }

  get rows(): Dimension[] {
    return this.tableService.rows;
  }

  set rows(value: Dimension[]) {
    this.tableService.rows = value;
  }

  get cols(): Dimension[] {
    return this.tableService.columns;
  }

  set cols(value: Dimension[]) {
    this.tableService.columns = value;
  }

  get candidates(): Dimension[] {
    return this.tableService.candidates;
  }

  set candidates(value: Dimension[]) {
    this.tableService.candidates = value;
  }

}


