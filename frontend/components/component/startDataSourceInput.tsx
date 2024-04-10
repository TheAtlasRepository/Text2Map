import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useEffect, useRef, useState } from "react";
import { handleSendTextInput } from "../functions/ApiUtils";
import { ArrowLongIcon, UploadIcon } from "../ui/icons";
import { Toolbar } from "../ui/toolbar";
import MapComponent from "./mapComponent";
import { InputDisplay } from "../component/inputDisplay";
import autosizeTextArea from '../functions/AutosizeTextArea';
import { MapMarker } from "../types/MapMarker";

export default function StartDataSource() {
  const maxLengthInput = 3000; // Max length for input
  const CSV_Available = false; // Value to toggle the CSV option

  const [mapView, setMapView] = useState(false);
  const [textSource, toggleTextSource] = useState(true);
  const [inputText, setInputText] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  const [uploadedFile, setUploadedFile] = useState(false);

  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  // const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);

  //AutosizeTextArea
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  autosizeTextArea(textareaRef.current, textareaValue);


  // Handle for processing a given input
  const handleInputButtonClick = (input: string) => {
    if (textSource && input.trim() !== "") {
      console.log("Recieved text! Creating map!");
      setInputText(input);
      handlePostText(input);
      setMapView(true);
    } else if (!textSource && uploadedFile) {
      console.log("File uploaded. Generate map!");
    }
  };

  const handleExampleText = () => {
    console.log("Example text was pressed! Send something.");
    // let text = 'Where can i find London?';
    let text = "Bananas are grown in many tropical regions around the world. Major banana-producing countries include India, China and Brazil to name a few.";
    setInputText(text);
    setMapView(true);
    handlePostText(text);
  };

  const handleInputToggle = () => {
    toggleTextSource(!textSource);
  };

  const handleDiscard = () => {
    console.log("Discarded was activated");
    setTextareaValue("");
    setInputText(""); // Remove the text for the map so it reverts to input page
    setMapView(false);
  };

  // handler for posting a given text to the backend
  const handlePostText = (text: string) => {
    handleSendTextInput(
      text,
      setJsonData,
      setMarkers,
      setLoading
    );
  };

  const handleSetMarkers = (markers: MapMarker[]) => {
    setMarkers(markers);
  }

  // Ask user if he wants to reload the page
  useEffect(() => {
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  return (
    <div>
      {/* <Navbar activePage="startDataSourceInput" /> */}
      <Toolbar viewAllOptions={mapView} onDiscardClick={handleDiscard} />
      {!mapView ? (
        <>
          <div className="max-w-4xl mx-auto mb-12 mt-4 px-8 text-gray-600 dark:text-gray-300">
            {CSV_Available &&
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-1 inline-flex gap-1">
                <button
                  className={`rounded-lg border ${textSource
                    ? "bg-white dark:bg-slate-800 text-blue-500 border-blue-500 border-underline-blue"
                    : "border-gray-100 dark:border-gray-800 dark:text-gray-400"
                    }`}
                  disabled={textSource}
                  onClick={handleInputToggle}
                >
                  <div className="px-6 py-1">Text</div>
                </button>
                <button
                  className={`rounded-lg border ${!textSource
                    ? "bg-white dark:bg-slate-800 border-blue-500 text-blue-500 border-underline-blue"
                    : "border-gray-100 dark:border-gray-800 dark:text-gray-500"
                    }`}
                  disabled={!textSource}
                  onClick={handleInputToggle}
                >
                  <div className="px-6 py-1">Spreadsheet</div>
                </button>
              </div>
            }
            {textSource ? (
              <>
                <div className="flex mt-12">
                  <div className="pb-10">
                    <h2 className="text-xl font-semibold mb-4">
                      Type or paste in your text here to generate a map. <br />{" "}
                      For best results:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 ">
                      <li>Capitalise location names: New York, Eiffel Tower, Thailand.</li>
                      <li>Use natural language: I saw the Big Ben while in London.</li>
                      <li>Add commas between locations: Paris, Rome, Ibiza.</li>
                    </ul>
                  </div>
                </div>
                <div className="pb-10">
                  {/* <form className="flex flex-col items-center"> */}
                  <Textarea
                    name="TextAreaInput"
                    className="mb-4"
                    placeholder="Aa"
                    ref={textareaRef}
                    value={textareaValue}
                    onChange={(e) => setTextareaValue(e.target.value)}
                  />
                  <div className="flex w-full center justify-between">
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      <span
                        className={`${textareaValue.trim().length > maxLengthInput
                          ? "text-red-500"
                          : ""
                          }`}
                      >
                        {textareaValue.trim().length}/{maxLengthInput}{" "}
                        Characters used
                      </span>
                    </div>
                    <div>
                      <Button
                        className={`w-full transition ${textareaValue.trim() === "" ||
                          textareaValue.trim().length > maxLengthInput
                          ? "bg-gray-500"
                          : ""
                          }`}
                        variant={"blue"}
                        onClick={() => handleInputButtonClick(textareaValue)}
                        disabled={
                          textareaValue.trim() === "" ||
                          textareaValue.trim().length > maxLengthInput
                        }
                      >
                        Generate Map
                      </Button>
                    </div>
                  </div>
                  {/* </form> */}
                </div>
              </>
            ) : (
              <>
                <div className="flex mt-5">
                  <div className="text-gray-600 pb-10 dark:text-gray-300">
                    <h2 className="text-xl font-semibold mb-4">
                      Upload a CSV file here to generate a map.
                      <br /> For best results:
                    </h2>
                    <ul className="list-disc pl-5 space-y-2 ">
                      <li>Supported file formats: CSV</li>
                      <li>Capitalise location names: New York, Eiffel Tower, Thailand.</li>
                    </ul>
                  </div>
                </div>
                <div className="pb-10">
                  <div className="flex items-center justify-center w-full mb-2">
                    <label
                      htmlFor="dropzone-file"
                      className="flex flex-col items-center justify-center w-full h-64 border-4 border-blue-300 dark:border-blue-400 border-dashed rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadIcon className="w-8 h-8 mb-4 text-blue-300 dark:text-blue-400" />
                        <p className="mb-2 text-sm text-gray-400 dark:text-gray-300 ">
                          <span className="font-semibold">Click to upload</span>{" "}
                          or drag and drop
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-300">
                          CSV
                        </p>
                      </div>
                      <input
                        id="dropzone-file"
                        type="file"
                        accept=".csv"
                        className="hidden"
                      />
                    </label>
                  </div>

                  <div className="flex gap-2 justify-end">
                    <Button
                      className={`w-full transition ${!uploadedFile ? "bg-gray-500 cursor-not-allowed" : ""
                        }`}
                      variant={"blue"}
                      onClick={() => handleInputButtonClick(textareaValue)}
                      disabled={!uploadedFile}
                    >
                      Generate Map
                    </Button>
                  </div>
                </div>
              </>
            )}
            <div className="flex">
              <Button variant="fancy_blue" onClick={handleExampleText}>
                <div className="px-4">
                  💡 Try an existing text <ArrowLongIcon />
                </div>
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white dark:bg-gray-800 dark:text-white overflow-y-auto">
          <div className="flex">
            <InputDisplay
              displayState={2} // 2 for manual text-input
              loading={loading}
              input={inputText}
              jsonData={jsonData} // Should probably shorten to just jsonData.chat-history
              markers={markers}
              onSetMarkers={handleSetMarkers}
              onSaveEditText={handleInputButtonClick}
            />
            <main className="flex-auto relative w-2/3">
              <div style={{ height: "calc(100vh - 57px)" }}>
                <MapComponent
                  markers={markers}
                  geojsonData={jsonData?.selected_countries_geojson_path}
                />
              </div>
            </main>
          </div>
        </div>
      )}
    </div>
  );
}
