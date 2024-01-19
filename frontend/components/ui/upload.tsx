import * as React from "react"

import { cn } from "@/lib/utils"

const dropArea = document.getElementById('dropArea');
const fileInput = document.getElementById('fileInput') as HTMLInputElement;
const browseButton = document.getElementById('browseButton');

// Handle file drop event
dropArea.addEventListener('drop', (event) => {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  handleFile(file);
});

// Handle file browse event
browseButton.addEventListener('click', () => {
  fileInput.click();
});

// Handle file selection from file input
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0];
  handleFile(file);
});

// Handle file upload
function handleFile(file: File) {
  if (file) {
    // Perform file upload logic here
    console.log('File uploaded:', file.name);
  }
}
// I am cooking, not finished