import React, { useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "./button";
import { ChevronLeftArrowIcon, ExportIcon } from "./icons";
import FormModal from "./FormModal";
import { MapMarker } from "../types/MapMarker";

type toolbarProps = {
  viewAllOptions?: boolean,
  geoJsonPath?: any,
  markers?: any,
  onDiscardClick: () => void,
  onExportClick?: () => void,
  onShareClick?: () => void,
}


/**
 * Navbar component
 * 
 * @param {boolean} viewAllOptions Viewstate for full or lite toolbar
 * @param {function} onDiscardClick Discard button callback function
 * @param {function} onExportClick Discard button callback function
 * @param {function} onShareClick Discard button callback function
 * 
 * @returns Toolbar
 */

const Toolbar = (props: toolbarProps) => {
  const router = useRouter();
  const [mapName, setMapName] = useState(""); // State to hold the map name
  const [dropdownVisible, setDropdownVisible] = useState(false); // State to hold the dropdown visibility
  const [isFormModalOpen, setFormModalOpen] = useState(false);

  //Convert Markers to GeoJSON
  const markersToGeoJsonFeatures = (markers: MapMarker[]) => {
    console.log(markers);
    return markers.map(marker => ({
      type: 'Feature',
      properties: {
        name: marker.display_name // Assuming 'type' is the name you want to use for the marker
      },
      geometry: {
        type: 'Point',
        coordinates: [marker.longitude, marker.latitude] // GeoJSON uses [longitude, latitude]
      }
    }));
  };

  // Add a new function to handle the click event of the Feedback button
  const handleFeedbackClick = () => {
    setFormModalOpen(true);
  };

  // Opens a confirmation window
  const handleDiscard = () => {
    const confirmText = "Do you want to discard current map? Progress will be lost.";
    if (!window.confirm(confirmText)) return;
    console.log("Confirmed!");
    props.onDiscardClick();
  }


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
    <header className="flex items-center justify-between p-2 px-4 border-b dark:border-b-gray-600 dark:text-gray-300">
      {props.viewAllOptions ? (
        <>
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={handleDiscard}>Discard</Button>
            <input
              type="text"
              value={mapName}
              onChange={(e) => setMapName(e.target.value)}
              className="text-xl font-semibold bg-transparent border-none outline-none"
              placeholder="Unsaved map"
            />
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="blue"
              className="flex justify-center text-nowrap"
              onClick={toggleDropdown}>
              <ExportIcon className="mr-2" />
              Export map
            </Button>
            <Button
              variant="green"
              className="flex justify-center text-nowrap"
              onClick={handleFeedbackClick}>
              Feedback
            </Button>
            {/* <Button variant="secondary" disabled>Save map</Button> */}
            <div className="absolute top-14">
              {dropdownVisible && (
                <div className="absolute p-2 w-full gap-2 min-w-max bg-white dark:bg-gray-800 rounded-b-lg z-10 flex flex-col">
                  <Button variant="secondary" onClick={handleExportClick}>Export GeoJSON</Button>
                  <Button variant="secondary" onClick={handleExportClickWMarkers}>Export GeoJSON with markers</Button>
                </div>
              )}
            </div>
            {isFormModalOpen && <FormModal onClose={() => setFormModalOpen(false)} />}
          </div>
        </>
      ) : (
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => router.push("/")}>
            <div className="flex items-center space-x-2">
              <ChevronLeftArrowIcon />Back
            </div>
          </Button>
        </div>
      )}
    </header>
  );
}

export { Toolbar }
