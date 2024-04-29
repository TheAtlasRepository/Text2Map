import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChatBubbleIcon, CloseIcon, InternetGlobeIcon, PhotoIcon, TextBarsIcon } from "../ui/icons";
import { Textarea } from "@/components/ui/textarea";
import React, { useRef, useState } from "react";
import { MapMarker } from "../types/MapMarker";
import autosizeTextArea from "../functions/AutosizeTextArea";

type MarkerEditorType = {
  onClose: () => void,
  onEditSave: (newMarker: MapMarker) => void,
  marker: MapMarker | null,
}

/**
 * Editor-window for editing the information of a marker
 * 
 * @param marker The marker to edit
 * @param onClose Event activated when editor is closed
 * @param onEditSave Event activated when the marker is saved. Returns a new marker object
 * @returns JSX element of the editor
 */
export const MarkerEditor = (props: MarkerEditorType) => {
  const [markerTitle, setMarkerTitle] = useState<string>(props.marker?.displayName ?? "");
  const [markerImageURL, setMarkerImageURL] = useState<string>(props.marker?.imgUrl ?? "");
  const [markerInfoLink, setMarkerInfoLink] = useState<string>(props.marker?.infoUrl ?? "");
  const [markerDescription, setMarkerDescription] = useState<string>(props.marker?.discription ?? "");
  const pinDescriptionRef = useRef<HTMLTextAreaElement>(null);

  autosizeTextArea(pinDescriptionRef.current, markerDescription);

  const handleUpdate = () => {
    if (props.marker == null) return;

    const newMarker: MapMarker = {
      displayName: markerTitle,
      latitude: props.marker.latitude,
      longitude: props.marker.longitude,
      numId: props.marker.numId,
      imgUrl: markerImageURL,
      isToggled: props.marker.isToggled,
      infoUrl: markerInfoLink,
      discription: markerDescription,
    };
    props.onEditSave(newMarker);
    props.onClose();
  }

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarkerTitle(e.target.value);
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarkerImageURL(e.target.value);
  }

  const handleInfoLinkChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMarkerInfoLink(e.target.value);
  }

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMarkerDescription(e.target.value);
  }


  return (
    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 relative">
        <button className="absolute top-4 right-4">
          <CloseIcon className="h-6 w-6" onClick={props.onClose} />
        </button>
        <h2 className="text-xl font-semibold">Edit location pin</h2>
        <div className="flex flex-col gap-5 pt-5 pb-10">
          <div className="">
            <label htmlFor="TitleInput" className="text-sm flex items-center">
              <ChatBubbleIcon className="h-6 w-6 mr-2" /> Pin label
            </label>
            <Input
              id="TitleInput"
              className="mt-1 border-underline-grey"
              placeholder="Location name / Address / Lat. - Long."
              value={markerTitle}
              onChange={handleTitleChange}
            />
          </div>
          <div className="">
            <label htmlFor="ImageURLInput" className="text-sm flex items-center">
              <PhotoIcon className="h-6 w-6 mr-2" /> Pin image URL
            </label>
            <Input
              id="ImageURLInput"
              className="mt-1 border-underline-grey"
              placeholder="https://example.com/image.jpg"
              value={markerImageURL}
              onChange={handleImageChange}
            />
          </div>
          <div>
            <label htmlFor="DocumentationInput" className="text-sm flex items-center">
              <InternetGlobeIcon className="h-6 w-6 mr-2" /> Pin link
            </label>
            <Input
              id="ImageURLInput"
              className="mt-1 border-underline-grey"
              placeholder="https://en.wikipedia.org"
              value={markerInfoLink}
              onChange={handleInfoLinkChange}
            />
          </div>
          <div>
            <label htmlFor="DescriptionInput" className="text-sm flex items-center">
              <TextBarsIcon className="h-6 w-6 mr-2" /> Pin description
            </label>
            <Textarea
              id="DescriptionInput"
              className="mt-1 border-underline-grey"
              placeholder="Add details and information about this location..."
              value={markerDescription}
              onChange={handleDescriptionChange}
              ref={pinDescriptionRef}
            />
          </div>
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
