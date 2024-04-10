export interface Coordinate {
  latitude: number;
  longitude: number;
  type: string;
  numId: number;
}

export const extractCoordinates = (filteredEntities: [string, any][]): Coordinate[] => {
  const coordinates: Coordinate[] = [];
  let currentEntity: Coordinate | null = null;
  let x = 0;

  filteredEntities.forEach(([type, value]: [string, any], index: number) => {
    if (type.startsWith('Found entities:')) {
      // If it's a new entity, create a new object to store its information
      currentEntity = { type: value, latitude: 0, longitude: 0, numId: x };
      x++;
      coordinates.push(currentEntity);
    } else if (type === 'Latitude:') {
      // If it's latitude, assign the value to the current entity
      if (currentEntity) currentEntity.latitude = parseFloat(value);
    } else if (type === 'Longitude:') {
      // If it's longitude, assign the value to the current entity
      if (currentEntity) currentEntity.longitude = parseFloat(value);
    }
  });

  return coordinates;
};
