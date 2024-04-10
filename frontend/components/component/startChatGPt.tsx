import { Button } from "@/components/ui/button";
import { useRef, useState } from "react";
import AskingView from "./askingView";
import { Toolbar } from "../ui/toolbar";
import { Textarea } from "../ui/textarea";
import autosizeTextArea from "../functions/AutosizeTextArea";
import { MapMarker } from "../types/MapMarker";


// Define the StartChatGPt component
export default function StartChatGPt() {
  const [geoJsonPath, setGeoJsonPath] = useState<string | null>(null);
  const [markers, setMarkersToolbar] = useState<MapMarker[]>([]);
  const [textareaValue, setTextareaValue] = useState("");
  const [inputText, setInputText] = useState("");
  const [askigState, setAskingState] = useState(false);

  //AutosizeTextArea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  autosizeTextArea(textareaRef.current, textareaValue);

  // Handler for the onEditSave prop
  const saveEditText = (text: string) => {
    console.log("SaveEditText called. text:", text);
    
    // Do nothing if new text is same as old
    if(text == inputText) {
      console.log("New text was same as old one. No need to repeat request.");
      return;
    }
    setInputText(text);
    setAskingState(true);
  };

  // Handler for the textarea change event
  const handleTextareaChange = (e: any) => {
    setTextareaValue(e.target.value);
  };

  // Handler for the Ask button click event
  const handleAskButtonClick = () => {
    if (textareaValue.trim() !== "") {
      setInputText(textareaValue);
      setAskingState(true);
    }
  };

  // Handler for discarding and returning to start
  const handleDiscard = () => {
    setTextareaValue("");
    setInputText("");
    setAskingState(false);
  }

  return (
    <div>
      <Toolbar
        viewAllOptions={askigState}
        onDiscardClick={handleDiscard}
        geoJsonPath={geoJsonPath}
        markers={markers}
      />
      {askigState ? (
        <AskingView
          inputText={inputText}
          onSaveEditText={saveEditText}
          setGeoJsonPath={setGeoJsonPath}
          setMarkersToolbar={setMarkersToolbar} />
      ) : (
        <>
          <div>
            <div className="max-w-4xl mx-auto my-12 mt-4 p-8 dark:text-gray-300">
              <h1 className="text-3xl font-bold text-center mb-6">Create a map from an ask</h1>
              <div className="flex flex-col lg:flex-row justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-4">Examples of what you can ask:</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>What should I see when visiting Paris?</li>
                    <li>What are the highest mountains in the world?</li>
                    <li>Which countries took part in WW2?</li>
                    <li>Where are bananas grown?</li>
                    <li>Where are the best surfing spots in California?</li>
                  </ul>
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-4">Limitations</h2>
                  <ul className="list-disc pl-5 space-y-2">
                    <li>Limited knowledge up to 2021</li>
                    <li>May find locations in other places than intended</li>
                    <li>Limited to bounderies gathered from geoBounderies</li>
                  </ul>
                </div>
              </div>
              <div className="mt-8">
                {/* <form className="flex flex-col items-center"> */}
                <Textarea
                  name="TextAreaInput"
                  className="mb-4"
                  placeholder="Ask a question"
                  ref={textareaRef}
                  value={textareaValue}
                  onChange={handleTextareaChange}
                />
                <Button
                  className={`w-full ${textareaValue.trim() === "" ? "bg-gray-500 cursor-not-allowed " : ""}`}
                  variant={"blue"}
                  onClick={handleAskButtonClick}
                  disabled={textareaValue.trim() === ""}
                >
                  Ask ChatGPT
                </Button>
                {/* </form> */}
                <p className="text-center text-sm text-gray-500 mt-4">Question + Answer is limited to 1000 words</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}