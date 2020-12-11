/**
 * Copyright 2020 CHUV
 *
 * This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/.
 */

export class ApiValueMetadata {
  ValueMetadata: {
    Version: string
    EncryptedType: string
    ChildrenEncryptIDs: string
    NodeEncryptID: string
    CreationDateTime: string
    TestID: string
    TestName: string
    DataType: DataType
    Flagstouse: string
    Oktousevalues: string
    UnitValues: UnitValues
    EnumValues: string
  }
}

enum DataType {
  POS_INTEGER = 'PosInteger',
  INTEGER = 'Integer',
  FLOAT = 'Float',
  POS_FLOAT = 'PosFloat',
  ENUM = 'Enum',
  STRING = 'String'
}

class UnitValues {
  NormalUnits: string
  EqualUnits: string[]
  ConvertingUnits: ConvertingUnit[]
  ExcludingUnits: string[]

}

class ConvertingUnit {
  MultiplyingFactor: string
  Units: string

}
