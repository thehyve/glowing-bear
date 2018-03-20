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

  get rowDimensions(): Dimension[] {
    return this.tableService.rowDimensions;
  }

  set rowDimensions(value: Dimension[]) {
    this.tableService.rowDimensions = value;
  }

  get columnDimensions(): Dimension[] {
    return this.tableService.columnDimensions;
  }

  set columnDimensions(value: Dimension[]) {
    this.tableService.columnDimensions = value;
  }

}


