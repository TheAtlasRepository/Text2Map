import React, { useEffect, useRef, useState } from 'react';
import ReactMapGL, { Marker, Popup, Source, Layer } from 'react-map-gl';
import type { FillLayer } from 'react-map-gl';
import Coordinate from '../functions/Coordinates';
import 'mapbox-gl/dist/mapbox-gl.css';
import InfoPanel from '../component/info-panel';

/**
 * Input props for the map component
 */
type MapComponentProps = {
    markers: { latitude: number; longitude: number; type: string }[];
    centerCoordinates: [number, number] | null;
    initialViewState: any;
    mapRef: React.MutableRefObject<null>;
    selectedMarkerIndex: number | null;
    setSelectedMarkerIndex: React.Dispatch<React.SetStateAction<number | null>>;
    geojsonData: any;
};


/**
 * Map Component for displaying map with added formatting
 * 
 * @param markers 
 * @param centerCoordinates 
 * @param initialViewState 
 * @param mapRef 
 * @param selectedMarkerIndex 
 * @param setSelectedMarkerIndex 
 * @param geojsonData 
 * @returns 
 */
const MapComponent: React.FC<MapComponentProps> = ({
    markers,
    centerCoordinates,
    initialViewState,
    mapRef,
    selectedMarkerIndex,
    setSelectedMarkerIndex,
    geojsonData,
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const handleOnLoad = () => {
        setIsLoaded(true);
        console.log('GeoJson: ', geojsonData);


        console.log('Map loading-state: ', isLoaded);
    };

    return (
        <ReactMapGL
            mapboxAccessToken={process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}
            mapStyle="mapbox://styles/mapbox/standard"
            initialViewState={initialViewState}
            maxZoom={20}
            minZoom={2}
            ref={mapRef}
            onLoad={handleOnLoad}
        >


            {isLoaded &&
                <>
                    {/* Render GeoJSON */}
                    <Source id="selectedCountries" type="geojson" data={geojsonData}>
                        <Layer
                            id="selectedCountries"
                            type="fill"
                            paint={{
                                'fill-color': '#088',
                                'fill-opacity': 0.4,
                            }}
                        />
                    </Source>

                    {/* Render markers */}
                    {markers.map((marker, index) => (
                        <Marker
                            key={index}
                            latitude={marker.latitude}
                            longitude={marker.longitude}
                        >
                            <Coordinate
                                latitude={marker.latitude}
                                longitude={marker.longitude}
                                type={marker.type}
                                isSelected={selectedMarkerIndex === index}
                                onClick={() => setSelectedMarkerIndex(index)}
                            />
                            {selectedMarkerIndex === index && (
                                <Popup
                                    latitude={marker.latitude}
                                    longitude={marker.longitude}
                                    closeButton={false}
                                    closeOnClick={false}
                                    className="custom-popup"
                                    anchor="bottom"
                                    offset={[0, -30] as [number, number]}
                                >
                                    <InfoPanel title={marker.type} onClosed={() => setSelectedMarkerIndex(null)} />
                                </Popup>
                            )}
                        </Marker>
                    ))}
                </>
            }
        </ReactMapGL>
    );
};

export default MapComponent;
