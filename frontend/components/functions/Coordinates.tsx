
import React from 'react';

type CoordinateProps = {
  latitude: number;
  longitude: number;
  type: string;
  isSelected: boolean;
  onClick: () => void;
};

const Coordinate: React.FC<CoordinateProps> = ({
  latitude,
  longitude,
  type,
  isSelected,
  onClick,
}) => {
  return (
    <div
      className={`custom-marker ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <span>{type}</span>
    </div>
  );
};

export default Coordinate;
