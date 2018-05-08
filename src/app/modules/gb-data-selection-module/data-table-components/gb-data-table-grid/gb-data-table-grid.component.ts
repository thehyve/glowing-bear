import {Component, OnInit} from '@angular/core';
import {DataTableService} from '../../../../services/data-table.service';
import {Row} from '../../../../models/table-models/row';
import {HeaderRow} from '../../../../models/table-models/header-row';
import {Col} from '../../../../models/table-models/col';

@Component({
  selector: 'gb-data-table-grid',
  templateUrl: './gb-data-table-grid.component.html',
  styleUrls: ['./gb-data-table-grid.component.css']
})
export class GbDataTableGridComponent implements OnInit {

  constructor(private dataTableService: DataTableService) {
  }

  ngOnInit() {
  }

  get rows(): Row[] {
    return this.dataTableService.rows;
  }

  get cols(): Col[] {
    if (this.dataTableService.isUsingHeaders) {
      if (this.dataTableService.headerRows.length > 0) {
        return this.dataTableService.headerRows[this.dataTableService.headerRows.length - 1].cols;
      } else {
        return [];
      }
    } else {
      return this.dataTableService.cols;
    }
  }

  get isUsingHeaders(): boolean {
    return this.dataTableService.isUsingHeaders;
  }

  get headerRows(): HeaderRow[] {
    return this.dataTableService.headerRows;
  }

  get currentPage(): number {
    return this.dataTableService.dataTable.currentPage;
  }

  nextPage() {
    this.dataTableService.nextPage();
  }

  previousPage() {
    this.dataTableService.previousPage();
  }
}
