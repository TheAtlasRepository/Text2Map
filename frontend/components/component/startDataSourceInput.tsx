import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { handleSendTextInput } from "../functions/ApiUtils";
import { ScrollArea } from "../ui/scroll-area";
import { ArrowLongIcon, UploadIcon } from "../ui/icons";
import { Toolbar } from "../ui/toolbar";
import MapComponent from "./mapComponent";
import Navbar from "@/components/ui/navbar";

export default function StartDataSource() {
  const maxLengthInput = 3000; // Max length for input
  const router = useRouter();

  const CSV_Available = false; // Value to toggle the CSV option

  const [mapView, setMapView] = useState(false);
  const [textSource, toggleTextSource] = useState(true);
  const [inputText, setInputText] = useState("");
  const [newInputText, setNewInputText] = useState("");
  const [textareaValue, setTextareaValue] = useState("");
  // const [textareaValue, setTextareaValue] = useState(() => {
  //     const savedText = localStorage.getItem('textValue');
  //     return savedText || '';
  // });
  const [uploadedFile, setUploadedFile] = useState(false);

  const [jsonData, setJsonData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editingText, setEditingText] = useState(false);
  const [localEditedText, setLocalEditedText] = useState("");
  const [markers, setMarkers] = useState<
    { latitude: number; longitude: number; type: string }[]
  >([]);
  const [selectedMarkerIndex, setSelectedMarkerIndex] = useState<number | null>(
    null
  );
  const [centerCoordinates, setCenterCoordinates] = useState<
    [number, number] | null
  >(null);

  const handleTextareaChange = (e: any) => {
    setTextareaValue(e.target.value);
    //localStorage.setItem('textValue', e.target.value);
  };

  const handleInputButtonClick = () => {
    if (textSource && textareaValue.trim() !== "") {
      console.log("Trimmed input is not empty, so create map!");
      setInputText(textareaValue);
      handlePostText(textareaValue);
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

  const handlePostText = (text: string) => {
    handleSendTextInput(
      text,
      setJsonData,
      setCenterCoordinates,
      setMarkers,
      setLoading
    );

    //setInputText("");
  };

  const handleEditClick = () => {
    setEditingText(true);
  };

  // Ask user if he wants to reload the page
  useEffect(() => {
    window.onbeforeunload = () => true;
    return () => {
      window.onbeforeunload = null;
    };
  }, []);

  // const handleSaveTextWrapper = () => {
  //     handleSaveChat(localEditedText, setEditingText, setLoading, setJsonData, setMarkers, setLocalEditedText, prevEditedTextRef);
  // };

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
                    value={textareaValue}
                    onChange={handleTextareaChange}
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
                        onClick={handleInputButtonClick}
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
                      onClick={handleInputButtonClick}
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
            <aside
              className="w-1/3 p-4 space-y-4 border-r flex flex-col"
              style={{ flex: "0 0 auto", height: "calc(100vh - 57px)" }}
            >
              <ScrollArea>
                <div>{inputText}</div>
              </ScrollArea>
            </aside>
            <main className="flex-auto relative w-2/3">
              <div style={{ height: "calc(100vh - 57px)" }}>
                <MapComponent
                  markers={markers}
                  centerCoordinates={centerCoordinates}
                  selectedMarkerIndex={selectedMarkerIndex}
                  setSelectedMarkerIndex={setSelectedMarkerIndex}
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
