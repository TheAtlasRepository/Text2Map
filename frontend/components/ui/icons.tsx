import React from "react";
import { cn } from "@/lib/utils"

const baseClasses: string = "h-5 w-5 inline-flex self-center"
const svgParams = {
  xmlns: "http://www.w3.org/2000/svg",
  fill: "none",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  stroke: "currentColor",
  strokeLinecap: "round",
  strokeLinejoin: "round",
}

// Manipulation
const UploadIcon = (props: any) => {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 20 16"
      aria-hidden="true" fill="none" strokeWidth="2"
      strokeLinejoin="round" strokeLinecap="round" stroke="currentColor" >
      <path d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
    </svg>
  )
}

const DownloadIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
    </svg>
  )
}

const TrashHeroIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  )
}

const CloseIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M6 18 18 6M6 6l12 12" />
    </svg>
  )
}

const EditIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M 43.125 2 C 41.878906 2 40.636719 2.488281 39.6875 3.4375 L 38.875 4.25 L 45.75 11.125 C 45.746094 11.128906 46.5625 10.3125 46.5625 10.3125 C 48.464844 8.410156 48.460938 5.335938 46.5625 3.4375 C 45.609375 2.488281 44.371094 2 43.125 2 Z M 37.34375 6.03125 C 37.117188 6.0625 36.90625 6.175781 36.75 6.34375 L 4.3125 38.8125 C 4.183594 38.929688 4.085938 39.082031 4.03125 39.25 L 2.03125 46.75 C 1.941406 47.09375 2.042969 47.457031 2.292969 47.707031 C 2.542969 47.957031 2.90625 48.058594 3.25 47.96875 L 10.75 45.96875 C 10.917969 45.914063 11.070313 45.816406 11.1875 45.6875 L 43.65625 13.25 C 44.054688 12.863281 44.058594 12.226563 43.671875 11.828125 C 43.285156 11.429688 42.648438 11.425781 42.25 11.8125 L 9.96875 44.09375 L 5.90625 40.03125 L 38.1875 7.75 C 38.488281 7.460938 38.578125 7.011719 38.410156 6.628906 C 38.242188 6.246094 37.855469 6.007813 37.4375 6.03125 C 37.40625 6.03125 37.375 6.03125 37.34375 6.03125 Z"></path>
    </svg>
  )
}

const PaintbrushIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M18.37 2.63 14 7l-1.59-1.59a2 2 0 0 0-2.82 0L8 7l9 9 1.59-1.59a2 2 0 0 0 0-2.82L17 10l4.37-4.37a2.12 2.12 0 1 0-3-3Z" />
      <path d="M9 8c-2 3-4 3.5-7 4l8 10c2-1 6-5 6-7" />
      <path d="M14.5 17.5 4.5 15" />
    </svg>
  )
}

const ChevronLeftArrowIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M15.75 19.5 8.25 12l7.5-7.5" />
    </svg>
  )
}
const ChevronRightArrowIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="m8.25 4.5 7.5 7.5-7.5 7.5" />
    </svg>
  )
}
const ChevronUpArrowIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
  )
}
const ChevronDownArrowIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
  )
}

const FatArrowIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
  )
}

const ArrowLongIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3" />
    </svg>

  )
}

// Information
const TextDocumentIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
    </svg>
  )
}


const DoubleBubbleIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
    </svg>
  )
}

const PencilIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
    </svg>
  )
}

const ExportIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  )
}

const EyeSlashIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  )
}

const ChatBubbleIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    </svg>
  )
}

const PhotoIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  )
}

const InternetGlobeIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M12 21a9.004 9.004 0 0 0 8.716-6.747M12 21a9.004 9.004 0 0 1-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 0 1 7.843 4.582M12 3a8.997 8.997 0 0 0-7.843 4.582m15.686 0A11.953 11.953 0 0 1 12 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0 1 21 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0 1 12 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 0 1 3 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  )
}

const TextBarsIcon = (props: any) => {
  return (
    <svg {...svgParams} {...props} className={cn(baseClasses, props.className)} >
      <path d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
    </svg>

  )
}

export { UploadIcon, DownloadIcon, TextDocumentIcon, DoubleBubbleIcon, ChevronLeftArrowIcon, ChevronRightArrowIcon, ChevronUpArrowIcon, ChevronDownArrowIcon, FatArrowIcon, ArrowLongIcon, TrashHeroIcon, CloseIcon, EditIcon, PaintbrushIcon, PencilIcon, ExportIcon, EyeSlashIcon, ChatBubbleIcon, PhotoIcon, InternetGlobeIcon, TextBarsIcon }