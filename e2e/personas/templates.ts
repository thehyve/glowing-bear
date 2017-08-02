export class Persona {
  constructor(public personaID: string, properties: { [key: string]: any }) {
    Object.assign(this, properties);
  }
}
