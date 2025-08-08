import React, { useState } from "react";
import Modal from "../Modal";

const policyContent = {
  privacy: {
    title: "Privacy Policy",
    content: (
      <div>
        <p><strong>Data Collected:</strong> Student name, student ID, borrow history, digital library access logs, fines, and form submissions.</p>
        <p className="mt-2"><strong>Purpose:</strong> To provide a personalized library experience, track borrowed books, manage fines, and improve digital library features.</p>
        <p className="mt-2"><strong>Data Security:</strong> All student data is securely stored in the system and is not shared with third parties.</p>
        <p className="mt-2"><strong>Student Rights:</strong> Students can request data correction or deletion by contacting the library admin.</p>
        <p className="mt-2"><strong>Contact:</strong> matrix@support.com</p>
      </div>
    ),
  },
  terms: {
    title: "Terms of Service",
    content: (
      <div>
        <p><strong>User Responsibilities:</strong></p>
        <ul className="list-disc ml-6">
          <li>Students must scan their valid ID to access system features.</li>
          <li>Books must be returned within the allowed period.</li>
          <li>Fines must be paid in case of overdue books.</li>
        </ul>
        <p className="mt-2"><strong>System Rules:</strong></p>
        <ul className="list-disc ml-6">
          <li>Misuse of digital resources is prohibited.</li>
          <li>Borrowing privileges may be suspended in case of repeated policy violations.</li>
        </ul>
        <p className="mt-2"><strong>Limitations:</strong></p>
        <ul className="list-disc ml-6">
          <li>Matrix is not responsible for third-party PDF links displayed in the system.</li>
          <li>The system may occasionally update these terms.</li>
        </ul>
      </div>
    ),
  },
  cookie: {
    title: "Cookie Policy",
    content: (
      <div>
        <p><strong>Cookies Used:</strong></p>
        <ul className="list-disc ml-6">
          <li>Session cookies to remember logged-in users.</li>
          <li>Cookies to store UI preferences like dark mode.</li>
        </ul>
        <p className="mt-2"><strong>Purpose of Cookies:</strong> To enhance user experience and maintain session security.</p>
        <p className="mt-2"><strong>Note:</strong> No sensitive personal information is stored in cookies.</p>
      </div>
    ),
  },
};

const Footer = () => {
  const [openModal, setOpenModal] = useState(null);

  const handleOpen = (policy) => {
    setOpenModal(policy);
  };
  const handleClose = () => setOpenModal(null);

  return (
    <div className="flex w-full flex-col items-center justify-between px-1 pb-8 pt-3 lg:px-8 xl:flex-row">
      <div>
        <p className="mb-4 text-center text-sm text-gray-600 sm:!mb-0 md:text-base">
          ©{1900 + new Date().getYear()} Matrix. All Rights Reserved.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap md:gap-8 mt-2 xl:mt-0">
        <button
          className="text-base font-medium text-gray-600 hover:underline hover:text-blue-600 transition-colors duration-200 focus:outline-none"
          onClick={() => handleOpen("privacy")}
        >
          Privacy Policy
        </button>
        <button
          className="text-base font-medium text-gray-600 hover:underline hover:text-blue-600 transition-colors duration-200 focus:outline-none"
          onClick={() => handleOpen("terms")}
        >
          Terms of Service
        </button>
        <button
          className="text-base font-medium text-gray-600 hover:underline hover:text-blue-600 transition-colors duration-200 focus:outline-none"
          onClick={() => handleOpen("cookie")}
        >
          Cookie Policy
        </button>
      </div>
      {/* Modal */}
      <Modal
        isOpen={!!openModal}
        onClose={handleClose}
        title={openModal ? policyContent[openModal].title : ""}
      >
        {openModal ? policyContent[openModal].content : null}
      </Modal>
    </div>
  );
};

export default Footer;
