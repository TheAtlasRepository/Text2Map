import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "../ui/icons";
import { Textarea } from "@/components/ui/textarea";
import React, { useState } from "react";
import { MapMarker } from "../types/MapMarker";

type MarkerEditorType = {
  onClose: () => void,
  onTitleChange: (newTitle: string) => void,
  marker: MapMarker | null,
}

export const MarkerEditor = (props: MarkerEditorType) => {

  const [inputTitle, setInputTitle] = useState(props.marker?.display_name ?? "");

  const handleUpdate = () => {
    props.onTitleChange(inputTitle);
    props.onClose();
  }

  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 space-y-4 relative">
        <button className="absolute top-4 right-4">
          <CloseIcon className="h-6 w-6" onClick={props.onClose} />
        </button>
        <h2 className="text-xl font-semibold">Edit location</h2>
        <div className="flex flex-col space-y-3">
          <div className="flex items-center space-x-3">
            <Input placeholder="Location name / Address / Lat. - Long." value={inputTitle} onChange={(e) => setInputTitle(e.target.value)} />
          </div>
          <Textarea placeholder="Add details and information about this location..." />
        </div>
        <div className="flex gap-5">
          <Button
            className="w-1/2"
            variant={"secondary"}
            onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            className="w-1/2"
            variant={"blue"}
            onClick={handleUpdate}>
            Update
          </Button>
        </div>
      </div>
    </div>
  )
}
