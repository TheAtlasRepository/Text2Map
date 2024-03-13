
import { useState, useEffect } from "react";
import { CloseIcon, TrashHeroIcon } from "../ui/icons";

export default function InfoPanel(props: {
  title: string;
  onClosed: () => void;
  onDeleteMarker: () => void; // Add this line
  onEditMarker: () => void;
  onMarkerTitleChange: (newTitle: string) => void;
  type?: string;
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
    <div className="block min-w-[180px] bg-white rounded-lg shadow dark:bg-gray-800 dark: text-white">
      {
        imageLink == "" ? (
          <div style={{ width: "240px", height: "125px" }}>
            <p className="text-center font-semibold">Loading...</p>
          </div>
        ) : (
          <img className="rounded-t-lg" style={{ width: "240px", height: "125px" }} src={imageLink} />
        )
      }
      <div className="p-5 flex-col items-center ">
        <a href="#">
          <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">{props.title}</h5>
        </a>
        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-full p-2 focus:outline-none" onClick={props.onEditMarker}>
          Edit Marker
        </button>
      </div>
      <div className="absolute top-0 left-0 mt-2 ml-2">
        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none" onClick={props.onDeleteMarker}>
          <TrashHeroIcon />
        </button>
      </div>
      <div className="absolute top-0 right-0 mt-2 mr-2">
        <button className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none" onClick={props.onClosed}>
          <CloseIcon />
        </button>
      </div>
    </div>
  )
}
