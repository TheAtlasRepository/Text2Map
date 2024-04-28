import React, { useEffect, useRef, useState } from 'react';
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JsonRenderer from "../functions/JsonRenderer";
import { Bbl } from '../ui/bbl';
import { PencilIcon, ChevronDownArrowIcon, ChevronUpArrowIcon } from '../ui/icons';
import { Textarea } from '../ui/textarea';
import autosizeTextArea from '../functions/AutosizeTextArea';
import { MapMarker } from '../types/MapMarker';
import MarkerList from './markerList';
import markerToggle from '../functions/markerToggle';
import { CoordinateEntity } from '../types/BackendResponse';

// Type for defining input params for the 
type InputDisplayProps = {
  displayState: number,
  loading: boolean,
  input: any,
  jsonData?: any,
  markers: MapMarker[];
  markerHistory?: CoordinateEntity[][];
  setMarkers: React.Dispatch<React.SetStateAction<MapMarker[]>>,
  onSelectClick: (marker: MapMarker) => void,
  onSaveEditText: (text: string) => void,
  onSendRequest?: (text: string) => void
}

/**
 * The display to the left of the page. Holds assistant response, buttons for editing text, and list of markers being displayed.
 * @param displayState Display for Chat = 1, text = 2 or CSV = [not implemented]
 * @param loading Loading state value
 * @param input Input text
 * @param JsonData Input jsonData
 * @param markers List of markers to display related info
 * @param {function} onSaveEditText Save event for when text is saved
 * @returns 
 */
const InputDisplay = (props: InputDisplayProps) => {
  const [markerListDisplayState, setMarkerListDisplayState] = useState(false);
  const [editText, setEditText] = useState(props.input);
  const [editTextState, setEditTextState] = useState(false);
  const [newText, setNewText] = useState('');
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  //AutosizeTextArea
  autosizeTextArea(editInputRef.current, editText);

  // Handlers for updating inputs
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => { setEditText(e.target.value) }
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { setNewText(e.target.value) }

  // Handle the case where the user clicks the "Edit text" button
  const handleEditClick = () => {
    setEditTextState(true);
  };

  // Handle the case when edit is canceled
  const handleCancelEdit = () => {
    setEditText(props.input);
    setEditTextState(false);
  }

  // Handle the save event and pass value up to parent
  const handleSaveEdit = () => {
    if (editText.trim() == props.input) {
      console.log("New text was same as old one. No need to repeat request.");
      return;
    }

    props.onSaveEditText(editText.trim());
    setEditTextState(false);
  };

  const handleAddToChat = () => {
    // Send inputNewText only if the displaystate is ment to display the field
    if (props.displayState === 1 && props.onSendRequest) {
      props.onSendRequest(newText);
      setNewText("");
    }
  }

  const handleToggleMarker = (id: number) => {
    const markers = props.markers;
    props.setMarkers(markerToggle(id, markers))
  }


  return (
    <aside className="w-1/3 min-w-min max-w-[500px] flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="p-2 px-3 gap-2 z-30 flex justify-between border-b dark:border-b-gray-600 dark:bg-slate-900 shadow-md dark:shadow-slate-900">
        <button
          className={`p-2 inline-flex overflow-hidden text-nowrap border rounded-lg border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 
            ${markerListDisplayState ? "bg-gray-200 dark:bg-gray-800" : ""}`}
          onClick={() => setMarkerListDisplayState(!markerListDisplayState)}
        >
          <span className="mr-2">
            {props.markers.length} Locations
          </span>
          {!markerListDisplayState ? <ChevronDownArrowIcon /> : <ChevronUpArrowIcon />}
        </button>
        <Button
          onClick={handleEditClick}
          variant="fancy_blue"
          className="flex justify-center text-nowrap"
          disabled={editTextState}
        >
          <PencilIcon className="mr-2" />Edit text
        </Button>
      </div>
      {props.loading ? (
        <Bbl />
      ) : (
        <div className="dark:text-white overflow-y-auto h-full">
          {(props.displayState === 1 || props.displayState === 2) &&
            // This setup makes Textarea invisible and read-only when not in use, and displays it when editing is enabled
            // For autosizing to work, Textarea can not be unloaded, as the size updates upon next statechange, resulting in a squished textarea on first load
            // By making Textarea invisible, positioned relative, and with 0 height, it maintains the same dimentiones when hidden. This ensures that Textarea displays correctly when editing is enabled
            <>
              <div className={editTextState
                ? "sticky top-0 py-3 px-3 z-20 bg-white dark:bg-gray-800 border-b dark:border-b-gray-600"
                : "relative h-0 px-3 opacity-0 pointer-events-none"
              }>
                <Textarea
                  name="EditText"
                  value={editText}
                  onChange={handleTextareaChange}
                  ref={editInputRef}
                  readOnly={!editTextState}
                />

                {editTextState &&
                  <div className="flex pt-2 space-x-2">
                    <Button onClick={handleCancelEdit} variant="secondary">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} variant="blue" disabled={editText.trim() === ""}>
                      Save & resend
                    </Button>
                  </div>
                }
              </div>

              {markerListDisplayState &&
                <div className="relative top-0 z-10">
                  <MarkerList
                    markers={props.markers}
                    onSelectClick={props.onSelectClick}
                    onToggleClick={handleToggleMarker} />
                </div>
              }
              <div className={`p-3 mb-4 whitespace-pre-wrap ${markerListDisplayState ? "blur-sm" : ""}`}>
                {props.jsonData == undefined && 
                  <div className="border rounded-lg border-red-500 mb-3 p-3 text-red-500">
                    Something wrong happened.<br />Try asking again.
                  </div>
                }
                {props.displayState === 1 && props.markerHistory &&
                  // Display chat always, as the user can only edit initial input
                  <JsonRenderer 
                    jsonChatHistory={props.jsonData?.chat_history} 
                    onSelectClick={props.onSelectClick} 
                    markerHistory={props.markerHistory}
                    mapMarkers={props.markers}/>
                }
                {props.displayState === 2 && !editTextState &&
                  // Display text when not editing, because the textarea displays the same.
                  <div>{editText}</div>
                }
              </div>
            </>
          }
        </div>
      )}


      {props.displayState === 1 &&
        // Displays ChatInput when displaying chat
        <div className="p-3 z-20 flex justify-center mt-auto space-x-2 reversed_shadow shadow-md">
          <Input
            name="ChatInput"
            placeholder="Type your message here..."
            type="text"
            value={newText}
            onChange={handleInputChange}
          />
          <Button variant="secondary" onClick={handleAddToChat} disabled={newText?.trim() === ""}>
            Send
          </Button>
        </div>
      }
    </aside>
  );
}

export { InputDisplay }