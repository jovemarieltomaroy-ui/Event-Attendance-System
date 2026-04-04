import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';

const QRScannerComponent = ({ onScanSuccess }) => {
    const scannerRef = useRef(null);

    useEffect(() => {
  
        const scannerId = "reader";
        const startScanner = () => {
            
            if (!scannerRef.current) {
                scannerRef.current = new Html5QrcodeScanner(
                    scannerId,
                    { 
                        fps: 10, 
                        qrbox: { width: 200, height: 200 },
                        aspectRatio: 1.0,
                        rememberLastUsedCamera: true,
                        supportedScanTypes: [0] 
                    },
                    false
                );
                scannerRef.current.render(
                    (decodedText) => {
                        onScanSuccess(decodedText);
                    },
                    (error) => {}
                );
            }
        };
        const timer = setTimeout(startScanner, 500);

        return () => {
            clearTimeout(timer);
            if (scannerRef.current) {
                scannerRef.current.clear().catch(err => {
                    console.error("Cleanup error", err);
                    const el = document.getElementById(scannerId);
                    if (el) el.innerHTML = "";
                });
                scannerRef.current = null;
            }
        };
    }, [onScanSuccess]);

    return (
        <div className="scanner-wrapper" style={{ width: '100%', minHeight: '250px' }}>
            <div id="reader"></div>
        </div>
    );
};

export default QRScannerComponent;