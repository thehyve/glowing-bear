import {Injectable} from '@angular/core';
import {AuthenticationService} from './authentication/authentication.service';
import * as fjs from 'fractalis';
import {MessageHelper} from '../utilities/message-helper';
import {ChartType} from '../models/chart-models/chart-type';
import {Chart} from '../models/chart-models/chart';
import {SelectItem} from 'primeng/api';
import {Concept} from '../models/constraint-models/concept';

@Injectable({
  providedIn: 'root'
})
export class FractalisService {

  private _F: any; // The fractalis object
  private _availableChartTypes: SelectItem[] = [];
  private _selectedChartType: ChartType = null;
  private _charts: Chart[] = [];
  private _selectedVariables: Concept[] = [];

  constructor(private authService: AuthenticationService) {
    let token = this.authService.token;
    // TODO: dynamically get the endpoints
    const config = {
      // handler: 'transmart',
      // dataSource: 'http://192.168.178.24:8081',
      // fractalisNode: 'http://localhost',
      handler: 'demo_tcga_coad',
      dataSource: location.protocol + '//' + window.location.host,
      fractalisNode: 'http://localhost:5000',
      getAuth() {
        return {token: token}
      },
      options: {
        controlPanelPosition: 'right',
        controlPanelExpanded: true
        // controlPanelHidden: false,
        // showDataBox: true
      }
    };
    if (fjs.fractalis) {

      // this.F.loadData([descriptor])
      //   .then(res => {
      //     console.log('response here', res);
      //   })
      //   .catch(err => {
      //     console.log('cannot load data: ');
      //     console.log(err)
      //   });
      this.F = fjs.fractalis.init(config);
      this.setSubsets();
      this.clearData();
      this.loadData();
      console.log('Fractalis imported: ', this.availableChartTypes);
      this.retrieveAvailableChartTypes();
    } else {
      MessageHelper.alert('error', 'Fail to import Fractalis.');
    }
  }
  //
  // private loadData() {
  //   const constraint = {
  //     type: 'concept',
  //     conceptCode: 'O1KP:NUM1'
  //   };
  //   const descriptor = {
  //     constraint: JSON.stringify(constraint),
  //     data_type: 'numerical',
  //     label: 'This is a test'
  //   };
  //   this.F.loadData([descriptor])
  //     .then(res => {
  //       console.log('response here', res);
  //     })
  //     .catch(err => {
  //       console.log('cannot load data: ');
  //       console.log(err)
  //     });
  // }

  private retrieveAvailableChartTypes() {
    const types: string[] = this.F.getAvailableCharts();
    types.forEach((t: string) => {
      const type = <ChartType>t.toLowerCase();
      this.availableChartTypes.push({
        label: type,
        value: type
      });
    });
    this.availableChartTypes.push({
      label: ChartType.CROSSTABLE,
      value: ChartType.CROSSTABLE
    });
  }

  public addChart() {
    // if (this.selectedChartType) {
    //   let chart = new Chart(this.selectedChartType);
    //   chart.variables = [...this.selectedVariables]; // clone a new array
    //   this.charts.push(chart);
    // }
    const container = document.querySelector('.charts');
    const chartDiv = document.createElement('div');
    chartDiv.style.width = '30vw';
    chartDiv.style.height = '30vw';
    container.appendChild(chartDiv);
    chartDiv.id = `chart-${container.childNodes.length}`;
    this.F.setChart(this.selectedChartType, '#' + chartDiv.id);
    console.log('Chart set');
  }

  public removeChart(chart: Chart) {
    this.charts.splice(this.charts.indexOf(chart), 1);
  }

  get availableChartTypes(): SelectItem[] {
    return this._availableChartTypes;
  }

  set availableChartTypes(value: SelectItem[]) {
    this._availableChartTypes = value;
  }

  get selectedChartType(): ChartType {
    return this._selectedChartType;
  }

  set selectedChartType(value: ChartType) {
    this._selectedChartType = value;
  }

  get charts(): Chart[] {
    return this._charts;
  }

  set charts(value: Chart[]) {
    this._charts = value;
  }

  get selectedVariables(): Concept[] {
    return this._selectedVariables;
  }

  set selectedVariables(value: Concept[]) {
    this._selectedVariables = value;
  }

  get F(): any {
    return this._F;
  }

  set F(value: any) {
    this._F = value;
  }

  setSubsets() {
    // this.F.setSubsets([])
  }

  loadData () {
    this.F.loadData([
      {
        dataType: 'categorical',
        field: 'gender'
      },
      {
        dataType: 'categorical',
        field: 'race'
      },
      {
        dataType: 'categorical',
        field: 'tumor_stage'
      },

      {
        dataType: 'categorical',
        field: 'miR1269a_expression'
      },
      {
        dataType: 'numerical',
        field: 'year_of_birth'
      },
      {
        dataType: 'numerical',
        field: 'days_to_death'
      },
      {
        dataType: 'numerical_array',
        field: 'miRNA'
      }
    ])

  }

  clearData() {
    this.F.clearCache()
  }
}
