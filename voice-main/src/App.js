import React, { useState, useEffect, useRef } from 'react'; // Added useRef
// REMOVED: import Papa from 'papaparse'; 
import {
  LayoutDashboard,
  Users,
  History,
  Settings,
  HelpCircle,
  LogOut,
  Bell,
  ChevronDown,
  Search,
  RefreshCw,
  ArrowLeft,
  ArrowRight,
  Filter,
  Download,
  MoreVertical,
  Trash2,
  Eye,
  X, // Added close icon
  User, // Added for Customer Info icon
  Phone, // Added for Call Info icon
  FileText, // Added for Summary icon
  PlayCircle, // Added for Recording icon
} from 'lucide-react';

/*
================================================================================
Sidebar Component
================================================================================
*/
function Sidebar() {
  // Define menu items
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, active: false },
    { name: 'Leads', icon: Users, active: false },
    { name: 'Call History', icon: History, active: true },
  ];

  // Define general items
  const generalItems = [
    { name: 'Settings', icon: Settings, active: false },
    { name: 'Help', icon: HelpCircle, active: false },
    { name: 'Sign out', icon: LogOut, active: false },
  ];

  // Re-usable NavItem component (now uses <button>)
  const NavItem = ({ item }) => (
    <button
      type="button"
      className={`flex items-center w-full text-left space-x-3 px-4 py-3 rounded-lg font-medium transition-colors
        ${item.active
          ? 'bg-green-700 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
        }`}
    >
      <item.icon className="w-5 h-5" />
      <span>{item.name}</span>
    </button>
  );

  return (
    <div className="w-64 bg-gray-900 text-white h-screen p-6 flex flex-col fixed">
      <div className="text-3xl font-bold text-white mb-10 ml-3">LEADZEN.AI</div>
      <nav className="flex-1 space-y-2">
        <span className="text-gray-500 text-sm font-semibold uppercase px-4">
          Main Menu
        </span>
        {menuItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>
      <nav className="space-y-2">
        <span className="text-gray-500 text-sm font-semibold uppercase px-4">
          General
        </span>
        {generalItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}
      </nav>
    </div>
  );
}

/*
================================================================================
Header Component
================================================================================
*/
function Header() {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Call History</h1>
        <p className="text-gray-500">Manage and analyze your call records</p>
      </div>
      <div className="flex items-center space-x-6">
        <button className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
          <RefreshCw className="w-5 h-5" />
          <span>Refresh</span>
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <Bell className="w-6 h-6" />
        </button>
        <button className="text-gray-600 hover:text-gray-900">
          <Settings className="w-6 h-6" />
        </button>
        <div className="flex items-center space-x-3">
          <img
            src="https://placehold.co/40x40/E2E8F0/4A5568?text=TC"
            alt="User avatar"
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                'https://placehold.co/40x40/E2E8F0/4A5568?text=TC';
            }}
          />
          <div className="text-sm">
            <div className="font-semibold text-gray-800">Tishaa Chandwani</div>
            <div className="text-gray-500">tishaachandwani@gmail.com</div>
          </div>
          <ChevronDown className="w-5 h-5 text-gray-500" />
        </div>
      </div>
    </header>
  );
}

/*
================================================================================
NEW: Call Details Modal Component - Redesigned UI
================================================================================
*/
function CallDetailsModal({ call, onClose }) {
  const [currentTime, setCurrentTime] = useState(0);
  const audioRef = useRef(null);
  const transcriptContainerRef = useRef(null); // Ref for the scrollable div
  const highlightedWordRef = useRef(null); // Ref for the currently active word

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  // This effect runs when currentTime changes, and scrolls the container
  useEffect(() => {
    if (highlightedWordRef.current) {
      highlightedWordRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest', // Scrolls just enough to bring it into view
      });
    }
  }, [currentTime]); // Dependency: re-run when currentTime updates

  // Helper function for formatting duration
  const formatDuration = (ms) => {
    if (ms === undefined || ms === null) return 'N/A';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    if (minutes > 0 && seconds > 0) {
      return `${minutes} min ${seconds} sec`;
    } else if (minutes > 0) {
      return `${minutes} min`;
    } else {
      return `${seconds} sec`;
    }
  };

  // Helper for date
  const formatDateForModal = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }); // e.g., July 10, 2025
    } catch (e) {
      return 'Invalid Date';
    }
  };

  // Helper for time
  const formatTimeForModal = (timestamp) => {
    if (!timestamp) return 'N/A';
    try {
      return new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }); // e.g., 2:55 PM
    } catch (e) {
      return 'Invalid Time';
    }
  };

  // Extract data (using helpers defined outside/passed in where needed)
  const customerName = getCustomerName(call);
  const phoneNumber = getPhoneNumber(call);
  let email = call.email_id || call.email || 'N/A';
  if (email === 'N/A' && call.transcript) {
    const emailMatch = call.transcript.match(/Email: ([\w.-]+@[\w.-]+\.\w+)/i);
    if (emailMatch && emailMatch[1]) {
      email = emailMatch[1];
    }
  }
  const callDate = formatDateForModal(call.start_timestamp);
  const callTime = formatTimeForModal(call.start_timestamp);
  const callDuration = formatDuration(call.duration_ms);


  // This function will render the interactive transcript
  const renderTranscript = () => {
    if (!call.transcript_object || call.transcript_object.length === 0) {
      return <p className="text-sm text-gray-500">No transcript available.</p>;
    }

    return (
      <div
        ref={transcriptContainerRef} // Assign the container ref
        className="text-sm text-gray-700 bg-white p-4 rounded-md border border-gray-200 whitespace-pre-wrap overflow-y-auto max-h-[calc(90vh-500px)] min-h-[150px]" // Adjusted height
      >
        {call.transcript_object.map((entry, entryIndex) => (
          <div key={entryIndex} className="mb-3">
            <span className={`font-semibold ${entry.role === 'agent' ? 'text-blue-600' : 'text-green-700'}`}>
              {entry.role === 'agent' ? 'AI' : customerName === 'Unknown User' ? 'User' : customerName}: {/* Use parsed name */}
            </span>
            <p className="inline text-gray-800">
              {entry.words.map((word, wordIndex) => {
                const isHighlighted = currentTime >= word.start && currentTime <= word.end;
                return (
                  <span
                    key={wordIndex}
                    ref={isHighlighted ? highlightedWordRef : null}
                    className={`transition-colors duration-150 ${isHighlighted ? 'bg-yellow-200' : 'bg-transparent'}`}
                  >
                    {word.word}
                  </span>
                );
              })}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    // Overlay
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center p-4" // Added padding
      onClick={onClose}
    >
      {/* Modal Panel */}
      <div
        className="bg-gray-100 rounded-lg shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col" // Changed bg, width
        onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center p-4 bg-white rounded-t-lg border-b">
          <h2 className="text-lg font-semibold text-gray-800">Call Details</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content - NEW STRUCTURE */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Customer Information */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-lg font-semibold text-gray-700 mb-4">
              <User className="w-5 h-5 mr-2 text-gray-500" />
              Customer Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <label className="block text-xs text-gray-500 uppercase">Name</label>
                <p className="font-medium text-gray-800">{customerName}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase">Contact</label>
                <p className="font-medium text-gray-800">{phoneNumber}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase">Email Id</label>
                <p className="font-medium text-gray-800">{email}</p>
              </div>
              {/* Address field is removed as data is not available */}
            </div>
          </div>

          {/* Call Information */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-lg font-semibold text-gray-700 mb-4">
              <Phone className="w-5 h-5 mr-2 text-gray-500" />
              Call Information
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-3 text-sm">
              <div>
                <label className="block text-xs text-gray-500 uppercase">Date</label>
                <p className="font-medium text-gray-800">{callDate}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase">Time</label>
                <p className="font-medium text-gray-800">{callTime}</p>
              </div>
              <div>
                <label className="block text-xs text-gray-500 uppercase">Duration</label>
                <p className="font-medium text-gray-800">{callDuration}</p>
              </div>
            </div>
          </div>

          {/* Call Summary */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-lg font-semibold text-gray-700 mb-3">
              <FileText className="w-5 h-5 mr-2 text-gray-500" />
              Call Summary
            </div>
            <p className="text-sm text-gray-700">
              {call.call_analysis?.call_summary || 'N/A'}
            </p>
          </div>

          {/* Call Recording & Transcript */}
          <div className="bg-white p-5 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center text-lg font-semibold text-gray-700 mb-4">
              <PlayCircle className="w-5 h-5 mr-2 text-gray-500" />
              Call Recording
            </div>
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              controls
              className="w-full h-11 mb-4" // Reduced height slightly
            >
              <source src={call.recording_url} type="audio/wav" />
              Your browser does not support the audio element.
            </audio>
            {renderTranscript()}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-white border-t rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}


/*
================================================================================
Call Table Row Component
================================================================================
*/
// --- Helper functions are now defined globally or passed down ---
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  try {
    return new Date(timestamp).toLocaleDateString('en-CA'); // YYYY-MM-DD
  } catch (e) {
    return 'Invalid Date';
  }
};

const formatDuration = (ms) => {
  if (ms === undefined || ms === null) return 'N/A';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes > 0 && seconds > 0) {
    return `${minutes} min ${seconds} sec`;
  } else if (minutes > 0) {
    return `${minutes} min`;
  } else {
    return `${seconds} sec`;
  }
};

// --- This function is needed here for filtering ---
const getCustomerName = (call) => {
  let customerName = call.customer_name || 'N/A';
  if (customerName === 'N/A' && call.call_analysis?.call_summary) {
    const nameMatch = call.call_analysis.call_summary.match(/user, (\w+),/i);
    if (nameMatch && nameMatch[1]) {
      customerName = nameMatch[1];
    } else {
      // Try extracting from transcript if summary fails
      const transcriptNameMatch = call.transcript?.match(/my name is (\w+)/i);
      if (transcriptNameMatch && transcriptNameMatch[1]) {
        customerName = transcriptNameMatch[1];
      } else {
        customerName = "Unknown User";
      }
    }
  } else if (customerName === 'N/A') {
    const transcriptNameMatch = call.transcript?.match(/my name is (\w+)/i);
    if (transcriptNameMatch && transcriptNameMatch[1]) {
      customerName = transcriptNameMatch[1];
    } else {
      customerName = "Unknown User";
    }
  }
  return customerName;
};

// --- This function is needed here for filtering ---
const getPhoneNumber = (call) => {
  let phoneNumber = call.phone_number || 'N/A';
  if (phoneNumber === 'N/A' && call.call_type === 'web_call') {
    phoneNumber = 'Web Call';
  } else if (phoneNumber === 'N/A' && call.transcript) {
    // Try extracting from transcript text, like "Contact Number: 8306..."
    const phoneMatch = call.transcript.match(/Contact Number: (\d[\d\s-]*\d)/i);
    if (phoneMatch && phoneMatch[1]) {
      phoneNumber = phoneMatch[1].replace(/\s|-/g, ''); // Clean up spaces/dashes
    }
  }
  return phoneNumber;
};


function CallTableRow({ call, onViewCall }) { // Added onViewCall prop

  const getSummary = (analysis) => {
    return analysis?.call_summary || 'No summary available';
  };

  // --- Data Extraction (Using real API data, no placeholders) ---
  const customerName = getCustomerName(call); // Use helper
  const phoneNumber = getPhoneNumber(call); // Use helper

  // 3. Email
  let email = call.email_id || call.email || 'N/A';
  if (email === 'N/A' && call.transcript) {
    const emailMatch = call.transcript.match(/Email: ([\w.-]+@[\w.-]+\.\w+)/i);
    if (emailMatch && emailMatch[1]) {
      email = emailMatch[1];
    }
  }

  // 4. Intent
  const intent = call.call_analysis?.user_sentiment || 'N/A';
  const intentStatus = intent === 'Positive' ? 'Enquiry' : 'Service';
  const intentColor = intent === 'Positive' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700';

  // 5. Other Data
  const dateAndTime = formatDate(call.start_timestamp);
  const duration = formatDuration(call.duration_ms); // This will now use the new format
  const summary = getSummary(call.call_analysis);


  return (
    <tr className="hover:bg-gray-50 border-b border-gray-200">
      <td className="px-4 py-3">
        <input type="checkbox" className="rounded border-gray-300" />
      </td>
      <td className="px-4 py-3 text-gray-800 font-medium">{customerName}</td>
      <td className="px-4 py-3 text-gray-600">{phoneNumber}</td>
      <td className="px-4 py-3 text-gray-600">{email}</td>
      <td className="px-4 py-3 text-gray-600">{dateAndTime}</td>
      <td className="px-4 py-3 text-gray-600">{duration}</td>
      <td className="px-4 py-3">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${intentColor}`}
        >
          {intentStatus}
        </span>
      </td>
      <td className="px-4 py-3 text-gray-600 max-w-xs truncate" title={summary}>
        {summary}
      </td>
      <td className="px-4 py-3">
        <div className="flex space-x-2">
          <button className="text-gray-400 hover:text-red-600">
            <Trash2 className="w-4 h-4" />
          </button>
          {/* MODIFIED: Added onClick handler */}
          <button
            onClick={() => onViewCall(call)}
            className="text-gray-400 hover:text-blue-600"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

/*
================================================================================
Call History Table Component
================================================================================
*/
function CallHistoryTable({
  calls, // Now expects filtered calls
  loading,
  error,
  onViewCall,
  searchTerm,
  onSearchChange,
  onDownload, // Added props
  onFilterClick, // Added props
  // ADDED: filter props to use in the message
  filterStartDate,
  filterEndDate
}) {
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Reset page when calls change (due to filtering)
  useEffect(() => {
    setCurrentPage(1);
  }, [calls]);

  // Calculate paginated data based on the filtered calls passed in
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = calls.slice(indexOfFirstItem, indexOfLastItem);

  const totalItems = calls.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="bg-white rounded-lg shadow-md mt-6">
      {/* Table Header */}
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Call Records</h2>
        <div className="flex items-center space-x-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Name/Phone"
              value={searchTerm}
              onChange={onSearchChange} // Use handler from props
              className="pl-10 pr-4 py-2 w-72 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600"
            />
          </div>
          {/* Filter Button */}
          <button
            onClick={onFilterClick} // Use handler from props
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Filter className="w-5 h-5" />
          </button>
          {/* Download Button */}
          <button
            onClick={onDownload} // Use handler from props
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
          >
            <Download className="w-5 h-5" />
          </button>
          <button className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50">
            <MoreVertical className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr className="text-xs text-gray-500 uppercase font-medium">
              <th className="px-4 py-3 w-12">
                <input type="checkbox" className="rounded border-gray-300" />
              </th>
              <th className="px-4 py-3">Customer Name</th>
              <th className="px-4 py-3">Phone Number</th>
              <th className="px-4 py-3">Email Id</th>
              <th className="px-4 py-3">Date & Time</th>
              <th className="px-4 py-3">Duration</th>
              <th className="px-4 py-3">Intent</th>
              <th className="px-4 py-3">Summary</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading && (
              <tr>
                <td colSpan="9" className="text-center py-10">
                  Loading call records...
                </td>
              </tr>
            )}
            {error && (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-10 text-red-600"
                >
                  Failed to load data: {error}
                </td>
              </tr>
            )}
            {!loading && !error && currentItems.length === 0 && (
              <tr>
                <td
                  colSpan="9"
                  className="text-center py-10 text-gray-500"
                >
                  {/* FIX: Use passed filter props */}
                  {totalItems === 0 && searchTerm === '' && filterStartDate === '' && filterEndDate === '' ? 'No call records found.' : 'No results match your criteria.'}
                </td>
              </tr>
            )}
            {!loading && !error && currentItems.map((call) => (
              <CallTableRow key={call.call_id} call={call} onViewCall={onViewCall} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      <div className="p-4 flex justify-between items-center text-sm text-gray-600">
        <div>
          Showing {totalItems > 0 ? indexOfFirstItem + 1 : 0} to{' '}
          {Math.min(indexOfLastItem, totalItems)} of {totalItems} results
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages || totalPages === 0}
            className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-50"
          >
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/*
================================================================================
Filter Popup Component - Improved UI
================================================================================
*/
function FilterPopup({ initialStartDate, initialEndDate, onApply, onClear, onCancel }) {
  const [startDate, setStartDate] = useState(initialStartDate);
  const [endDate, setEndDate] = useState(initialEndDate);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 z-40 flex justify-center items-center p-4"
      onClick={onCancel} // Close on overlay click
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={e => e.stopPropagation()} // Prevent closing when clicking inside
      >
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Filter by Date Range</h3>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <input
              type="date"
              id="startDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <input
              type="date"
              id="endDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-6 mt-4 border-t">
          <button
            onClick={onClear}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            Clear
          </button>
          <button
            onClick={() => onApply(startDate, endDate)}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Apply Filter
          </button>
        </div>
      </div>
    </div>
  );
}

/*
================================================================================
Main App Component
================================================================================
*/
export default function App() {
  const [allCalls, setAllCalls] = useState([]); // Store the original full list
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCall, setSelectedCall] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // State for search input
  const [filterStartDate, setFilterStartDate] = useState(''); // State for date filter start
  const [filterEndDate, setFilterEndDate] = useState(''); // State for date filter end
  const [showFilterPopup, setShowFilterPopup] = useState(false); // State to show/hide filter UI

  useEffect(() => {
    const fetchCalls = async () => {
      try {
        setLoading(true);
        setError(null);
        // CHANGE THIS LINE: Remove the domain, use relative path for Vercel
        const response = await fetch('/api/calls');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        if (Array.isArray(data)) {
          setAllCalls(data); // Store the full list
        } else if (data && Array.isArray(data.calls)) {
          setAllCalls(data.calls);
        } else {
          console.error('API did not return an array:', data);
          setAllCalls([]);
        }
      } catch (e) {
        console.error('Fetch error:', e);
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCalls();
  }, []);

  // --- Filtering Logic ---
  const filteredCalls = React.useMemo(() => {
    return allCalls.filter(call => {
      // Search Term Filter (Name or Phone)
      const lowerSearchTerm = searchTerm.toLowerCase();
      const name = getCustomerName(call).toLowerCase();
      const phone = getPhoneNumber(call).toLowerCase(); // Handles 'Web Call' too
      const matchesSearch = lowerSearchTerm === '' || name.includes(lowerSearchTerm) || phone.includes(lowerSearchTerm);

      // Date Range Filter
      let matchesDate = true;
      if (filterStartDate && filterEndDate) {
        try {
          const callDate = new Date(call.start_timestamp).setHours(0, 0, 0, 0); // Get date part only
          const filterStart = new Date(filterStartDate).setHours(0, 0, 0, 0);
          const filterEnd = new Date(filterEndDate).setHours(0, 0, 0, 0);
          matchesDate = callDate >= filterStart && callDate <= filterEnd;
        } catch (e) { console.error("Error parsing date:", e); matchesDate = true; }
      } else if (filterStartDate) {
        try {
          const callDate = new Date(call.start_timestamp).setHours(0, 0, 0, 0);
          const filterStart = new Date(filterStartDate).setHours(0, 0, 0, 0);
          matchesDate = callDate >= filterStart;
        } catch (e) { matchesDate = true; }
      } else if (filterEndDate) {
        try {
          const callDate = new Date(call.start_timestamp).setHours(0, 0, 0, 0);
          const filterEnd = new Date(filterEndDate).setHours(0, 0, 0, 0);
          matchesDate = callDate <= filterEnd;
        } catch (e) { matchesDate = true; }
      }

      return matchesSearch && matchesDate;
    });
  }, [allCalls, searchTerm, filterStartDate, filterEndDate]); // Use filter state variables

  // --- Handlers ---
  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterApply = (start, end) => {
    setFilterStartDate(start); // Update main app state
    setFilterEndDate(end);
    setShowFilterPopup(false);
  };

  const handleFilterClear = () => {
    setFilterStartDate(''); // Clear main app state
    setFilterEndDate('');
    setShowFilterPopup(false);
  };


  // UPDATED: handleDownload function - Manual CSV generation
  const handleDownload = () => {
    if (filteredCalls.length === 0) {
      console.warn("No data to download.");
      // Consider showing a user-friendly message here instead of just console.warn
      return;
    }

    // Define CSV Headers
    const headers = [
      "Customer Name", "Phone Number", "Email Id", "Date", "Duration",
      "Intent", "Summary", "Call Type", "Status", "Agent",
      "Disconnect Reason", "Recording URL"
    ];

    // Function to escape CSV values (handles commas, quotes, newlines)
    const escapeCsvValue = (value) => {
      if (value === null || value === undefined || value === 'N/A') {
        return ''; // Return empty string for null/undefined/N/A
      }
      const stringValue = String(value);
      // If value contains comma, quote, or newline, wrap in double quotes and escape existing quotes
      if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    };

    // Prepare CSV Rows
    const rows = filteredCalls.map(call => [
      getCustomerName(call),
      getPhoneNumber(call),
      call.email_id || call.email || (call.transcript?.match(/Email: ([\w.-]+@[\w.-]+\.\w+)/i)?.[1] || 'N/A'),
      formatDate(call.start_timestamp),
      formatDuration(call.duration_ms),
      call.call_analysis?.user_sentiment === 'Positive' ? 'Enquiry' : 'Service',
      call.call_analysis?.call_summary || 'N/A',
      call.call_type,
      call.call_status,
      call.agent_name,
      call.disconnection_reason,
      call.recording_url,
    ].map(escapeCsvValue)); // Escape each value in the row

    // Combine headers and rows
    const csvContent = [
      headers.map(escapeCsvValue).join(','), // Header row
      ...rows.map(row => row.join(',')) // Data rows
    ].join('\n'); // Join rows with newline characters

    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'call_history.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the object URL
    }
  };


  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col ml-64">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">
          <CallHistoryTable
            calls={filteredCalls} // Pass filtered calls
            loading={loading}
            error={error}
            onViewCall={setSelectedCall}
            searchTerm={searchTerm}
            onSearchChange={handleSearchChange}
            onDownload={handleDownload} // Pass download handler
            onFilterClick={() => setShowFilterPopup(true)} // Pass filter click handler
            // Pass filter state down
            filterStartDate={filterStartDate}
            filterEndDate={filterEndDate}
          />
        </main>
      </div>

      {/* Render call details modal conditionally */}
      {selectedCall && (
        <CallDetailsModal
          call={selectedCall}
          onClose={() => setSelectedCall(null)}
        />
      )}

      {/* Render filter popup conditionally */}
      {showFilterPopup && (
        <FilterPopup
          initialStartDate={filterStartDate}
          initialEndDate={filterEndDate}
          onApply={handleFilterApply}
          onClear={handleFilterClear}
          onCancel={() => setShowFilterPopup(false)}
        />
      )}
    </div>
  );
}

