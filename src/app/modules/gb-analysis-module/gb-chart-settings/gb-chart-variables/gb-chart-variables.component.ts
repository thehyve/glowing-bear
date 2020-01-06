import { Component, OnInit } from '@angular/core';
import {GbTreeNode} from '../../../../models/tree-node-models/gb-tree-node';
import {ChartService} from '../../../../services/chart.service';
import {TreeNodeService} from '../../../../services/tree-node.service';
import {FractalisService} from '../../../../services/fractalis.service';
import {ChartType} from '../../../../models/chart-models/chart-type';
import {FractalisChart} from '../../../../models/fractalis-models/fractalis-chart';
import {FractalisChartVariableMapper} from '../../fractalis-components/gb-fractalis-control/fractalis-chart-variable-mapper';

@Component({
  selector: 'gb-chart-variables',
  templateUrl: './gb-chart-variables.component.html',
  styleUrls: ['./gb-chart-variables.component.css']
})
export class GbChartVariablesComponent implements OnInit {

  public selectedVariablesTreeData: GbTreeNode[] = [];

  constructor(private chartService: ChartService,
              private treeNodeService: TreeNodeService,
              private fractalisService: FractalisService) {
  }


  ngOnInit() {
  }

  nodeSelect(event){
    let selectedVariable = this.treeNodeService.getConceptFromTreeNode(event.node);
    this.chartService.chartNumericVariables.push(selectedVariable);

  }

  nodeUnselect(event){
    this.fractalisService.clearValidation();
    let variable = this.treeNodeService.getConceptFromTreeNode(event.node);
    const index = this.chartService.chartNumericVariables.indexOf(variable);
    if (index >= 0) {
      this.chartService.chartNumericVariables.splice(index, 1);
    }
  }

  get chartVariablesTree(): GbTreeNode[] {
    return this.chartService.chartVariablesTree;
  }

  get isTreeLoadingCompleted(): boolean {
    return this.treeNodeService.isTreeNodesLoadingCompleted;
  }

  get validationErrorMessages(): string[] {
    return this.fractalisService.variablesValidationMessages;
  }

  get isValidationError(): boolean {
    return this.chartVariablesTree.length > 0 && this.fractalisService.variablesInvalid;
  }

}
