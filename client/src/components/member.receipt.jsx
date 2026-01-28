import React, { forwardRef } from "react";
import "./pdf.styles.css";
import logo from "../../assets/ujiyala_logo.png";
import hope from "../../assets/hope.png";

// Accept member data as props and ref for PDF
const MemberReceipt = forwardRef(({ member }, ref) => {
  if (!member) return null;
  return (
    <div ref={ref}>
      <meta charSet="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Ujiyala Foundation Membership Receipt</title>

      <div className="receipt-container" id="receiptContent">
        <div className="top-section">
          <div className="logo-section">
            <img src={logo} alt="Ujiyala Foundation Logo" />
          </div>
          <div className="organization-details">
            <h1 className="org-name">UJIYALA FOUNDATION</h1>
            <p className="reg-no">Reg. No: Nashik/0001052/2025</p>
            <div className="org-contact-info">
              <div className="contact-item">
                <span className="contact-icon">📍</span>
                <span>Lonarwadi, Sinnar, Nashik, Maharashtra - 422103</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">📞</span>
                <span>+91 92840 69880 | +91 98234 56789</span>
              </div>
              <div className="contact-item">
                <span className="contact-icon">🌐</span>
                <span
                  style={{ color: "var(--accent-color)", fontWeight: "bold" }}
                >
                  www.ujiyalafoundation.org
                </span>
              </div>
            </div>
          </div>
          <div className="hands-graphic">
            <img src={hope} alt="Empowering Lives" />
          </div>
        </div>

        <div className="header-bar">
          <div className="header-badge">Membership Receipt</div>
        </div>

        <div className="section-box">
          <div className="receipt-info-grid">
            <div>
              <span className="label">MEMBERSHIP NO</span>
              <span className="value accent">
                {member.membershipNo || "N/A"}
              </span>
            </div>
            <div>
              <span className="label">MEMBER TYPE</span>
              <span style={{ textTransform: "uppercase" }} className="value">
                {member.memberType || member.membershipType || "N/A"}
              </span>
            </div>
            <div>
              <span className="label">RECEIPT ID</span>
              <span className="value">MR-{member._id?.slice(-6)}</span>
            </div>
            <div>
              <span className="label">RECEIPT DATE</span>
              <span className="value">
                {new Date(member.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        <div className="section-box">
          <table className="bank-details-table">
            <thead>
              <tr>
                <th className="col-divider">MEMBER DETAILS</th>
                <th>UJIYALA FOUNDATION'S BANK DETAILS</th>
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
                    {member.name}
                  </span>
                </td>
                <td>
                  <span className="details-label">Bank Name:</span>
                  <span className="details-value">HDFC BANK LTD</span>
                </td>
              </tr>
              <tr>
                <td className="col-divider">
                  <span className="details-label">PAN NO</span>
                  <span className="details-value">{member.panNo || "N/A"}</span>
                </td>
                <td>
                  <span className="details-label">Account Number:</span>
                  <span className="details-value">50100219277325</span>
                </td>
              </tr>
              <tr>
                <td className="col-divider">
                  <span className="details-label">CONTACT NO</span>
                  <span className="details-value">{member.phone}</span>
                </td>
                <td>
                  <span className="details-label">IFSC Code:</span>
                  <span className="details-value">HDFC0002791</span>
                </td>
              </tr>
              <tr>
                <td className="col-divider">
                  <span className="details-label">ADDRESS</span>
                  <span className="details-value">{member.address}</span>
                </td>
                <td>
                  <span className="details-label">Branch:</span>
                  <span className="details-value">Nashik Branch</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="section-box">
          <table className="pledge-table">
            <thead>
              <tr>
                <th>Membership Details</th>
                <th>Amount [INR]</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>
                  Membership Fee for {member.memberType || "Foundation Member"}
                </td>
                <td>
                  {(
                    member.membershipAmount ||
                    member.membershipFee ||
                    0
                  ).toFixed(2)}
                </td>
              </tr>
              <tr className="total-row">
                <th>TOTAL AMOUNT RECEIVED</th>
                <th className="amount">
                  {(
                    member.membershipAmount ||
                    member.membershipFee ||
                    0
                  ).toFixed(2)}
                </th>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="info-block">
          Thank you for becoming a member of the{" "}
          <span className="ujiyala-font">Ujiyala Foundation</span>. Your
          contribution supports our vision of empowering lives, serving
          communities, and spreading hope.
        </p>

        <p className="info-block small">
          This is a computer-generated document and requires no physical
          signature.
        </p>
      </div>
    </div>
  );
});

export default MemberReceipt;
