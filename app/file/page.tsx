"use client";

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

const SuspenseNode = () => {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <FileViewer />
        </Suspense>
    );
}

const FileViewer: React.FC = () => {
    const searchParams = useSearchParams();
    const type = searchParams.get('type');
    const filename = searchParams.get('filename');
    const [fileUrl, setFileUrl] = useState<string | null>(null);


    useEffect(() => {
        if (filename) {
            const fetchFileUrl = async () => {
                try {
                    const response = await fetch(`/api/files?type=${type}&filename=${encodeURIComponent(filename)}`);
                    if (!response.ok) {
                        throw new Error('File not found');
                    }
                    const blob = await response.blob();
                    const url = URL.createObjectURL(blob);
                    setFileUrl(url);
                } catch (error) {
                    console.error('Error fetching file:', error);
                }
            };
            fetchFileUrl();
        }
    }, [type, filename]);

    if (!fileUrl) {
        return <p>Loading...</p>;
    }

    return (
        <>
            <iframe
                src={fileUrl}
                width="100%"
                height="600px"
                style={{ border: 'none' }}
                title="File Viewer"
            ></iframe>
        </>
    );
};

export default SuspenseNode;