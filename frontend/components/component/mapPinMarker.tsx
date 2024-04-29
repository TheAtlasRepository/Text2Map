import React from 'react';
import { MapMarker } from '../types/MapMarker';

type CoordinateProps = {
  marker: MapMarker;
  onClick: (marker: MapMarker) => void;
};

/**
 * Pin that displays marker-names on map
 * @param marker The marker object to represent
 * @param onClick Event activated when the pin is clicked. Returns the marker object 
 * @returns JSX element for the pin
 */
const MapPinMarker: React.FC<CoordinateProps> = ({
  marker,
  onClick,
}) => {
  return (
    <div
      className={"custom-marker"}
      onClick={() => onClick(marker)}
    >
      <span>{marker.displayName}</span>
    </div>
  );
};

export default MapPinMarker;
