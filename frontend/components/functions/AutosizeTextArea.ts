import { useEffect } from "react";

// Updates the height of a <textarea> when the value changes.
const autosizeTextArea = (
  textAreaRef: HTMLTextAreaElement | null,
  value: string,
  secondaryUpdateValue?: any
) => {
  useEffect(() => {
    if (textAreaRef) {
      // Reset the height to get the correct scrollHeight for the textarea
      textAreaRef.style.height = "0px";
      const scrollHeight = textAreaRef.scrollHeight;

      // Set the height directly, outside of the render loop
      textAreaRef.style.height = scrollHeight + 2 + "px";
    }
  }, [textAreaRef, value, secondaryUpdateValue]);
};

export default autosizeTextArea;