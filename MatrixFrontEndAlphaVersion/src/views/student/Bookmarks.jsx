import React, { useState, useEffect } from 'react';
import { MdBookmark, MdBookmarkBorder, MdSearch } from 'react-icons/md';
import { motion } from 'framer-motion';
import { getBooks } from '../../api/borrowApi';

const getUserKey = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user'));
    return user && user.email ? `bookmarks_${user.email}` : 'bookmarks_guest';
  } catch {
    return 'bookmarks_guest';
  }
};

const loadBookmarks = () => {
  const key = getUserKey();
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
};

const saveBookmarks = (bookmarks) => {
  const key = getUserKey();
  localStorage.setItem(key, JSON.stringify(bookmarks));
};

const Bookmarks = () => {
  const [search, setSearch] = useState('');
  const [books, setBooks] = useState([]);
  const [bookmarks, setBookmarks] = useState(loadBookmarks());
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getBooks()
      .then((data) => {
        setBooks(data);
        setLoading(false);
      })
      .catch((err) => {
        setError('Failed to load books.');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    saveBookmarks(bookmarks);
  }, [bookmarks]);

  const filteredBooks = (showAll ? books : books.filter((b) => bookmarks.includes(b.id)))
    .filter(
      (book) =>
        book.title.toLowerCase().includes(search.toLowerCase()) ||
        (book.author || '').toLowerCase().includes(search.toLowerCase())
    );

  const toggleBookmark = (id) => {
    setBookmarks((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <h1 className="text-2xl font-bold text-navy-700 dark:text-white">Bookmarks</h1>
        <div className="flex items-center gap-3">
          <button
            className={`px-4 py-2 rounded-xl font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${showAll ? 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white' : 'bg-blue-600 text-white'}`}
            onClick={() => setShowAll(false)}
            aria-pressed={!showAll}
          >
            My Bookmarks
          </button>
          <button
            className={`px-4 py-2 rounded-xl font-medium shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${showAll ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-navy-700 text-gray-700 dark:text-white'}`}
            onClick={() => setShowAll(true)}
            aria-pressed={showAll}
          >
            All Books
          </button>
        </div>
      </div>
      <div className="mb-6 flex items-center gap-3">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full rounded-xl border border-gray-200 bg-white py-2 pl-10 pr-4 shadow-sm focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:bg-navy-800 dark:text-white dark:border-navy-700"
            placeholder="Search books by title or author..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search books"
          />
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
        </div>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl bg-gray-100 dark:bg-navy-700 h-48" />
            ))
          : filteredBooks.length === 0
          ? <div className="col-span-full text-center text-gray-500 dark:text-gray-400">No books found.</div>
          : filteredBooks.map((book) => (
              <motion.div
                key={book.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="relative rounded-xl bg-white dark:bg-navy-800 shadow-md p-4 flex flex-col gap-2 group hover:shadow-lg transition-shadow"
              >
                <div className="flex-1">
                  <h2 className="font-semibold text-lg text-navy-700 dark:text-white truncate">{book.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{book.author}</p>
                  <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${book.available ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{book.available ? 'Available' : 'Borrowed'}</span>
                </div>
                <button
                  className="absolute top-3 right-3 p-2 rounded-full bg-gray-100 hover:bg-blue-100 dark:bg-navy-700 dark:hover:bg-blue-900 transition-colors"
                  onClick={() => toggleBookmark(book.id)}
                  aria-label={bookmarks.includes(book.id) ? 'Remove Bookmark' : 'Add Bookmark'}
                >
                  {bookmarks.includes(book.id) ? (
                    <MdBookmark className="text-blue-600 text-xl" />
                  ) : (
                    <MdBookmarkBorder className="text-gray-400 text-xl group-hover:text-blue-400" />
                  )}
                </button>
              </motion.div>
            ))}
      </div>
    </div>
  );
};

export default Bookmarks; 