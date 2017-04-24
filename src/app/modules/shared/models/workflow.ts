export class Workflow {

  constructor() {
    this.configureDataSelectionDefaults();
  }

  configureDataSelectionDefaults() {
    let patientSelectionConfig = {};
    patientSelectionConfig['patients'] = [];

    let dataSelectionConfig = {};
    dataSelectionConfig['active-accordion-ids'] = ['patient-selection-panel'];
    dataSelectionConfig['patient-selection'] = patientSelectionConfig;

    this['data-selection'] = dataSelectionConfig;
  }

  updateDataSelectionAccordion(toggledId, toggledState) {
    if(toggledState) {
      this['data-selection']['active-accordion-ids'].push(toggledId);
    }
    else {
      this['data-selection']['active-accordion-ids'].splice(toggledId, 1);
    }
  }

}
