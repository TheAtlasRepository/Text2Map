import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReducer } from "react"; // Import the useReducer hook

const initialState = { asking: false, editedText: '', textareaValue: '' };

function reducer(state: any, action: any) {
  switch (action.type) {
    case 'SET_TEXTAREA_VALUE':
      return { ...state, textareaValue: action.value };
    case 'INPUT':
      return { ...state, asking: true, editedText: action.value };
    default:
      throw new Error();
  }
}

export default function StartDataSource() {
  const [state, dispatch] = useReducer(reducer, initialState); // Use the useReducer hook

  // const handleEditSave = (text: string) => {
  //   console.log('handleEditSave called. text:', text);
  //   dispatch({ type: 'INPUT', value: text }); // Update editedText using dispatch
  // };

  const handleTextareaChange = (e: any) => {
    dispatch({ type: 'SET_TEXTAREA_VALUE', value: e.target.value });
  };

  const handleInputButtonClick = () => {
    if (state.textareaValue.trim() !== "") {
      console.log('Trimmed input is not empty, so create map!');
      dispatch({ type: 'INPUT', value: state.textareaValue });
    }
  };

  const handleExampleText = () => {
    console.log('Example text was pressed! Send something.');
    dispatch({ type: 'INPUT', value: "Where is Big Ben?" });
  }


  return (
    <div className="max-w-4xl mx-auto my-12 p-8 bg-white rounded-lg">
      <div className="flex flex-row justify-center gap-8 mb-10">
        <div className="text-blue-500 bg-white border border-blue-500 rounded-md shadow-md shadow-blue-500 transition-shadow">
          <div className="p-6 py-2">Text</div>
        </div> 

        <Button variant="fancy_blue_select">
          <div>Spreadsheet</div>
        </Button>
      </div>
      <div className="flex">
        <div className="text-gray-500 pb-10">
          <h2 className="text-xl font-semibold mb-4">To generate a map, type or paste in your text here. <br /> For best results:</h2>
          <ul className="list-disc pl-5 space-y-2 ">
            <li>Capitalise location names: New York, Eiffel Tower, Thailand.</li>
            <li>Use natural language: I saw the Big Ben while in London.</li>
            <li>Add commas between locations: Paris, Rome, Ibiza.</li>
          </ul>
        </div>
      </div>
      <div className="pb-10">
        <form className="flex flex-col items-center">
          <Textarea
            name="TextAreaInput"
            className="mb-4"
            placeholder="Aa"
            value={state.textareaValue}
            onChange={handleTextareaChange}
          />
          <div className="flex w-full center justify-between">
            <div className="text-sm text-gray-600">
              {state.textareaValue.trim().length}/3000 Characters used
            </div>
            <div>
              <Button
                className={`w-full transition ${state.textareaValue.trim() === "" ? "bg-gray-500 cursor-not-allowed" : ""}`}
                variant={"blue"}
                onClick={handleInputButtonClick}
                disabled={state.textareaValue.trim() === ""}
              >
                Generate Map
              </Button>
            </div>
            
            
          </div>
          
        </form>
      </div>

      <div className="flex justify-center">
        <Button variant="fancy_blue"
          onClick={handleExampleText}>
          <div className="px-4" >💡 Try an existing text ➡</div>
        </Button>
      </div>
    </div>
  );
}  