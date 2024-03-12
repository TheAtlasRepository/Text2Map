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

    const handleExportClick = () => {
        if (props.geoJsonPath) {
            // Convert the GeoJSON object to a string
            const geoJsonString = JSON.stringify(props.geoJsonPath, null, 2);
    
            // Create a Blob from the string
            const blob = new Blob([geoJsonString], { type: 'application/geo+json' });
    
            // Create a URL for the Blob
            const url = URL.createObjectURL(blob);
    
            // Create a temporary anchor element
            const link = document.createElement('a');
            link.href = url;
            link.download = `${mapName}.geojson`; // You can customize the filename here
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
    
            // Release the URL for the Blob
            URL.revokeObjectURL(url);
        }
    };
    //console.log(props);

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
                        <Button variant="ghost" onClick={handleExportClick}>Export map</Button>
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
