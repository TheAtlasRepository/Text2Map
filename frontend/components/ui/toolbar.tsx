import React, { useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "./button";
import { ChevronArrowIcon } from "./icons";


/**
 * Navbar component
 * 
 * @param {object | any} props Component props
 * @param {boolean} viewAllOptions Viewstate for full or lite toolbar
 * 
 * @param {function} onDiscardClick Discard button callback function
 * @param {function} onExportClick Discard button callback function
 * @param {function} onShareClick Discard button callback function
 * 
 * @returns Toolbar
 */

const Toolbar = (props: any) => {
    const router = useRouter();
    const [mapName, setMapName] = useState('Unsaved map'); // State to hold the map name
    const [dropdownVisible, setDropdownVisible] = useState(false); // State to hold the dropdown visibility

    //Convert Markers to GeoJSON
    const markersToGeoJsonFeatures = (markers: { latitude: number; longitude: number; type: string }[]) => {
        console.log(markers);
        return markers.map(marker => ({
            type: 'Feature',
            properties: {
                name: marker.type // Assuming 'type' is the name you want to use for the marker
            },
            geometry: {
                type: 'Point',
                coordinates: [marker.longitude, marker.latitude] // GeoJSON uses [longitude, latitude]
            }
        }));
    };

    const handleExportClickWMarkers = () => {
        if (props.geoJsonPath && props.markers) {
            console.log('Markers:', props.markers);
            // Convert the markers to GeoJSON features
            const markerFeatures = markersToGeoJsonFeatures(props.markers);
    
            // Add the marker features to the GeoJSON data
            const geoJsonDataWithMarkers = {
                ...props.geoJsonPath,
                features: [...props.geoJsonPath.features, ...markerFeatures]
            };
    
            // Convert the GeoJSON object to a string
            const geoJsonString = JSON.stringify(geoJsonDataWithMarkers, null, 2);
    
            // Create a Blob from the string
            const blob = new Blob([geoJsonString], { type: 'application/geo+json' });
    
            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);
    
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.download = `${mapName}.geojson`; // Use the edited map name
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            // Release the URL for the Blob
            URL.revokeObjectURL(url);
        } else {
            console.error('GeoJSON data or markers are not available.');
        }
    };

    // Handler for the export button click event
    const handleExportClick = () => {
        if (props.geoJsonPath) {
            const geoJsonString = JSON.stringify(props.geoJsonPath, null, 2);
            const blob = new Blob([geoJsonString], { type: 'application/geo+json' });
            const url = URL.createObjectURL(blob);
    
            const link = document.createElement('a');
            link.href = url;
            link.download = `${mapName}.geojson`; // Corrected to use backticks
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            URL.revokeObjectURL(url);
        }
    };
    
    const toggleDropdown = () => {
        setDropdownVisible(!dropdownVisible);
    }

    return (
        <header className="flex items-center justify-between p-2 px-4 border-b">
            {props.viewAllOptions ? (
                <>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => props.onDiscardClick()}>Discard</Button>
                        <input
                            type="text"
                            value={mapName}
                            onChange={(e) => setMapName(e.target.value)}
                            className="text-xl font-semibold bg-transparent border-none outline-none"
                            placeholder="Unsaved map"
                        />
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={toggleDropdown}>Export map</Button>
                        {dropdownVisible && (
                             <div className="absolute right-30 mt-24 bg-white border border-gray-300 rounded-md shadow-md z-10">
                                <Button variant="ghost" onClick={handleExportClick}>Export GeoJSON</Button>
                                <Button variant="ghost" onClick={handleExportClickWMarkers}>Export GeoJSON with markers</Button>
                            </div>
                        )}
                        <Button variant="ghost">Share</Button>
                        <Button variant="ghost">Embed</Button>
                        <Button variant="secondary">Save map</Button>
                    </div>
                </>
            ) : (
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.push("/")}>
                        <div className="flex items-center space-x-2">
                            <ChevronArrowIcon className="inline-flex h-4 w-4" left={true} />Back
                        </div>
                    </Button>
                </div>
            )}
        </header>
    );
}

export { Toolbar }
