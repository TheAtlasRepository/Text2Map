import React, { useEffect, useRef, useState } from 'react';
import { Button, } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "../ui/scroll-area";
import JsonRenderer from "../functions/JsonRenderer";
import { Bbl } from '../ui/bbl';
import { Pencil } from '../ui/icons';
import { Textarea } from '../ui/textarea';
import autosizeTextArea from '../functions/AutosizeTextArea';


/**
 * 
 * @param displayState Display for Chat, text or CSV
 * @param input Input text
 * @param JsonData Input jsonData
 * @param markers List of markers to display related info
 * @returns 
 */
const InputDisplay = (props: {
  displayState: number,
  input: any,
  jsonData?: any,
  markers: { latitude: number; longitude: number; type: string }[];
}) => {
  const [loading, setLoading] = useState(false);
  const [numberOfLocations, setNumberOfLocations] = useState(0);
  const [displayText, setDisplayText] = useState(props.input);
  const [editTextState, setEditTextState] = useState(false);
  const [editText, setEditText] = useState(props.input);
  const [inputNewText, setInputNewText] = useState('');
  const [jsonData, setJsonData] = useState(props.jsonData);

  //const newInputRef = useRef<HTMLTextAreaElement>(null);
  const editInputRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (e: any) => {
    setEditText(e.target.value);

  };

  //AutosizeTextArea
  // autosizeTextArea(newInputRef.current, inputNewText);
  autosizeTextArea(editInputRef.current, editText);


  useEffect(() => {
    setNumberOfLocations(props.markers.length);
  }, [props.markers]);

  useEffect(() => {
    console.log('jsonData got changed: ', props.jsonData);

  }, [props.jsonData])

  // Handle the case where the user clicks the "Edit & add text" button
  const handleEditClick = () => {
    setEditTextState(true);
    setEditText(displayText);
  };

  const handleCancelEdit = () => {
    setEditTextState(false)
  }

  // Save the text to the backend
  const handleSaveEdit = () => {
    setDisplayText(editText.trim())
    setEditTextState(false)
    //handleSaveChat(localEditedText, setEditingText, setCenterCoordinates, setLoading, setJsonData, setMarkers, setLocalEditedText, prevEditedTextRef);
  };

  const handleSendNewText = () => {
    // Send inputNewText
  }


  return (
    <aside className="w-1/3 border-r flex flex-col">
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
      <div className="flex flex-col h-full">
        <ScrollArea>
          <div className="px-3 py-5 dark:text-white">
            {loading ? (
              <Bbl />
            ) : (
              <div className="whitespace-pre-wrap">
                {props.displayState === 1 && editTextState &&
                  // Textarea displayed for chat
                  <Textarea
                    name="EditChat"
                    value={editText}
                    rows={1}
                    onChange={handleChange}
                    ref={editInputRef}
                  />
                }
                {props.displayState === 2 &&
                  // Textarea displayed for manual text
                  <Textarea
                    name="DisplayEditText"
                    value={editText}
                    rows={5}
                    hiddenState={editTextState ? 0 : 1}
                    onChange={handleChange}
                    ref={editInputRef}
                    readOnly={!editTextState}
                  />
                }
                {editTextState &&
                  <div className="flex pt-2 mb-4 space-x-4">
                    <Button onClick={handleCancelEdit} variant="secondary">
                      Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} variant="blue">
                      Save
                    </Button>
                  </div>
                }

                {props.displayState === 1 &&
                  // DisplayState 2 for chat
                  <>
                    <JsonRenderer jsonData={jsonData} />
                  </>
                }
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-3 flex justify-center mt-auto space-x-2">
          <Input
            name="ChatInput"
            placeholder={props.displayState === 2 ? "Type your message here..." : "Add more text here..."}
            type="text"
            value={inputNewText}
            onChange={(e) => setInputNewText(e.target.value)}
          />
          <Button variant="secondary" onClick={handleSendNewText} disabled={inputNewText?.trim() === ""}>
            Send
          </Button>
        </div>
      </div>
    </aside>
  );
}

export { InputDisplay }