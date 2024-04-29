import { useState } from "react";
import { CloseIcon, EyeSlashIcon, InternetGlobeIcon, PencilIcon } from "../ui/icons";
import { MapMarker } from "../types/MapMarker";

/**
 * Info panel displayed over a selected marker on the map.
 * 
 * @param marker The marker object to display
 * @param onClosed Event activated when closing the panel
 * @param onHideMarker Event for when hide is clicked. Sends the id of the marker
 * @param onEditMarker Event for when edit is clicked
 * @returns The JSX element
 */
const InfoPanel = (props: {
  marker: MapMarker;
  onClosed: () => void;
  onHideMarker: (id: number) => void; // Add this line
  onEditMarker: () => void;
}) => {
  const [loadingImgState, setLoadingImgState] = useState(true)
  const imageLoaded = () => {
    setLoadingImgState(false);
  }
  const LearnMoreLink = (url: string, targetBlank: boolean) => {
    return (
      <a href={url} target={targetBlank ? "_blank" : ""}>
        <div className="flex text-nowrap p-2 hover:bg-white/90 dark:hover:bg-gray-700">
          <InternetGlobeIcon className="mr-2" />Learn more
        </div>
      </a>
    )
  }

  return (
    <div className="block min-w-[180px] bg-white rounded-lg shadow dark:bg-gray-800 dark:text-white">
      {
        props.marker.imgUrl == "" ? (
          <div style={{ width: "240px", height: "125px" }}>
            <p className="rounded-t-lg flex items-center justify-center h-full font-semibold bg-gray-200 dark:bg-slate-900">
              No image found sadly.
            </p>
          </div>
        ) : (
          <>
            <div style={{ width: "240px", height: "125px", display: loadingImgState ? "block" : "none" }}>
              <p className="rounded-t-lg flex items-center justify-center h-full font-semibold bg-gray-200 dark:bg-slate-900">
                Loading image...
              </p>
            </div>
            <div style={{ display: loadingImgState ? "none" : "block" }}>
              <img
                className="rounded-t-lg object-cover" style={{ width: "240px", height: "125px" }}
                src={props.marker.imgUrl}
                onLoad={imageLoaded}
              />
            </div>
          </>
        )
      }
      <div className="text-sm flex border-b dark:border-b dark:border-gray-600">
        <div className="w-1/2">
          {(props.marker.infoUrl != "") 
            ?(<>{LearnMoreLink(props.marker.infoUrl, true)}</>)
            :(<>{LearnMoreLink("#", false)}</>)
          }
        </div>
        <div className="w-1/2 flex justify-end">
          <button className="hover:bg-white/90 dark:hover:bg-gray-700 p-2 px-3"
            onClick={props.onEditMarker}
          >
            <PencilIcon className="mr-2 " />Edit pin
          </button>
        </div>

      </div>
      <div id="pinDescription" className="p-2 px-3">
        {/* {(props.marker.pinDiscription == "")} */}

        {(props.marker.discription == "") ? (
          <div className="text-gray-400 dark:text-gray-500">
            No description added yet...
          </div>
        ) : (<>{props.marker.discription}</>)
        }
      </div>

      <div className="absolute top-0 left-0 mt-2 ml-2">
        <button
          className="bg-gray-100 hover:bg-white/90 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none"
          title="Hide marker"
          onClick={() => props.onHideMarker(props.marker.numId)}>
          <EyeSlashIcon className="h-6 w-6" />
        </button>
      </div>
      <div className="absolute top-0 right-0 mt-2 mr-2">
        <button
          className="bg-gray-100 hover:bg-white/90 dark:bg-gray-800 dark:hover:bg-gray-700 rounded-full p-2 focus:outline-none"
          title="Close popup"
          onClick={props.onClosed}>
          <CloseIcon className="h-6 w-6" />
        </button>
      </div>
    </div>
  )
}

export default InfoPanel;
