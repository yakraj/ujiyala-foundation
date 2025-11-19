import React, { useState, useRef } from 'react';
import './pdf.styles.css';
import logo from '../../assets/ujiyala_logo.png';
import sign from '../../assets/siig.png';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

export default function MemberCertificate({ memberName = "Yakraj Pariyar", membershipNo = "PM-001", joinDate = "15 Nov 2025", expiryDate = "15 Nov 2029" }) {
  const certificateRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const downloadCertificate = async () => {
    if (!certificateRef.current) return;

    setIsGenerating(true);
    setMessage('Generating PDF... Please wait');
    setMessageType('info');

    try {
      // Convert HTML element to canvas with high quality
      const canvas = await html2canvas(certificateRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;

      // Create PDF with same dimensions as canvas
      const pdf = new jsPDF({
        orientation: imgWidth > imgHeight ? 'landscape' : 'portrait',
        unit: 'px',
        format: [imgWidth, imgHeight],
      });

      // Add image to PDF
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);

      // Save PDF
      pdf.save(`Membership-Certificate-${memberName}.pdf`);

      setMessage('PDF generated successfully!');
      setMessageType('success');

      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 3000);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setMessage('Error generating PDF. Please try again.');
      setMessageType('error');

      setTimeout(() => {
        setMessage('');
        setMessageType('');
      }, 5000);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <div className="calibre" ref={certificateRef} id="calibre_link-0">
    <div className="Logo-and-name">
      <img src={logo} alt="Ujiyala Foundation Logo" className="calibre2" />
      <div>
        <p className="block_">
          <span className="text_1">UJIYALA</span>
          <span className="text_2"> </span>
          <span className="text_3">FOUNDATION</span>
        </p>
        <p className="block_1">lonarwadi, sinnnar, Nashik MH</p>
        <p style={{ color: "#ff520d", fontSize: "0.8rem" }} className="block_1">
          www.ujiyalafoundation.org
        </p>
      </div>
    </div>
    <p className="block_2">&nbsp;</p>
    <p className="block_3">Membership Certificate</p>
    <p className="block_4">This document certifies that</p>
    <p className="block_5">{memberName}</p>
    <p className="block_6">
      has officially become a Permanent Member of the Ujiyala Foundation,
      effective from {joinDate}, under Membership No. {membershipNo}.
    </p>
    <p className="block_6">
      As a member, <b className="calibre3">{memberName}</b> pledges to uphold
      the Foundation's vision of empowering lives, serving communities, and
      spreading hope. This membership remains valid until {expiryDate}.
    </p>
    <div className="sign-area">
      <div className="sign_">
        <img src={sign} alt="Image" className="calibre2" />
        <hr />
        <p>Mariya Amol Chawan</p>
        <p>Secretery</p>
      </div>
      <div className="sign_">
        <img src={sign} alt="Image" className="calibre2" />
        <hr />
        <p>Santosh Dattu Kadam</p>
        <p>President</p>
      </div>
    </div>
    <p className="block_8">&nbsp;</p>
      </div>

      {/* Status Message */}
      {message && (
        <div className={`mt-4 p-4 rounded-lg font-medium ${
          messageType === 'success' ? 'bg-green-100 text-green-700' :
          messageType === 'error' ? 'bg-red-100 text-red-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {message}
        </div>
      )}

      {/* Download Button */}
      <button
        onClick={downloadCertificate}
        disabled={isGenerating}
        className="mt-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl shadow-lg transition duration-200 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-indigo-500 focus:ring-opacity-50"
      >
        {isGenerating ? 'Generating PDF...' : 'Download Certificate as PDF'}
      </button>
    </>
  );
}