import Map, { NavigationControl, GeolocateControl } from "react-map-gl";
import 'mapbox-gl/dist/mapbox-gl.css';
import { Button } from "@/components/ui/button";

export default function AskingView() {

    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN;

    return (
      <div className="bg-white h-screen overflow-y-auto">
        <header className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-semibold">Unsaved map</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost">Export map</Button>
            <Button variant="ghost">Share</Button>
            <Button variant="ghost">Embed</Button>
            <Button variant="secondary">Save map</Button>
          </div>
        </header>
        <div className="flex h-5/6">
          <aside className="w-2/5 p-4 space-y-4 border-r">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Din mor</h2>
              <ArrowLeftIcon className="h-6 w-6" />
            </div>
            <Button className="flex items-center justify-center space-x-2" variant="secondary">
              <FileEditIcon className="h-5 w-5" />
              <span>Edit & add text</span>
            </Button>
          </aside>
          <main className="flex-auto relative w-3/5">
            <Map
              mapboxAccessToken={mapboxToken}
              mapStyle="mapbox://styles/mapbox/standard"
              initialViewState={{ latitude: 35.668641, longitude: 139.750567, zoom: 10 }}
              maxZoom={20}
              minZoom={3}
            >
              <GeolocateControl position="bottom-right" />
              <NavigationControl position="bottom-right" />
            </Map>
          </main>
        </div>
        <footer>
          <div className="flex items-center justify-center w-full">
          </div>
        </footer>
      </div>
    )
  }
  
  function ArrowLeftIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
      </svg>
    )
  }
  
  
  function FileEditIcon(props: any) {
    return (
      <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 13.5V4a2 2 0 0 1 2-2h8.5L20 7.5V20a2 2 0 0 1-2 2h-5.5" />
        <polyline points="14 2 14 8 20 8" />
        <path d="M10.42 12.61a2.1 2.1 0 1 1 2.97 2.97L7.95 21 4 22l.99-3.95 5.43-5.44Z" />
      </svg>
    )
  }