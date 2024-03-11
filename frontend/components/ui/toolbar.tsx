import React, { useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "./button";
import { ChevronArrowIcon } from "./icons";



/**
 * Navbar component
 * 
 * @param {object | any} props Component props
 * @param {boolean} viewAllOptions Viewstate for full or lite toolbar
 * 
 * @param {function} onDiscardClick Discard button callback function
 * @param {function} onExportClick Discard button callback function
 * @param {function} onShareClick Discard button callback function
 * 
 * @returns Toolbar
 */

const Toolbar = (props: any) => {
    const router = useRouter();

    //console.log(props);

    return (
        <header className="flex items-center justify-between p-2 px-4 border-b dark:border-b-gray-600">
            {props.viewAllOptions ? (
                <>
                    <div className="flex items-center space-x-4 dark:text-gray-300">
                        <Button variant="ghost" onClick={() => props.onDiscardClick()}>Discard</Button>
                        <h1 className="text-lg font-semibold">Unsaved map</h1>
                    </div>
                    <div className="flex items-center space-x-4 dark:text-gray-300">
                        <Button variant="ghost">Export map</Button>
                        <Button variant="ghost">Share</Button>
                        <Button variant="ghost">Embed</Button>
                        <Button variant="secondary">Save map</Button>
                    </div>
                </>
            ) : (
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.push("/")}>
                        <div className="flex items-center space-x-2 dark:text-gray-300 hover:text-gray-500">
                            <ChevronArrowIcon className="inline-flex h-4 w-4" left={true} />Back
                        </div>
                    </Button>
                </div>
            )}
        </header>
    );
}

export { Toolbar }
