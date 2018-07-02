import * as sanitize from 'sanitize-filename';

export class DownloadHelper {

  public static downloadJSON(dataObject: object, fileName: string) {
    if (dataObject === null) {
      throw new Error('No data to download.');
    }
    if (fileName === null) {
      throw new Error('Missing file name.');
    }
    fileName = sanitize(fileName.trim());
    if (fileName.length === 0) {
      throw new Error('Empty file name.');
    }
    let data = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataObject));
    let el = document.createElement('a');
    el.setAttribute('href', data);
    el.setAttribute('download', fileName + '.json');
    el.style.display = 'none';
    document.body.appendChild(el);
    el.click();
    document.body.removeChild(el);
  }

}
