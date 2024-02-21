import React, { useRef, useState } from "react";
import { useRouter } from 'next/navigation';
import { Button } from "../ui/button";


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

export function Toolbar(props: any) {
    const router = useRouter();

    //console.log(props);

    return (
        <header className="flex items-center justify-between p-2 px-4 border-b">
            {props.viewAllOptions ? (
                <>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost" onClick={() => props.onDiscardClick()}>Discard</Button>
                        <h1 className="text-lg font-semibold">Unsaved map</h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Button variant="ghost">Export map</Button>
                        <Button variant="ghost">Share</Button>
                        <Button variant="ghost">Embed</Button>
                        <Button variant="secondary">Save map</Button>
                    </div>
                </>
            ) : (
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" onClick={() => router.push("/")}>⬅ Back</Button>
                </div>
            )}
        </header>
    );
}
