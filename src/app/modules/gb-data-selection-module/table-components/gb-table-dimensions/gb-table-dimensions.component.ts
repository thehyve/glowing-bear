import {Component, OnInit} from '@angular/core';
import {Dimension} from '../../../../models/table-models/dimension';
import {TableService} from '../../../../services/table.service';
import {QueryService} from '../../../../services/query.service';

@Component({
  selector: 'gb-table-dimensions',
  templateUrl: './gb-table-dimensions.component.html',
  styleUrls: ['./gb-table-dimensions.component.css']
})
export class GbTableDimensionsComponent implements OnInit {

  constructor(private tableService: TableService,
              private queryService: QueryService) {
  }

  ngOnInit() {
  }

  onChange() {
    this.queryService.isDirty_3 = true;
    if (this.queryService.instantCountsUpdate_3) {
      this.queryService.update_3();
    }
  }

  /**
   * This function handles the drop event when the user is reordering dimensions within
   * the same row-dimension container or the same column-dimension container
   */
  onDrop() {
    let changed = false;
    if (this.tableService.prevRowDimensions.length === this.tableService.rowDimensions.length) {
      for (let i = 0; i < this.tableService.rowDimensions.length; i++) {
        const prev = this.tableService.prevRowDimensions[i].name;
        const current = this.tableService.rowDimensions[i].name;
        if (prev !== current) {
          changed = true;
          break;
        }
      }
    }
    if (!changed) {
      if (this.tableService.prevColDimensions.length === this.tableService.columnDimensions.length) {
        for (let i = 0; i < this.tableService.columnDimensions.length; i++) {
          const prev = this.tableService.prevColDimensions[i].name;
          const current = this.tableService.columnDimensions[i].name;
          if (prev !== current) {
            changed = true;
            break;
          }
        }
      }
    }
    if (changed) {
      this.onChange();
    }
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


