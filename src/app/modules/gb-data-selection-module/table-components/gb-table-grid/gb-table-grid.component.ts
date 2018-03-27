import {Component, OnInit} from '@angular/core';
import {TableService} from '../../../../services/table.service';
import {Col} from '../../../../models/table-models/col';
import {Row} from '../../../../models/table-models/row';

@Component({
  selector: 'gb-table-table',
  templateUrl: './gb-table-grid.component.html',
  styleUrls: ['./gb-table-grid.component.css']
})
export class GbTableTableComponent implements OnInit {

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
  }

  get rows(): Row[] {
    return this.tableService.rows;
  }

  get cols(): Col[] {
    return this.tableService.cols;
  }
}
