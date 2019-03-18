/**
 * Copyright 2019 The Hyve B.V.
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class TransmartPackerJobParameters {

  // transmart API constraint
  public constraint: object;
  // optional name of the export job and the output tsv file
  public custom_name?: string;
  // optional transmart API constraint that will be used to filter result rows
  public row_filter?: object;

}
