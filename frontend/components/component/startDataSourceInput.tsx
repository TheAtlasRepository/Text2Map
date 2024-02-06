import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useReducer } from "react"; // Import the useReducer hook

const initialState = { asking: false, textSource: true, editedText: '', textareaValue: '', fileUploaded: false };

function reducer(state: any, action: any) {
    switch (action.type) {
        case 'SET_TEXTAREA_VALUE':
            return { ...state, textareaValue: action.value };
        case 'INPUT':
            return { ...state, asking: true, editedText: action.value };
        case 'TOGGLE':
            return { ...state, textSource: !state.textSource };
        case 'UPLOAD':
            return { ...state, fileUploaded: !state.fileUploaded };
        default:
            throw new Error();
    }
}

export default function StartDataSource() {
    const [state, dispatch] = useReducer(reducer, initialState); // Use the useReducer hook
    const maxLengthInput = 3000; // Max length for input

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

    const handleInputToggle = () => {
        dispatch({ type: 'TOGGLE' });
    }

    const handleCSVButtonClick = () => {
        if (state.fileUploaded) {
            console.log("File uploaded. Generate map!");
        }
    }



    return (
        <div className="max-w-4xl mx-auto my-12 p-8 bg-white">

            <div className="bg-gray-100 rounded-lg p-1 inline-flex gap-1">
                <button
                    className={`rounded-lg border ${state.textSource ? "bg-white border-blue-500 text-blue-500 border-underline-blue" : "text-gray-500 border-gray-100"}`}
                    disabled={state.textSource}
                    onClick={handleInputToggle}
                >
                    <div className="px-6 py-1">Text</div>
                </button>
                <button
                    className={`rounded-lg border ${!state.textSource ? "bg-white border-blue-500 text-blue-500 border-underline-blue" : "text-gray-500 border-gray-100"}`}
                    disabled={!state.textSource}
                    onClick={handleInputToggle}
                >
                    <div className="px-6 py-1">Spreadsheet</div>
                </button>
            </div>

            {state.textSource ? (
                <>
                    <div className="flex mt-5">
                        <div className="text-gray-500 pb-10">
                            <h2 className="text-xl font-semibold mb-4">Type or paste in your text here to generate a map. <br /> For best results:</h2>
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
                                    <span className={`${state.textareaValue.trim().length > maxLengthInput ? "text-red-500" : ""}`}>
                                        {state.textareaValue.trim().length}/{maxLengthInput} Characters used
                                    </span>
                                </div>
                                <div>
                                    <Button
                                        className={`w-full transition ${state.textareaValue.trim() === "" || state.textareaValue.trim().length > maxLengthInput ? "bg-gray-500 cursor-not-allowed" : ""}`}
                                        variant={"blue"}
                                        onClick={handleInputButtonClick}
                                        disabled={state.textareaValue.trim() === "" || state.textareaValue.trim().length > maxLengthInput}
                                    >
                                        Generate Map
                                    </Button>
                                </div>


                            </div>

                        </form>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex mt-5">
                        <div className="text-gray-500 pb-10">
                            <h2 className="text-xl font-semibold mb-4">Upload a CSV file here to generate a map.<br /> For best results:</h2>
                            <ul className="list-disc pl-5 space-y-2 ">
                                <li>Supported file formats: CSV</li>
                                <li>Capitalise location names: New York, Eiffel Tower, Thailand.</li>
                            </ul>
                        </div>
                    </div>
                    <div className="pb-10">
                        <div className="flex items-center justify-center w-full mb-2">
                            <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-64 border-4 border-blue-200 border-dashed rounded-lg cursor-pointer hover:bg-gray-100">
                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                    <UploadIcon className="w-8 h-8 mb-4 text-blue-300 "/>
                                    <p className="mb-2 text-sm text-gray-400 "><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                    <p className="text-xs text-gray-400 ">CSV</p>
                                </div>
                                <input id="dropzone-file" type="file" accept=".csv" className="hidden" />
                            </label>
                        </div>

                        <div className="flex gap-2 justify-end">
                            <Button
                                className={`w-full transition ${!state.fileUploaded ? "bg-gray-500 cursor-not-allowed" : ""}`}
                                variant={"blue"}
                                onClick={handleCSVButtonClick}
                                disabled={!state.fileUploaded}
                            >
                                Generate Map
                            </Button>
                        </div>
                    </div>
                </>
            )}
            <div className="flex">
                <Button variant="fancy_blue"
                    onClick={handleExampleText}>
                    <div className="px-4" >💡 Try an existing text ➡</div>
                </Button>
            </div>
        </div>
    );
}

function UploadIcon(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 20 16"
            aria-hidden="true"
            fill="none"
        >
            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
        </svg>
    )
}