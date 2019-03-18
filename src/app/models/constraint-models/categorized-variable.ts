/**
 * Copyright 2017 - 2018  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */
import {Concept} from './concept';
import {ConceptType} from './concept-type';

export interface CategorizedVariable {
  type: ConceptType;
  elements: Concept[];
}
