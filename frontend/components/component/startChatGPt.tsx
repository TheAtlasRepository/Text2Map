import { Button } from "@/components/ui/button";
import { useState } from "react";
import AskingView from "./askingView";

export default function StartChatGPt() {
    const [asking, setAsking] = useState(false);
    const [editedText, setEditedText] = useState(''); // State to store the edited text

    const handleEditSave = (text: string) => {
      setEditedText(text);
    };

    const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        // Update the state with the content of the textarea
        setEditedText(e.target.value);
    };

    const handleAskButtonClick = () => {
        if (editedText.trim() !== "") {
            setAsking(true);
        }
    };

    return (
        <div>
            {asking ? (
                <AskingView onEditSave={handleEditSave} editedText={editedText} />
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
                                    value={editedText}
                                    onChange={handleTextareaChange}
                                />
                                <Button
                                    className={`w-full ${editedText.trim() === "" ? "bg-gray-300 cursor-not-allowed" : ""}`}
                                    variant={"secondary"}
                                    onClick={handleAskButtonClick}
                                    disabled={editedText.trim() === ""}
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