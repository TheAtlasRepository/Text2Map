import { useEffect } from "react";

/**
 * Function for updating the height of textareas when the text-input changes
 * @param textAreaRef Ref to the textarea to update
 * @param value Text value related to the textarea
 */
const autosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string
) => {
  useEffect(() => {
    if (textAreaRef) {
      // Reset the height to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;

      // Set the height directly, outside of the render loop
      textAreaRef.style.height = scrollHeight + 2 + "px";
    }
  }, [textAreaRef, value]);
};

export default autosizeTextArea;