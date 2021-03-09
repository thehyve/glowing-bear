/**
 * Copyright 2021 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import { SurvivalAnalysisClear } from './survival-analysis-clear';
import { SurvivalSettings } from './survival-settings';
import {NumericalTablesType} from '../../utilities/survival-analysis/numerical-tables';

export class SurvivalResults {
  survivalAnalysisClear: SurvivalAnalysisClear
  settings: SurvivalSettings
  numericalTables: NumericalTablesType
}
