import {Component, OnInit} from '@angular/core';
import {Dimension} from '../../../../models/dimension';
import {TableService} from '../../../../services/table.service';

@Component({
  selector: 'gb-table-dimensions',
  templateUrl: './gb-table-dimensions.component.html',
  styleUrls: ['./gb-table-dimensions.component.css']
})
export class GbTableDimensionsComponent implements OnInit {

  public candidates: Dimension[];
  public rows: Dimension[];
  public cols: Dimension[];

  constructor(private tableService: TableService) {
  }

  ngOnInit() {
    this.rows = [];
    this.candidates = [];
    this.cols = [];

    for (let dim of this.tableService.generateTableDimensions()) {
      this.candidates.push(dim);
    }
  }

}
