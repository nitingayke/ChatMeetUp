import React from 'react';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined'; 

export default function ChatAttachment({ data }) {
    if (!data?.attachments) return null;

    const { video, pdf, image } = data.attachments;

    if (video) {
        return (
            <div className='mt-5 relative'>
                <iframe
                    title={`Video - ${data._id}`}
                    width="100%"
                    height="315"
                    src={video}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
                <a
                    href={`${video}?fl_attachment`}
                    download
                    target='_blank'
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 cursor-pointer bg-[#0000009c] hover:bg-[#00ff3a5c] text-white p-1 rounded-md text-xs"
                >
                    <DownloadOutlinedIcon style={{ fontSize: "1.2rem" }} />
                </a>
            </div>
        );
    }

    if (pdf) {
        return (
            <div className='mt-4'>
                <div className='h-40 overflow-hidden bg-cover rounded mb-2' style={{ filter: "blur(0.8px)", transition: "filter 0.3s" }}>
                    <iframe
                        src={`https://docs.google.com/gview?url=${encodeURIComponent(pdf)}&embedded=true`}
                        width="100%"
                        height="400px"
                        title="PDF Preview"
                        style={{ border: 'none' }}
                    ></iframe>
                </div>
                <div className='flex justify-between items-center'>
                    <p className='text-sm'>Download PDF</p>
                    <a href={`${pdf}?fl_attachment`} target='_blank' download className="text-blue-500 hover:text-blue-700 border-3 rounded-full w-7 h-7 flex justify-center items-center">
                        <DownloadOutlinedIcon style={{ fontSize: '1.2rem' }} />
                    </a>
                </div>
            </div>
        );
    }

    if (image) {
        return (
            <div className='mt-5 relative'>
                <img src={image} alt="attachment" className='w-full rounded-lg' />
                <a
                    href={`${image}?fl_attachment`}
                    download
                    target='_blank'
                    rel="noopener noreferrer"
                    className="absolute bottom-2 right-2 bg-[#0000009c] hover:bg-[#00ff3a5c] text-white p-1 rounded-md text-xs"
                >
                    <DownloadOutlinedIcon style={{ fontSize: "1.2rem" }} />
                </a>
            </div>
        );
    }

    return null;
}
