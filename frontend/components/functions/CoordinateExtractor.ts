export interface Coordinate {
  latitude: number;
  longitude: number;
  type: string;
}

export const extractCoordinates = (filteredEntities: [string, any][]): Coordinate[] => {
  const coordinates: Coordinate[] = [];
  let currentEntity: Coordinate | null = null;

  filteredEntities.forEach(([type, value]: [string, any]) => {
    if (type.startsWith('Found entities:')) {
      // If it's a new entity, create a new object to store its information
      currentEntity = { type: value, latitude: 0, longitude: 0 };
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
