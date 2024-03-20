import React, { useEffect } from 'react';
import { Button } from "@/components/ui/button";

interface FormModalProps {
    onClose: () => void;
}

const FormModal: React.FC<FormModalProps> = ({ onClose }) => {

    return (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-blur-md">
            <div className="bg-white shadow-xl rounded-lg overflow-hidden w-full max-w-2xl flex flex-col z-60">
                <div className="p-6 flex-1 flex flex-col gap-2 justify-center">
                    <div style={{ marginTop: '20px', marginBottom: '20px', height: '600px' }}>
                        <iframe width="100%" height="100%" src="https://s.surveyplanet.com/65f998ae75706c97c9b34bd0"></iframe>
                    </div>
                    <Button onClick={onClose} variant={"fancy_blue"}>Close</Button>
                </div>
            </div>
        </div>
    );
}

export default FormModal;