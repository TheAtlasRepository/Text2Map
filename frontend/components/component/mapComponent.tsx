import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, Popup, Source, Layer } from 'react-map-gl';
import type { MapRef } from 'react-map-gl';
import MapPinMarker from './mapPinMarker';
import 'mapbox-gl/dist/mapbox-gl.css';
import InfoPanel from './infoPanel';
import { MarkerEditor } from './markerEditor';
import { MapMarker } from '../types/MapMarker';
import markerToggle from '../functions/markerToggle';
import updateMarker from '../functions/markerEditUpdater';

/**
 * Input props for the map component
 */
type MapComponentProps = {
  markers: MapMarker[];
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  selectedMarker: MapMarker | null;
  setSelectedMarker: React.Dispatch<React.SetStateAction<MapMarker | null>>;
  geojsonData?: any; // Setting this to our own geoJsonData type breaks some things, so keep type any
};


/**
 * Map Component for displaying map with added formatting
 * 
 * @param markers Array of markers to display
 * @param setMarkers Displatch for setting and updating the array of markers
 * @param selectedMarker A marker that has been selected, or null for when none is selected
 * @param setSelectedMarker Dispatch for setting and updating the selected marker
 * @param geojsonData GeoJson data for display
 * @returns JSX element for the map
 */
const MapComponent: React.FC<MapComponentProps> = (
  props: MapComponentProps
) => {
  const mapRef = useRef<MapRef>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [gotGeoJson, setGotGeoJsonState] = useState(false);
  const [isEditMarkerOverlayVisible, setIsEditMarkerOverlayVisible] = useState(false);
  const initialFlytoRef = useRef(true);

  const handleOnLoad = () => {
    setIsLoaded(true);
  };

  // Logic for when a marker is selected
  const handleMarkerSelect = (marker: MapMarker) => {
    props.setSelectedMarker(marker);
  }

  const handleMarkerEditSave = (newMarker: MapMarker) => {
    // Update the marker
    props.setMarkers(updateMarker(newMarker, props.markers));
  };

  const toggleEditMarkerOverlay = () => {
    setIsEditMarkerOverlayVisible(!isEditMarkerOverlayVisible);
  }


  const handleHideMarker = (id: number) => {
    const markers = props.markers;
    props.setMarkers(markerToggle(id, markers));
    props.setSelectedMarker(null); // Optionally, clear the selected marker by id
  }

  useEffect(() => {
    if (props.geojsonData != undefined && !gotGeoJson) {
      setGotGeoJsonState(true);
    }
  }, [props.geojsonData])

  // Run once when markers changes, then fly to coordinates.
  useEffect(() => {
    // If initialFlyTo is false, do nothing
    if (!initialFlytoRef.current) { return; }

    if (mapRef.current && props.markers.length != 0) {
      // Set state to false so it wont repeat
      initialFlytoRef.current = false;

      let firstPoint: [number, number] = [props.markers[0].longitude, props.markers[0].latitude];
      console.log('Flying to: ', firstPoint);
      mapRef.current.flyTo({ center: firstPoint, zoom: 4 });
    }
  }, [props.markers])


  // Flyto location!
  useEffect(() => {
    if (props.selectedMarker === null) { return; }

    if (mapRef.current) {
      // console.log('lat and lon: ', lat, lon);
      mapRef.current.flyTo({ center: [props.selectedMarker.longitude, props.selectedMarker.latitude], speed: 0.6 });
    }
  }, [props.selectedMarker])

  return (
    <ReactMapGL
      mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
      mapStyle="mapbox://styles/mapbox/standard"
      maxZoom={20}
      minZoom={2}
      ref={mapRef}
      onLoad={handleOnLoad}
    >

      {/* Render GeoJSON */}
      {gotGeoJson && isLoaded &&
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
      {isLoaded && props.markers.map(marker => {
        if (marker.isToggled) {
          return (
            <Marker
              key={"Marker" + marker.numId}
              latitude={marker.latitude}
              longitude={marker.longitude}
              offset={[0, -25] as [number, number]}
            >
              <MapPinMarker
                marker={marker}
                onClick={handleMarkerSelect}
              />
              {props.selectedMarker?.numId === marker.numId && (
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
                    marker={marker}
                    onClosed={() => props.setSelectedMarker(null)}
                    onHideMarker={handleHideMarker}
                    onEditMarker={toggleEditMarkerOverlay}
                  />
                </Popup>
              )}
            </Marker>
          )
        }
      })}

      {isEditMarkerOverlayVisible && props.selectedMarker !== null && (
        <div className="editMarkerOverlay">
          <MarkerEditor
            onClose={toggleEditMarkerOverlay}
            onEditSave={handleMarkerEditSave}
            marker={props.markers.find(mark => mark.numId == props.selectedMarker?.numId) ?? null}
          />
        </div>
      )}
    </ReactMapGL>
  );
};

export default MapComponent;
