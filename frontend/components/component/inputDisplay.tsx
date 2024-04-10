import React, { useEffect, useRef, useState } from 'react';
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import JsonRenderer from "../functions/JsonRenderer";
import { Bbl } from '../ui/bbl';
import { Pencil } from '../ui/icons';
import { Textarea } from '../ui/textarea';
import autosizeTextArea from '../functions/AutosizeTextArea';
import { MapMarker } from '../types/MapMarker';

// Type for defining input params for the 
type InputDisplayProps = {
  displayState: number,
  loading: boolean,
  input: any,
  jsonData?: any,
  markers: MapMarker[];
  onSaveEditText: (text: string) => void,
  onSendRequest?: (text: string) => void
}

/**
 * @param displayState Display for Chat = 1, text = 2 or CSV = [not implemented]
 * @param loading Loading state value
 * @param input Input text
 * @param JsonData Input jsonData
 * @param markers List of markers to display related info
 * @param {function} onSaveEditText Save event for when text is saved
 * @returns 
 */
const InputDisplay = (props: InputDisplayProps) => {
  const [numberOfLocations, setNumberOfLocations] = useState(0);
  const [editText, setEditText] = useState(props.input);
  const [editTextState, setEditTextState] = useState(false);
  const [newText, setNewText] = useState('');

  //const newInputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  //AutosizeTextArea
  autosizeTextArea(editInputRef.current, editText);

  useEffect(() => {
    setNumberOfLocations(props.markers.length);
  }, [props.markers]);


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


  return (
    <aside className="w-1/3 flex flex-col" style={{ height: 'calc(100vh - 57px)' }}>
      <div className="p-2 px-4 flex items-center justify-between border-b dark:border-b-gray-600 dark:bg-slate-900">
        <div className="items-center">
          {numberOfLocations} Locations
        </div>
        <Button
          onClick={handleEditClick}
          variant="secondary"
          className="flex items-center justify-center"
          disabled={editTextState}
        >
          <Pencil className="inline w-5 h-5 mr-2" />Edit text
        </Button>
      </div>
      {props.loading ? (
        <Bbl />
      ) : (
        <div className="dark:text-white overflow-y-auto scroll_overflow_shadow">
          {(props.displayState === 1 || props.displayState === 2) &&
            // This setup makes Textarea invisible and read-only when not in use, and displays it when editing is enabled
            // For autosizing to work, Textarea can not be unloaded, as the size updates upon next statechange, resulting in a squished textarea on first load
            // By making Textarea invisible, positioned relative, and with 0 height, it maintains the same dimentiones when hidden. This ensures that Textarea displays correctly when editing is enabled
            <>
              <div className={editTextState
                ? "sticky top-0 py-3 px-3 bg-white dark:bg-gray-800 border-b dark:border-b-gray-600"
                : "relative h-0 px-3 opacity-0 pointer-events-none"
              }>
                <Textarea
                  name="EditText"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
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


              <div className="mb-10 p-3 whitespace-pre-wrap">
                {props.displayState === 1 &&
                  // Display chat always, as the user can only edit initial input
                  <JsonRenderer jsonData={props.jsonData} />
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
        <div className="p-3 flex justify-center mt-auto space-x-2">
          <Input
            name="ChatInput"
            placeholder="Type your message here..."
            type="text"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
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