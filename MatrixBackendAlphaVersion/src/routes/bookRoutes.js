const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");

// Public routes
router.get("/", bookController.getBooksByQuery); // Updated to handle query parameters
router.get("/test", (req, res) => {
  res.json({ message: "Books route is working", timestamp: new Date().toISOString() });
});
router.get("/id/:id", bookController.fetchBookById); // New route for Book.id lookup
router.get("/isbn/:isbn", bookController.fetchBookByISBN);
router.get("/isnn/:isnn", bookController.fetchJournalByISNN);
router.get("/search/location", bookController.searchBooksWithLocation); // New route for location search

// Protected routes (assuming middleware for auth)
router.post("/", bookController.addBook);
router.put("/:id", bookController.updateBook);
router.delete("/:id", bookController.deleteBook);
router.put("/bulk/status", bookController.bulkUpdateStatus);
router.get("/export", bookController.exportBooks);

module.exports = router;
