import {FractalisChartDescription} from './fractalis-chart-description';
import {ChartType} from '../chart-models/chart-type';

export class FractalisChart {

  type: ChartType;

  /**
   * Chart instance retrieved when setting a fractalis chart
   * To be passed to fractalis chart related functions
   */
  chartObject: any;

  /**
   * Specification of expected parameters.
   */
  description: FractalisChartDescription;

}
