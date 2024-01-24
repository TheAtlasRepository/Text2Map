import { Button } from "@/components/ui/button";
import { useReducer } from "react"; // Import the useReducer hook
import AskingView from "./askingView";

const initialState = { asking: false, editedText: '', textareaValue: '' };

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_TEXTAREA_VALUE':
      return { ...state, textareaValue: action.value };
    case 'ASK':
      return { ...state, asking: true, editedText: action.value };
    default:
      throw new Error();
  }
}

export default function StartChatGPt() {
  const [state, dispatch] = useReducer(reducer, initialState); // Use the useReducer hook

  const handleEditSave = (text: string) => {
    console.log('handleEditSave called. text:', text);
    dispatch({ type: 'ASK', value: text }); // Update editedText using dispatch
  };
  
  const handleTextareaChange = (e: any) => {
    dispatch({ type: 'SET_TEXTAREA_VALUE', value: e.target.value });
  };

  const handleAskButtonClick = () => {
    if (state.textareaValue.trim() !== "") {
      dispatch({ type: 'ASK', value: state.textareaValue });
    }
  };

    return (
        <div>
            {state.asking ? (
                <AskingView onEditSave={handleEditSave} editedText={state.editedText} />
            ) : (
                <>
                    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-lg">
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
                            <form className="flex flex-col items-center">
                                <textarea
                                    className="w-full p-4 border rounded-lg mb-4"
                                    placeholder="Ask a question"
                                    value={state.textareaValue}
                                    onChange={handleTextareaChange}
                                />
                                <Button
                                    className={`w-full ${state.textareaValue.trim() === "" ? "bg-gray-300 cursor-not-allowed" : ""}`}
                                    variant={"secondary"}
                                    onClick={handleAskButtonClick}
                                    disabled={state.textareaValue.trim() === ""}
                                >
                                    Ask ChatGPT
                                </Button>
                            </form>
                            <p className="text-center text-sm text-gray-500 mt-4">Question + Answer is limited to 1000 words</p>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}