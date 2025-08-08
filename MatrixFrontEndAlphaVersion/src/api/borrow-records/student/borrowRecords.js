// Mock data for borrow records
const mockRecords = [
  {
    id: 1,
    student: {
      name: "John Doe",
      rollNumber: "CSE123",
      branch: "CSE",
      year: "2nd"
    },
    book: {
      id: 1,
      title: "Introduction to Algorithms",
      isbn: "9780262033848",
      category: "Textbook",
      location: "Rack 1",
      available: 2
    },
    borrowDate: "2025-05-20",
    dueDate: "2025-06-03",
    returnDate: null,
    status: "Borrowed",
    fine: 0,
    paymentStatus: null,
    paymentMethod: null,
    adminAction: "Issued by Admin on 2025-05-20",
    conditionAtIssue: "New",
    notes: "",
    issuedBy: "Librarian A"
  }
];

export function getBorrowRecords() {
  // Simulate async fetch
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockRecords]), 500);
  });
}

export function updateBorrowRecord(id, updatedRecord) {
  // Simulate async update
  return new Promise((resolve) => {
    setTimeout(() => resolve({ ...updatedRecord, id }), 500);
  });
} 