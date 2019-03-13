/**
 * Copyright 2019  The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

import {TreeNode} from 'primeng/api';
import {ExtendedConstraint} from '../transmart-models/transmart-constraint';
import {VisualAttribute} from './visual-attribute';

export interface GbTreeNode extends TreeNode {
  name?: string;
  fullName?: string;
  conceptCode?: string;
  studyId?: string;
  constraint?: ExtendedConstraint;
  subjectCount?: string;
  metadata?: any;
  visualAttributes?: VisualAttribute[];
}
