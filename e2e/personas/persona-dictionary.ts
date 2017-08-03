import { Persona } from './templates';

/*
 * Personas must be added to this dictionary for the director class to find them.
 */
function initPersonaDictionary() {
  let personaDictionary: { [key: string]: Persona } = Object.create(null);

  [
    new Persona('admin', {
      'login': 'admin',
      'password': 'admin'
    }),
    new Persona('public user', {})
  ].forEach((persona) => { // create a map from the list of personas
    persona = preprocess(persona);
    personaDictionary[persona.personaID] = persona;
  });

  return personaDictionary;
}

// add any preprocessing here. this makes sure data is usable.
function preprocess(persona: Persona): Persona {
  // persona["login"] = persona["login"].toLowerCase();
  // persona["email"] = persona["email"].toLowerCase();
  return persona;
}

export = initPersonaDictionary;
