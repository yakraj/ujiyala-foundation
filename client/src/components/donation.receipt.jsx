import React, { forwardRef } from "react";
import "./pdf.styles.css";
import logo from "../../assets/ujiyala_logo.png";
// Accept donation data as props and ref for PDF
const DonationReceipt = forwardRef(({ donation }, ref) => {
  if (!donation) return null;
  return (
    <div ref={ref}>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ujiyala Foundation Donation Receipt</title>
      {/* Load html2canvas for capturing the HTML element */}
      {/* Load jsPDF for creating and downloading the PDF */}

      <div className="receipt-container" id="receiptContent">
        {/* UPDATED: Only Donation Receipt */}
        <p className="header-text">UJIYALA FOUNDATION | Donation Receipt</p>
        <div className="top-section">
          <div className="logo-section">
            {/* Placeholder for Ujiyala Foundation Logo */}
            <img src={logo} alt="Ujiyala Foundation Logo" />
          </div>
          <div className="organization-details">
            <p className="org-name">UJIYALA FOUNDATION</p>
            {/* Details from your previous HTML */}
            <p>Lonarwadi, Sinnar, Nashik MH</p>
            <p style={{ color: "var(--accent-color)", fontWeight: "bold" }}>
              www.ujiyalafoundation.org
            </p>
            <p>Contact No: +91-9284069880 </p>
          </div>
          <div className="hands-graphic">
            {/* Placeholder for the hands graphic */}
            <img
              width={260}
              src="../../assets/hope.png"
              alt="Empowering Lives"
            />
          </div>
        </div>
        <div className="section-box">
          <div className="receipt-info-grid">
            {/* UPDATED: Donation ID */}
            <div>
              <span className="label">DONATION ID / REF</span>
              <span className="value accent">{donation._id}</span>
            </div>
            {/* UPDATED: Donation Mode/Type */}
            <div>
              <span className="label">DONATION MODE</span>
              <span style={{ textTransform: "uppercase" }} className="value">
                {donation.paymentMethod || donation.method}
              </span>
            </div>
            {/* Row 2 */}
            <div>
              <span className="label">RECEIPT ID</span>
              <span className="value">R-{donation._id?.slice(-6)}</span>
            </div>
            <div>
              <span className="label">RECEIPT DATE</span>
              <span className="value">
                {new Date(donation.date).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
        <div className="section-box">
          <table className="bank-details-table">
            <thead>
              <tr>
                <th className="col-divider">DONOR DETAILS</th>
                <th>ORGANIZATION BANK DETAILS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-divider">
                  <span className="details-label">NAME</span>
                  <span
                    style={{ textTransform: "capitalize" }}
                    className="details-value accent"
                  >
                    {donation.donorName}
                  </span>
                </td>
                <td>
                  <span className="details-label">Bank Name:</span>
                  <span className="details-value">
                    Bank of Maharashtra (or similar)
                  </span>
                </td>
              </tr>
              <tr>
                <td className="col-divider">
                  <span className="details-label">PAN NO</span>
                  <span className="details-value">
                    ABCDE1234F (Placeholder)
                  </span>
                </td>
                <td>
                  <span className="details-label">Account Number:</span>
                  <span className="details-value">9876543210</span>
                </td>
              </tr>
              <tr>
                <td className="col-divider">
                  <span className="details-label">CONTACT NO</span>
                  <span className="details-value">{donation.phone}</span>
                </td>
                <td>
                  <span className="details-label">IFSC Code:</span>
                  <span className="details-value">MAHA0001234</span>
                </td>
              </tr>
              <tr>
                <td className="col-divider" style={{ borderBottom: "none" }}>
                  <span className="details-label">ADDRESS</span>
                  <span className="details-value">
                    {donation.address || "Sinnar, Nashik, MH"}
                  </span>
                </td>
                <td style={{ borderBottom: "none" }}>
                  <span className="details-label">Branch:</span>
                  <span className="details-value">Nashik Branch</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="section-box" style={{ border: "none" }}>
          <table className="pledge-table">
            <thead>
              <tr>
                <th>Donation Details</th>
                <th style={{ textAlign: "right" }}>Amount [INR]</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                {/* UPDATED: Generic Donation Description */}
                <td>{donation.donationType || "General Fund Contribution"}</td>
                <td style={{ textAlign: "right" }}>
                  {donation.amount?.toFixed(2)}
                </td>
              </tr>
              <tr className="total-row">
                <th>TOTAL AMOUNT RECEIVED</th>
                <th className="amount">{donation.amount?.toFixed(2)}</th>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="info-block">
          {/* UPDATED: Text for Donation */}
          Thank you for your generous donation to the{" "}
          <span className="ujiyala-font">Ujiyala Foundation</span>. Your
          contribution supports our vision of empowering lives, serving
          communities, and spreading hope.
        </p>
        {/* <p className="info-block">
      All donations are eligible for Tax exemption under the relevant sections
      of the Income Tax Act. Please refer to your Tax Exemption Certificate for
      details.
    </p> */}

        <p className="info-block small">
          This is a computer-generated document and requires no physical
          signature.
        </p>
      </div>
    </div>
  );
});

export default DonationReceipt;
