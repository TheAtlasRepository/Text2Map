import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, Popup, Source, Layer } from 'react-map-gl';
import type { FillLayer, MapRef } from 'react-map-gl';
import Coordinate from '../functions/Coordinates';
import 'mapbox-gl/dist/mapbox-gl.css';
import InfoPanel from '../component/info-panel';
import { EditMarker } from '../component/edit-marker';

/**
 * Input props for the map component
 */
type MapComponentProps = {
  markers: { latitude: number; longitude: number; type: string }[];
  centerCoordinates: [number, number] | null;
  selectedMarkerIndex: number | null;
  setSelectedMarkerIndex: React.Dispatch<React.SetStateAction<number | null>>;
  geojsonData?: any;
};


/**
 * Map Component for displaying map with added formatting
 * 
 * @param markers 
 * @param centerCoordinates 
 * @param selectedMarkerIndex 
 * @param setSelectedMarkerIndex 
 * @param geojsonData 
 * @returns 
 */
const MapComponent: React.FC<MapComponentProps> = ({
  markers: markersProp,
  centerCoordinates,
  selectedMarkerIndex,
  setSelectedMarkerIndex,
  geojsonData,
}) => {
  const mapRef = useRef<MapRef>(null);
  const [markers, setMarkers] = useState(markersProp);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gotGeoJson, setGotGeoJsonState] = useState(false);
  const [isEditMarkerOverlayVisible, setIsEditMarkerOverlayVisible] = useState(false);

  const handleOnLoad = () => {
    setIsLoaded(true);
  };

  // Logic for when a marker is selected
  const handleMarkerSelect = (index: number, lat: number, lon: number) => {
    setSelectedMarkerIndex(index)

    if (mapRef.current) {
      // console.log('lat and lon: ', lat, lon);
      mapRef.current.flyTo({ center: [lon, lat], speed: 0.5 });
    }
  }

  const handleMarkerTitleChange = (newTitle: string) => {
    // Update the marker title and type in the MapComponent's state
    setMarkers(markers.map((marker, index) => {
      if (index === selectedMarkerIndex) {
        return { ...marker, type: newTitle, title: newTitle }; // Assuming you want to update both title and type
      }
      return marker;
    }));
  };

  const toggleEditMarkerOverlay = () => {
    setIsEditMarkerOverlayVisible(!isEditMarkerOverlayVisible);
  }

  const handleDeleteMarker = (index: number) => {
    // Assuming markers is a state variable
    setMarkers(markers.filter((_, i) => i !== index));
    setSelectedMarkerIndex(null); // Optionally, clear the selected marker index
  };

  useEffect(() => {
    setMarkers(markersProp);
  }, [markersProp]);

  useEffect(() => {
    if (geojsonData != undefined && !gotGeoJson) {
      setGotGeoJsonState(true);
    }
  })

  // Run once when centerCoorcinates changes, then fly to coordinates.
  useEffect(() => {
    if (mapRef.current && centerCoordinates != null) {
      console.log('Flying to: ', centerCoordinates);
      mapRef.current.flyTo({ center: centerCoordinates, zoom: 4 });
    }
  }, [centerCoordinates])

  return (
    <ReactMapGL
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      mapStyle="mapbox://styles/mapbox/standard"
      maxZoom={20}
      minZoom={2}
      ref={mapRef}
      onLoad={handleOnLoad}
    >
      {isLoaded &&
        <>
          {/* Render GeoJSON */}
          {gotGeoJson &&
          <Source id="selectedCountries" type="geojson" data={geojsonData}>
              {/* Layer for Countries */}
              <Layer
                id="countries-layer"
                type="fill"
                filter={["==", ["get", "name"], "Country"]}
                paint={{
                  "fill-color": '#0F58FF', // Blue color for countries
                  "fill-opacity": 0.5,
                  "fill-outline-color": "#000000",
                }}
              />
              {/* Layer for States */}
              <Layer
                id="states-layer"
                type="fill"
                filter={["==", ["get", "name"], "State"]}
                paint={{
                  "fill-color": '#FFA500', // Orange color for states
                  "fill-opacity": 0.5,
                  "fill-outline-color": "#000000",
                }}
              />
              {/* Layer for Cities */}
              <Layer
                id="cities-layer"
                type="fill"
                filter={["==", ["get", "name"], "City"]}
                paint={{
                  "fill-color": '#008000', // Green color for cities
                  "fill-opacity": 0.5,
                  "fill-outline-color": "#000000",
                }}
              />
          </Source>
          }

          {/* Render markers */}
          {markers.map((marker, index) => (
            <Marker
              key={index}
              latitude={marker.latitude}
              longitude={marker.longitude}
              offset={[0, -25] as [number, number]}
            >
              <Coordinate
                latitude={marker.latitude}
                longitude={marker.longitude}
                type={marker.type}
                isSelected={selectedMarkerIndex === index}
                onClick={() => handleMarkerSelect(index, marker.latitude, marker.longitude)}
              />
              {selectedMarkerIndex === index && (
                <Popup
                  latitude={marker.latitude}
                  longitude={marker.longitude}
                  closeButton={false}
                  closeOnClick={false}
                  className="custom-popup"
                  anchor="bottom"
                  offset={[0, -60] as [number, number]}
                >
                  <InfoPanel
                    title={marker.type}
                    type={marker.type}
                    onClosed={() => setSelectedMarkerIndex(null)}
                    onDeleteMarker={() => handleDeleteMarker(index)}
                    onEditMarker={toggleEditMarkerOverlay}
                    onMarkerTitleChange={handleMarkerTitleChange}
                  />
                </Popup>
              )}
            </Marker>
          ))}
        </>
      }
      {isEditMarkerOverlayVisible && selectedMarkerIndex !== null && (
        <div className="editMarkerOverlay">
          <EditMarker
            onClose={toggleEditMarkerOverlay}
            onTitleChange={handleMarkerTitleChange}
            title={markers[selectedMarkerIndex].type}
          />
        </div>
      )}
    </ReactMapGL>
  );
};

export default MapComponent;
