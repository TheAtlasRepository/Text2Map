import React from 'react';
import { MapMarker } from '../types/MapMarker';

type CoordinateProps = {
  marker: MapMarker;
  isSelected: boolean;
  onClick: (marker: MapMarker) => void;
};

const Coordinate: React.FC<CoordinateProps> = ({
  marker,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`custom-marker ${isSelected ? 'selected' : ''}`}
      onClick={() => onClick(marker)}
    >
      <span>{marker.display_name}</span>
    </div>
  );
};

export default Coordinate;
