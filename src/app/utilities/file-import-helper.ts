import {MessageHelper} from './message-helper';

export class FileImportHelper {

  static importCriteria(elementId: string, reader: FileReader, isUploadListenerNotAdded: boolean) {
    let uploadElm = document.getElementById(elementId);
    if (isUploadListenerNotAdded) {
      uploadElm.addEventListener('change', (event) => this.fileUpload(event, reader), false);
    }
    // reset the input path so that it will take the same file again
    uploadElm['value'] = '';
    uploadElm.click();
  }

  static fileUpload(event, reader: FileReader) {
    MessageHelper.alert('info', 'File is being processed, waiting for response.');
    let file = event.target.files[0];
    reader.readAsText(file);
  }

  static getFile(elementId: string) {
    return (<HTMLInputElement>document.getElementById(elementId)).files[0];
  }

  static isTextFile(file: File): boolean {
    return file.type === 'text/plain' ||
      file.type === 'text/tab-separated-values' ||
      file.type === 'text/csv' ||
      (file.type === '' && file.name.split('.').pop() !== 'json');
  }

  static isJsonFile(file: File): boolean {
    // file.type is empty for some browsers and Windows OS
    return file.type === 'application/json' || file.name.split('.').pop() === 'json';
  }

}
