import { useEffect, useState } from "react";
import api from "../api/axios";

function ImageViewer({ imagePath, onClose }) {
  if (!imagePath) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center" onClick={onClose}>
      <div className="relative max-w-[90vw] max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <img 
          src={imagePath} 
          alt="Receipt" 
          className="max-w-full max-h-[90vh] object-contain rounded-lg"
          onClick={e => e.stopPropagation()} 
        />
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  icon,
  color,
  onClick,
  isClickable = false,
  type,
}) {
  return (
    <div
      className={`card transition-all duration-200 ${
        isClickable
          ? "cursor-pointer hover:shadow-lg hover:scale-105 active:scale-95"
          : ""
      }`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm text-slate-500">{label}</div>
          <div className="text-2xl font-bold mt-1">
            {typeof value === "number"
              ? `₹ ${value?.toLocaleString?.() || value}`
              : value}
          </div>
        </div>
        {icon && (
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

function DetailModal({ isOpen, onClose, title, data, loading, error, type }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const downloadMemberPDF = async (member) => {
    try {
      const response = await api.get(`/members/${member._id}/pdf`, {
        responseType: "blob",
      });

      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `membership-certificate-${member.name}-${member._id}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Failed to download PDF. Please try again.");
    }
  };

  if (!isOpen) return null;

  // Filter data based on search term
  const filteredData =
    data?.filter((item) => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();

      switch (type) {
        case "donations":
          return (
            item.donorName?.toLowerCase().includes(searchLower) ||
            item.purpose?.toLowerCase().includes(searchLower) ||
            item.donorEmail?.toLowerCase().includes(searchLower) ||
            item.donorPhone?.includes(searchTerm)
          );
        case "members":
        case "membersfund":
          return (
            item.name?.toLowerCase().includes(searchLower) ||
            item.email?.toLowerCase().includes(searchLower) ||
            item.phone?.includes(searchTerm) ||
            item.address?.toLowerCase().includes(searchLower) ||
            item.membershipType?.toLowerCase().includes(searchLower)
          );
        case "expenses":
          return (
            item.description?.toLowerCase().includes(searchLower) ||
            item.category?.toLowerCase().includes(searchLower) ||
            item.vendor?.toLowerCase().includes(searchLower) ||
            item.location?.toLowerCase().includes(searchLower) ||
            item.notes?.toLowerCase().includes(searchLower)
          );
        default:
          return true;
      }
    }) || [];

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getItemIcon = (itemType) => {
    switch (itemType) {
      case "donation":
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
        );
      case "member":
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
              />
            </svg>
          </div>
        );
      case "expense":
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg
              className="w-5 h-5 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
              />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end">
      <div className="bg-white w-full rounded-t-3xl p-6 animate-slide-up max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-center mb-4">
          <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
        </div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            {data && data.length > 0 && (
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-500">
                  {filteredData.length} of {data.length}{" "}
                  {type === "donations"
                    ? "donations"
                    : type === "members"
                    ? "members"
                    : type === "membersfund"
                    ? "members"
                    : "expenses"}
                </span>
                <span
                  className={`text-sm font-medium ${
                    type === "expenses" ? "text-red-600" : "text-green-600"
                  }`}
                >
                  Total: {type === "expenses" ? "-" : "+"}₹
                  {filteredData
                    .reduce(
                      (sum, item) => sum + (item.amount || item.membershipFee),
                      0
                    )
                    .toLocaleString()}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Search Input */}
        {data && data.length > 0 && (
          <div className="mb-4">
            <div className="relative">
              <input
                type="text"
                placeholder={`Search ${
                  type === "donations"
                    ? "donations"
                    : type === "members"
                    ? "members"
                    : type === "membersfund"
                    ? "members"
                    : "expenses"
                }...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
              <svg
                className="absolute left-3 top-2.5 w-4 h-4 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-8 text-gray-500">Loading...</div>
          )}
          {error && (
            <div className="text-center py-8 text-red-600">{error}</div>
          )}
          {filteredData.length === 0 && !loading && !error && (
            <div className="text-center py-8 text-gray-500">
              {searchTerm
                ? `No ${type} found matching "${searchTerm}"`
                : `No ${type} found`}
            </div>
          )}

          <div className="space-y-3">
            {filteredData?.map((item, index) => (
              <div key={item._id || index} style = {{backgroundColor:!item.category ? item.paymentVerified ? "#00ff8926" : "#ff000026": 'transparent'}} className="card">
                <div className="flex items-start space-x-3">
                  {getItemIcon(type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {type === "donation"
                          ? item.donorName
                          : type === "member"
                          ? item.name
                          : item.description}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {formatDate(item.createdAt)}
                      </span>
                    </div>

                    {/* Donation Details */}
                    {type === "donations" && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Donor Name:</span>
                          {item.donorName || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Purpose:</span>
                          {item.purpose || "General donation"}
                        </p>
                        {item.donorEmail && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Email:</span>
                            {item.donorEmail}
                          </p>
                        )}
                        {item.donorPhone && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span>
                            {item.donorPhone}
                          </p>
                        )}
                        {item.paymentMethod && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Payment:</span>
                            {item.paymentMethod}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Donation Amount:</span> ₹
                          {item.amount?.toLocaleString() || 0}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Payment Verified:</span> {item.paymentVerified ? 'Yes' : 'No'}
                        </p>
                        {item.receivedBy && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Received By:</span> {item.receivedBy}
                          </p>
                        )}
                        {item.addedBy && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Added By:</span> {item.addedBy}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Member Details */}
                    {(type === "members" || type === "membersfund") && (
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Member Name:</span>{" "}
                          {item.name}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Email:</span>{" "}
                          {item.email}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span>{" "}
                          {item.phone}
                        </p>
                        {item.address && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Address:</span>{" "}
                            {item.address}
                          </p>
                        )}
                        {item.membershipType && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">
                              Membership Type:
                            </span>{" "}
                            {item.membershipType}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Paid Amount:</span> ₹
                          {item.membershipFee?.toLocaleString() || 0}
                        </p>
                      </div>
                    )}

                    {/* Expense Details */}
                    {type === "expenses" && (
                      <div className="mt-2 space-y-1 flex items-start gap-4">
                        <div className="flex-1">
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Description:</span>{" "}
                            {item.note}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">By:</span>{" "}
                            {item.by}
                          </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Category:</span>{" "}
                          {item.category || "General expense"}
                        </p>
                        {item.vendor && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Where:</span>{" "}
                            {item.vendor}
                          </p>
                        )}
                        {item.location && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Location:</span>{" "}
                            {item.location}
                          </p>
                        )}
                        {item.paymentMethod && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Payment Method:</span>{" "}
                            {item.paymentMethod}
                          </p>
                        )}
                        {item.receiptNumber && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Receipt Number:</span>{" "}
                            {item.receiptNumber}
                          </p>
                        )}
                        {item.notes && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Notes:</span>{" "}
                            {item.notes}
                          </p>
                        )}
                        <p className="text-sm text-red-600">
                          <span className="font-medium">Expense Amount:</span> ₹
                          {item.amount?.toLocaleString() || 0}
                        </p>
                        </div>
                        {item.receiptImagePath && (
                          <div 
                            className="w-20 h-20 flex-shrink-0 rounded-full shadow-mg hover:shadow-xl transform hover:scale-105 transition-all duration-200 cursor-pointer border-2 border-white overflow-hidden"
                            onClick={() => setSelectedImage(item.receiptImagePath)}
                            style={{
                              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                            }}
                          >
                            <img 
                              src={item.receiptImagePath} 
                              alt="Receipt thumbnail" 
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                    )}
                    {selectedImage && <ImageViewer imagePath={selectedImage} onClose={() => setSelectedImage(null)} />}

                    <div className="flex items-center justify-between mt-3">
                      {/* <div
                        className={`text-lg font-bold ${
                          type === "expense" ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {type === "expense" ? "-" : "+"}₹
                        {item.amount?.toLocaleString()}
                      </div> */}

                      {/* PDF Download Button for Members */}
                      {type === "members" && (
                        <button
                          onClick={() => downloadMemberPDF(item)}
                          className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                          <svg
                            className="w-4 h-4"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          <span>Download Certificate</span>
                        </button>
                      )}
                      {type === 'donations' && localStorage.getItem('role') === 'accountant' && !item.paymentVerified && (
                        <button className="flex items-center space-x-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors text-sm" onClick={async()=>{ await api.post(`/donations/${item._id}/verify`); const { data } = await api.get('/donations/pending'); setModalData(data.donations || []); }}>
                          <span>Verify Payment</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [modalType, setModalType] = useState("");
  
  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get("/stats/summary");
        if (data.ok) setSummary(data);
      } catch (e) {
        setError(e.response?.data?.message || e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fetchModalData = async (type) => {
    setModalLoading(true);
    setModalError("");
    setModalType(type);

    try {
      // Handle special case for membersfund endpoint
  // special endpoints
  let endpoint = '';
  if (type === 'membersfund') endpoint = '/membersfund';
  else if (type === 'pending') endpoint = '/donations/pending';
  else if (type === 'memberrequests') endpoint = '/members/requests';
  else endpoint = `/${type}`;
  const { data } = await api.get(endpoint);

      if (data.ok) {
        // Handle different response structures
        let responseData = [];
        if (type === "membersfund") {
          responseData = data.members || data.membersfund || [];
        } else {
          responseData = data[type] || [];
        }

        setModalData(responseData);
        setModalTitle(
          type === "donations"
            ? "All Donations"
            : type === "members"
            ? "All Members"
            : type === "membersfund"
            ? "Members Fund"
            : type === 'pending'
            ? 'Pending Receipts'
            : type === 'memberrequests'
            ? 'Member Requests'
            : "All Expenses"
        );
        setModalOpen(true);
      }
    } catch (e) {
      setModalError(e.response?.data?.message || e.message);
    } finally {
      setModalLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalData([]);
    setModalError("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}

      {/* Loading and Error States */}
      {loading && (
        <div className="card text-center py-8">
          <div className="animate-spin w-8 h-8 border-4 border-sky-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <div className="text-gray-600">Loading dashboard...</div>
        </div>
      )}

      {error && (
        <div className="card text-center py-8 bg-red-50 border border-red-200">
          <div className="text-red-600">{error}</div>
        </div>
      )}

      {/* Stats Grid */}
      {summary && (
        <div className="space-y-6">
          {/* Main Balance Card */}
          <div className="card bg-gradient-to-r from-sky-500 to-sky-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sky-100 text-sm">Available Balance</div>
                <div className="text-3xl font-bold mt-1">
                  ₹ {summary.remaining?.toLocaleString?.() || summary.remaining}
                </div>
              </div>
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Stat
              label="Total Donations"
              value={summary.donations}
              isClickable={true}
              onClick={() => fetchModalData("donations")}
              type="donations"
              icon={
                <svg
                  className="w-6 h-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                  />
                </svg>
              }
              color="bg-green-100"
            />

            <Stat
              label="Membership Amount"
              value={summary.membership}
              isClickable={true}
              onClick={() => fetchModalData("membersfund")}
              icon={
                <svg
                  className="w-6 h-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              }
              color="bg-blue-100"
            />

            <Stat
              label="Total Expenses"
              value={summary.expenses || 0}
              isClickable={true}
              onClick={() => fetchModalData("expenses")}
              type="expenses"
              icon={
                <svg
                  className="w-6 h-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              }
              color="bg-red-100"
            />

            <Stat
              label="Total Members"
              value={summary.membersCount}
              isClickable={true}
              onClick={() => fetchModalData("members")}
              type="members"
              icon={
                <svg
                  className="w-6 h-6 text-purple-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
              color="bg-purple-100"
            />
          </div>

          {/* Quick Actions */}
          <div className="card bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

                            {/* Pending receipts - visible to accountant, president and secretary (approve or verify based on role) */}
              {['accountant','president','secretary'].includes(localStorage.getItem('role')) && (
                <button onClick={()=>window.location.href='/pending-actions'} className="p-4 bg-white rounded-xl border border-gray-200 hover:border-yellow-300 hover:bg-yellow-50 transition-all duration-200 text-left">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                      <svg className="w-5 h-5 text-yellow-600" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3" />
                      </svg>
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Pending Actions</div>
                      <div className="text-sm text-gray-500">View all pending donations & requests</div>
                    </div>
                  </div>
                </button>
              )}
              <button
                onClick={() => fetchModalData("donations")}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-green-300 hover:bg-green-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      View Donations
                    </div>
                    <div className="text-sm text-gray-500">
                      See all donations
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => fetchModalData("members")}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      View Members
                    </div>
                    <div className="text-sm text-gray-500">See all members</div>
                  </div>
                </div>
              </button>



              <button
                onClick={() => fetchModalData("expenses")}
                className="p-4 bg-white rounded-xl border border-gray-200 hover:border-red-300 hover:bg-red-50 transition-all duration-200 text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      View Expenses
                    </div>
                    <div className="text-sm text-gray-500">
                      See all expenses
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <DetailModal
        isOpen={modalOpen}
        onClose={closeModal}
        title={modalTitle}
        data={modalData}
        loading={modalLoading}
        error={modalError}
        type={modalType}
      />
    </div>
  );
}
