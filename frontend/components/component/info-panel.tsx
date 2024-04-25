import { useState, useEffect } from "react";
import { CloseIcon, EyeSlashIcon } from "../ui/icons";
import { MapMarker } from "../types/MapMarker";
import { Button } from "../ui/button";

const InfoPanel = (props: {
  marker: MapMarker;
  onClosed: () => void;
  onHideMarker: (id: number) => void; // Add this line
  onEditMarker: () => void;
  onMarkerTitleChange: (newTitle: string) => void;
}) => {

  return (
    <div className="block min-w-[180px] bg-white rounded-lg shadow dark:bg-gray-800 dark:text-white">
      {
        props.marker.img_url == "" ? (
          <div style={{ width: "240px", height: "125px" }}>
            <p className="rounded-t-lg flex items-center justify-center h-full font-semibold bg-gray-200 dark:bg-slate-900">
              No image found sadly.
            </p>
          </div>
        ) : (
          <img className="rounded-t-lg" style={{ width: "240px", height: "125px" }} src={props.marker.img_url} />
        )
      }
      <div className="p-5 flex-col items-center ">
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{props.marker.display_name}</h5>
        </a>
        <Button
          variant={"secondary"}
          onClick={props.onEditMarker}>

          Edit Marker
        </Button>
      </div>
      <div className="absolute top-0 left-0 mt-2 ml-2">
        <button
          className="bg-gray-100 hover:bg-white/90 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none"
          title="Hide marker"
          onClick={() => props.onHideMarker(props.marker.numId)}>
          <EyeSlashIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="absolute top-0 right-0 mt-2 mr-2">
        <button
          className="bg-gray-100 hover:bg-white/90 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none"
          title="Close popup"
          onClick={props.onClosed}>
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export default InfoPanel;
