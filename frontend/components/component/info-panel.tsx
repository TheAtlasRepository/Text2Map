
import { useState, useEffect } from "react";

export default function InfoPanel(props: { 
  title: string;
  onClosed: () => void;
  }) {
    const [imageLink, setImageLink] = useState("");

    useEffect(() => {
      // Fetch data from API
      try {
        fetch('http://127.0.0.1:8000/imagesearch?query=' + props.title)
        .then(response => response.json())
        .then(data => {
          // Update the image link state variable
          setImageLink(data.url);
        });
      } catch (error) {
        console.log(error);
      }
      
    }, []);

  return (
      <div className="block min-w-[180px] bg-white rounded-lg shadow dark:bg-gray-800">
        <a href="#">
            <img className="rounded-t-lg" src={imageLink}/>
        </a>
        <div className="p-5">
            <a href="#">
                <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{props.title}</h5>
            </a>
        </div>
        <div className="absolute top-0 left-0 mt-2 ml-2">
        <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 focus:outline-none">
          <TrashIcon className="h-6 w-6 text-black" />
        </button>
      </div>
      <div className="absolute top-0 right-0 mt-2 mr-2">
        <button className="bg-gray-100 hover:bg-gray-200 rounded-full p-2 focus:outline-none" onClick={props.onClosed}>
          <XIcon className="h-6 w-6 text-black" />
        </button>
      </div>
    </div>
  
  )
}

function TrashIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2v2" />
    </svg>
  )
}


function XIcon(props:any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 24"
      fill="currentColor"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path xmlns="http://www.w3.org/2000/svg" d="M3 21.32L21 3.32001" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      <path xmlns="http://www.w3.org/2000/svg" d="M3 3.32001L21 21.32" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  )
}
