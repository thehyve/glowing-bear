import {Component, OnInit} from '@angular/core';
import {TreeNode} from 'primeng/primeng';

@Component({
  selector: 'gb-table',
  templateUrl: './gb-table.component.html',
  styleUrls: ['./gb-table.component.css']
})
export class GbTableComponent implements OnInit {

  private _treeNodes: TreeNode[] = [];
  private _selectedTreeNodes;

  constructor() {
    this._treeNodes = [
      {
        'data': {
          'name': '1',
          'type': 'a'
        },
        'children': [
          {
            'data': {
              'name': '1.1',
              'type': 'a'
            }
          },
          {
            'data': {
              'name': '1.2',
              'type': 'a'
            }
          }
        ]
      },
      {
        'data': {
          'name': '2',
          'type': 'b'
        }
      },
      {
        'data': {
          'name': '3',
          'type': 'c'
        }
      }
    ];

  }

  ngOnInit() {
  }

  get treeNodes(): TreeNode[] {
    return this._treeNodes;
  }

  set treeNodes(value: TreeNode[]) {
    this._treeNodes = value;
  }

  get selectedTreeNodes() {
    return this._selectedTreeNodes;
  }

  set selectedTreeNodes(value) {
    this._selectedTreeNodes = value;
  }
}
