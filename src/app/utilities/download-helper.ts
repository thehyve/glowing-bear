export class DownloadHelper {

  public static downloadJSON(dataObject: object, fileName: string) {
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
