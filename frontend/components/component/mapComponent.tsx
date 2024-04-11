import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, Popup, Source, Layer } from 'react-map-gl';
import type { FillLayer, MapRef } from 'react-map-gl';
import Coordinate from '../functions/Coordinates';
import 'mapbox-gl/dist/mapbox-gl.css';
import InfoPanel from '../component/info-panel';
import { EditMarker } from '../component/edit-marker';
import { MapMarker } from '../types/MapMarker';

/**
 * Input props for the map component
 */
type MapComponentProps = {
  markers: MapMarker[];
  // selectedMarkerId: number | null;
  // setSelectedMarkerId: React.Dispatch<React.SetStateAction<number | null>>;
  geojsonData?: any;
};


/**
 * Map Component for displaying map with added formatting
 * 
 * @param markers 
 * @param geojsonData 
 * @returns 
 */
const MapComponent: React.FC<MapComponentProps> = (
  props: MapComponentProps
) => {
  const mapRef = useRef<MapRef>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gotGeoJson, setGotGeoJsonState] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [isEditMarkerOverlayVisible, setIsEditMarkerOverlayVisible] = useState(false);
  const initialFlyto = useRef(true);

  const handleOnLoad = () => {
    setIsLoaded(true);
  };

  // Logic for when a marker is selected
  const handleMarkerSelect = (id: number, lat: number, lon: number) => {
    setSelectedMarkerId(id)

    if (mapRef.current) {
      // console.log('lat and lon: ', lat, lon);
      mapRef.current.flyTo({ center: [lon, lat], speed: 0.5 });
    }
  }

  const handleMarkerTitleChange = (newTitle: string) => {
    // Update the marker title and type in the MapComponent's state
    setMarkers(markers.map(marker => {
      if (marker.numId === selectedMarkerId) {
        return { ...marker, type: newTitle, title: newTitle }; // Assuming you want to update both title and type
      }
      return marker;
    }));
  };

  const toggleEditMarkerOverlay = () => {
    setIsEditMarkerOverlayVisible(!isEditMarkerOverlayVisible);
  }

  const handleDeleteMarker = (id: number) => {
    // Assuming markers is a state variable
    setMarkers(markers.filter(marker => marker.numId !== id));
    setSelectedMarkerId(null); // Optionally, clear the selected marker by id
  };

  // This is necessary to update the display of markers once they are retrieved 
  useEffect(() => {
    setMarkers(props.markers);
  }, [props.markers]);

  useEffect(() => {
    if (props.geojsonData != undefined && !gotGeoJson) {
      setGotGeoJsonState(true);
    }
  }, [props.geojsonData])

  // Run once when markers changes, then fly to coordinates.
  useEffect(() => {
    // If initialFlyTo is false, do nothing
    if (!initialFlyto.current) { return; }

    if (mapRef.current && markers.length != 0) {
      // Set state to false so it wont repeat
      initialFlyto.current = false;

      let firstPoint: [number, number] = [markers[0].longitude, markers[0].latitude];
      console.log('Flying to: ', firstPoint);
      mapRef.current.flyTo({ center: firstPoint, zoom: 4 });
    }
  }, [markers])

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
            <Source id="selectedCountries" type="geojson" data={props.geojsonData}>
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
          {markers.map(marker => (
            <>
              {marker.toggled &&
                <Marker
                  key={marker.numId}
                  latitude={marker.latitude}
                  longitude={marker.longitude}
                  offset={[0, -25] as [number, number]}
                >
                  <Coordinate
                    latitude={marker.latitude}
                    longitude={marker.longitude}
                    type={marker.type}
                    isSelected={selectedMarkerId === marker.numId}
                    onClick={() => handleMarkerSelect(marker.numId, marker.latitude, marker.longitude)}
                  />
                  {selectedMarkerId === marker.numId && (
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
                        onClosed={() => setSelectedMarkerId(null)}
                        onDeleteMarker={() => handleDeleteMarker(marker.numId)}
                        onEditMarker={toggleEditMarkerOverlay}
                        onMarkerTitleChange={handleMarkerTitleChange}
                      />
                    </Popup>
                  )}
                </Marker>
              }</>
          ))}
        </>
      }
      {isEditMarkerOverlayVisible && selectedMarkerId !== null && (
        <div className="editMarkerOverlay">
          <EditMarker
            onClose={toggleEditMarkerOverlay}
            onTitleChange={handleMarkerTitleChange}
            title={markers[selectedMarkerId].type}
          />
        </div>
      )}
    </ReactMapGL>
  );
};

export default MapComponent;
