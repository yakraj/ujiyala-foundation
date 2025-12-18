import React from "react";
import "./pdf.styles.css";
import logo from "../../assets/ujiyala_logo.png";
// import logo from '../assets/ujiyala_logo.png';
export default function MemberReceipt() {
  return (
    <>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ujiyala Foundation Donation Receipt</title>
      {/* Load html2canvas for capturing the HTML element */}
      {/* Load jsPDF for creating and downloading the PDF */}

      <div className="receipt-container" id="receiptContent">
        <p className="header-text">
          UJIYALA FOUNDATION | Membership Confirmation Receipt
        </p>
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
            <p>Contact No: +91-9198539853 / 9922555560</p>
          </div>
          <div className="hands-graphic">
            {/* Placeholder for the hands graphic */}
            <img
              src="https://placehold.co/140x90/f5f5f5/2c3e50?text=EMPOWERING%0ALIVES"
              alt="Empowering Lives"
            />
          </div>
        </div>
        <div className="section-box">
          <div className="receipt-info-grid">
            {/* Row 1 */}
            <div>
              <span className="label">MEMBERSHIP NO</span>
              <span className="value accent">PM-001</span>
            </div>
            <div>
              <span className="label">Member Type</span>
              <span className="value">Permanent (Honorary)</span>
            </div>
            {/* Row 2 */}
            <div>
              <span className="label">RECEIPT ID</span>
              <span className="value">R-2025/0042</span>
            </div>
            <div>
              <span className="label">RECEIPT DATE</span>
              <span className="value">31 March 2026</span>
            </div>
          </div>
        </div>
        <div className="section-box">
          <table className="bank-details-table">
            <thead>
              <tr>
                <th className="col-divider">MEMBER DETAILS</th>
                <th>ORGANIZATION BANK DETAILS</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="col-divider">
                  <span className="details-label">NAME</span>
                  <span className="details-value accent">Yakraj Pariyar</span>
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
                  <span className="details-value">77092 94600</span>
                </td>
                <td>
                  <span className="details-label">IFSC Code:</span>
                  <span className="details-value">MAHA0001234</span>
                </td>
              </tr>
              <tr>
                <td className="col-divider" style={{ borderBottom: "none" }}>
                  <span className="details-label">ADDRESS</span>
                  <span className="details-value">Sinnar, Nashik, MH</span>
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
                <th>Membership Fee / Donation Details</th>
                <th style={{ textAlign: "right" }}>Amount [INR]</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Membership Fee (valid until 15 Nov 2029)</td>
                <td style={{ textAlign: "right" }}>5000.00</td>
              </tr>
              <tr className="total-row">
                <th>TOTAL AMOUNT RECEIVED</th>
                <th className="amount">5000.00</th>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="info-block">
          Thank you for becoming a Member of the{" "}
          <span className="ujiyala-font">Ujiyala Foundation</span>. Your
          contribution supports our vision of empowering lives, serving
          communities, and spreading hope.
        </p>
        <p className="info-block">
          All donations are eligible for Tax exemption under the relevant
          sections of the Income Tax Act. Please refer to your Tax Exemption
          Certificate for details.
        </p>
        <div className="footer-section">
          <div className="footer-left">
            {/* Placeholder for the foundation's circular stamp */}
            <div className="stamp">
              <span>
                UJIYALA
                <br />
                FOUNDATION
                <br />
                Reg. No.
                <br />
                MHA/785/
                <br />
                2020/PUNE
              </span>
            </div>
          </div>
          <div className="footer-center">
            <p>Appreciate your Support</p>
            <p style={{ fontSize: "0.7em", marginBottom: 3 }}>Follow us</p>
            <div style={{ display: "flex" }} className="social-icons">
              {/* Placeholders for social media icons */}
              <img
                src="https://placehold.co/28x28/4267B2/ffffff?text=f"
                alt="Facebook"
              />
              <img
                src="https://placehold.co/28x28/1DA1F2/ffffff?text=t"
                alt="Twitter"
              />
              <img
                src="https://placehold.co/28x28/C13584/ffffff?text=i"
                alt="Instagram"
              />
              <img
                src="https://placehold.co/28x28/FF0000/ffffff?text=y"
                alt="YouTube"
              />
            </div>
          </div>
          <div className="footer-right">
            {/* Placeholder for the golden seal/ribbon graphic */}
            <img
              src="https://placehold.co/160x160/f0e68c/2c3e50?text=Ujiyala%0ASeal"
              alt="Ujiyala Seal"
            />
          </div>
        </div>
        <p className="niti-info">
          NITI Aayog Unique ID : MH/2021/0281448 (Placeholder)
        </p>
        <p className="info-block small">
          This is a computer-generated document and requires no physical
          signature.
        </p>
      </div>
      {/* Download Button */}
      <button
        id="downloadButton"
        onclick="downloadReceipt()"
        style={{
          backgroundColor: "var(--accent-color)",
          color: "white",
          padding: "12px 25px",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          fontSize: "1em",
          marginTop: 20,
          boxShadow: "0 4px 6px rgba(255, 82, 13, 0.4)",
          transition: "background-color 0.3s ease",
        }}
      >
        Download Receipt as PDF
      </button>
      <p
        id="message"
        style={{ marginTop: 10, fontSize: "0.9em", color: "gray" }}
      />
    </>
  );
}
