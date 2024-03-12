import { Button } from "@/components/ui/button";
import { useReducer, useState } from "react"; // Import the useReducer hook
import AskingView from "./askingView";
import { Toolbar } from "../ui/toolbar";
import { Textarea } from "../ui/textarea";

const initialState = { asking: false, editedText: '', textareaValue: '' };

// Define the reducer function
function reducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_TEXTAREA_VALUE':
      return { ...state, textareaValue: action.value };
    case 'ASK':
      return { ...state, asking: true, editedText: action.value };
    case 'DISCARD':
      return { ...state, asking: false, editedText: '', textareaValue: '' };
    default:
      throw new Error();
  }
}

// Define the StartChatGPt component
export default function StartChatGPt() {
  const [state, dispatch] = useReducer(reducer, initialState); // Use the useReducer hook
  const [geoJsonPath, setGeoJsonPath] = useState<string | null>(null);
  const [markers, setMarkersToolbar] = useState<{ latitude: number; longitude: number; type: string;}[]>([]);

  // Handler for the onEditSave prop
  const handleEditSave = (text: string) => {
    console.log('handleEditSave called. text:', text);
    dispatch({ type: 'ASK', value: text }); // Update editedText using dispatch
  };
  
  // Handler for the textarea change event
  const handleTextareaChange = (e: any) => {
    dispatch({ type: 'SET_TEXTAREA_VALUE', value: e.target.value });
  };

  // Handler for the Ask button click event
  const handleAskButtonClick = () => {
    if (state.textareaValue.trim() !== "") {
      dispatch({ type: 'ASK', value: state.textareaValue });
    }
  };

  const handleDiscard = () => {
    dispatch({ type: 'DISCARD' });
  }

    return (
        <div>
            <Toolbar
                viewAllOptions={state.asking}
                onDiscardClick={handleDiscard}
                geoJsonPath={geoJsonPath}
                markers={markers}
            />
            {state.asking ? (
                // Pass the handleEditSave function as the onEditSave prop
                <AskingView onEditSave={handleEditSave} editedText={state.editedText} setGeoJsonPath={setGeoJsonPath} setMarkersToolbar={setMarkersToolbar}/>
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
                                    <li>Which countries took part in WW2</li>
                                    <li>Where is banana grown?</li>
                                    <li>Where are the best surfing spots in California?</li>
                                </ul>
                            </div>
                            <div className="flex-1">
                                <h2 className="text-xl font-semibold mb-4">Limitations</h2>
                                <ul className="list-disc pl-5 space-y-2">
                                    <li>Limited knowledge up to 2021</li>
                                    <li>May find locations in other places than intended</li>
                                </ul>
                            </div>
                        </div>
                        <div className="mt-8">
                            {/* <form className="flex flex-col items-center"> */}
                                <Textarea
                                    className="mb-4"
                                    placeholder="Ask a question"
                                    value={state.textareaValue}
                                    onChange={handleTextareaChange}
                                />
                                <Button
                                    className={`w-full ${state.textareaValue.trim() === "" ? "bg-gray-500 cursor-not-allowed " : ""}`}
                                    variant={"blue"}
                                    onClick={handleAskButtonClick}
                                    disabled={state.textareaValue.trim() === ""}
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