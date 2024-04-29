import { CoordinateEntity } from "../types/BackendResponse";

/**
 * Converts list of CoordinateEntity into a simple list of the display-names 
 * 
 * @param entities Array of CoordinateEntities
 * @returns Array of display-names
 */
export const entiyNameListExtractor = (entities: CoordinateEntity[]) => {
  let displayNames: string[] = [];

  entities.forEach(ent => {
    displayNames.push(ent.display_name);
  })

  return displayNames;
}