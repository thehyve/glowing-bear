/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {FractalisChartVariable} from './fractalis-chart-variable';

export class FractalisChartDescription {
  catVars?: FractalisChartVariable;
  numVars?: FractalisChartVariable;
  durationVars?: FractalisChartVariable;
  observedVars?: FractalisChartVariable;
  groupVars?: FractalisChartVariable;
}
