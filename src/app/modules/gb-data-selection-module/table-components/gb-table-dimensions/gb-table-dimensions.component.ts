import {Component, OnInit} from '@angular/core';
import {Dimension} from '../../../../models/table-models/dimension';
import {TableService} from '../../../../services/table.service';

@Component({
  selector: 'gb-table-dimensions',
  templateUrl: './gb-table-dimensions.component.html',
  styleUrls: ['./gb-table-dimensions.component.css']
})
export class GbTableDimensionsComponent implements OnInit {

  public previouslySelectedDimensions: Dimension[];
  public selectedDimensions: Dimension[];

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
    this.previouslySelectedDimensions = [];
    this.selectedDimensions = [];
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

}


