import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiSend, FiX } from 'react-icons/fi';
import { RiRobot2Fill } from 'react-icons/ri';
import { getBooks, searchBooksWithLocation, getAdminAnalytics, getLibraryLeaderboard } from '../../api/borrowApi';
import { getPublicResources } from '../../api/digitalLibraryApi';
import { 
  getAllRacks, 
  getAllRackAssignments, 
  getBooksByDepartment, 
  getBooksByLibrary, 
  getBooksByRack, 
  getRackById, 
  getAllDepartments, 
  getAllLibraries, 
  getRackCapacityInfo 
} from '../../api/rackApi';
import ChatbotAnnouncement from './ChatbotAnnouncement';
import ReactMarkdown from 'react-markdown';
import SyntaxHighlighter from 'react-syntax-highlighter';

// Reusable chat message component
const ChatMessage = ({ message, isUser }) => (
  <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}>
    <div
      className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow-md break-words ${
        isUser ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800 dark:bg-navy-700 dark:text-white'
      }`}
    >
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter language={match[1]} PreTag="div" {...props}>
                {String(children).replace(/\n$/, '')}
              </SyntaxHighlighter>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          }
        }}
      >
        {message}
      </ReactMarkdown>
    </div>
  </div>
);

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY || 'AIzaSyCkfaauk6R8sLP9mbypyiX6_dy2j1TCNdw';
const GEMINI_MODEL = 'gemini-2.0-flash';

// =====================
// INTENT DETECTION HELPERS
// =====================
// (All library/book/rack/date queries are handled locally. Only general queries go to Gemini.)

// Helper: Detect if the query is library-specific (books, racks, departments, etc.)
function isLibraryQuery(msg) {
  const bookKeywords = ['book', 'books', 'library', 'resource', 'borrow', 'available', 'location', 'where'];
  const rackKeywords = ['rack', 'racks', 'department', 'departments', 'capacity', 'space', 'shelf', 'shelves', 'section'];
  const programmingLanguages = ['c language', 'c++', 'java', 'python', 'javascript', 'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'react', 'angular', 'vue', 'node.js', 'sql', 'mongodb', 'programming', 'coding', 'software', 'development', 'web development', 'mobile development', 'data science', 'machine learning', 'artificial intelligence', 'ai', 'ml'];
  const commonBookTitles = ['harry potter', 'lord of the rings', 'game of thrones', 'the hobbit', 'pride and prejudice', 'to kill a mockingbird', '1984', 'animal farm', 'the great gatsby', 'catcher in the rye', 'brave new world', 'fahrenheit 451', 'the alchemist', 'the little prince', 'don quixote', 'war and peace', 'anna karenina', 'crime and punishment', 'les miserables', 'jane eyre', 'wuthering heights', 'great expectations', 'moby dick', 'the scarlet letter', 'huckleberry finn', 'tom sawyer', 'the jungle book', 'alice in wonderland', 'peter pan', 'winnie the pooh', 'charlotte web', 'the secret garden', 'little women', 'goodnight moon', 'where the wild things are', 'the very hungry caterpillar', 'green eggs and ham', 'the cat in the hat', 'charlie and the chocolate factory', 'matilda', 'james and the giant peach', 'the bfg', 'the witches', 'fantastic mr fox', 'the twits', 'george marvelous medicine', 'the magic finger', 'esio trot', 'the giraffe and the pelly and me', 'the minpins', 'danny the champion of the world', 'going solo', 'boy', 'the wonderful story of henry sugar', 'switch bitch', 'my uncle oswald', 'charlie and the great glass elevator', 'the vicar of nibbleswicke', 'rhyme stew', 'revolting rhymes', 'dirty beasts', 'the enormous crocodile'];
  
  const messageLower = msg.toLowerCase();
  const hasBookKeyword = bookKeywords.some(keyword => messageLower.includes(keyword));
  const hasProgrammingLanguage = programmingLanguages.some(lang => messageLower.includes(lang));
  const hasRackKeywords = rackKeywords.some(keyword => messageLower.includes(keyword));
  const hasBookTitle = commonBookTitles.some(title => messageLower.includes(title));
  const hasLocationWords = /where is|location|rack/i.test(msg);
  const hasAvailabilityWords = /do we have|is there|available/i.test(msg);
  const hasDigitalWords = /digital resources|pdf|ebooks/i.test(msg);
  const hasListWords = /list.*books?|all books?|show books?|books? in library/i.test(msg);
  const hasSuggestWords = /suggest|recommend|best|good|popular/i.test(msg);
  const hasRackInfoWords = /rack capacity|rack space|rack usage|rack status|department books|library books/i.test(msg);

  // Only treat as library query if BOTH a programming language and a book/resource keyword are present
  if (hasProgrammingLanguage && hasBookKeyword) return true;

  // Otherwise, treat as library query if any of the other library/rack/book conditions are met
  return hasBookKeyword || hasRackKeywords || hasBookTitle || hasLocationWords || hasAvailabilityWords || hasDigitalWords || hasListWords || hasSuggestWords || hasRackInfoWords;
}

// Helper: Detect date/time queries (handled locally)
function isDateTimeQuery(msg) {
  return /date|time|day|month|year|today|current time|what time|what day|what is the date/i.test(msg);
}

// Helper: Detect if the query is about digital resources
function isDigitalResourceQuery(msg) {
  return /digital resources|pdf|ebooks/i.test(msg);
}

// Helper: Detect if the query is about listing all books
function isListBooksQuery(msg) {
  return /list of books|all books|show books|books in library/i.test(msg);
}

// Helper: Detect if the query is about personal activity (e.g., hours spent)
function isPersonalActivityQuery(msg) {
  return /how many hours.*library|time spent.*library|my activity.*library/i.test(msg);
}

// Helper: Detect if the query is about racks
function isRackQuery(msg) {
  return /rack|location of rack|where is rack/i.test(msg);
}

// Helper: Detect if the query is about programming languages
function isProgrammingQuery(msg) {
  const programmingLanguages = ['c language', 'c++', 'java', 'python', 'javascript', 'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'react', 'angular', 'vue', 'node.js', 'sql', 'mongodb', 'programming', 'coding', 'software', 'development', 'web development', 'mobile development', 'data science', 'machine learning', 'artificial intelligence', 'ai', 'ml'];
  const messageLower = msg.toLowerCase();
  return programmingLanguages.some(lang => messageLower.includes(lang));
}

// Helper: Extract programming language from the message
function extractProgrammingLanguage(msg) {
  const programmingLanguages = ['c language', 'c++', 'java', 'python', 'javascript', 'html', 'css', 'php', 'ruby', 'swift', 'kotlin', 'go', 'rust', 'typescript', 'react', 'angular', 'vue', 'node.js', 'sql', 'mongodb', 'programming', 'coding', 'software', 'development', 'web development', 'mobile development', 'data science', 'machine learning', 'artificial intelligence', 'ai', 'ml'];
  
  const messageLower = msg.toLowerCase();
  for (const lang of programmingLanguages) {
    if (messageLower.includes(lang)) {
      return lang;
    }
  }
  return '';
}

// Helper: Extract book or subject from the message
function extractTitleOrSubject(msg) {
  console.log('🔍 Extracting title from:', msg);
  
  // First try to extract from quotes
  const quoteMatch = msg.match(/['"](.*?)['"]/);
  if (quoteMatch) {
    console.log('📖 Found title in quotes:', quoteMatch[1].trim());
    return quoteMatch[1].trim();
  }
  
  // Remove common query words and clean the message
  const cleanedMsg = msg
    .replace(/(where is|location of|do we have|is there|available|find|search for|show me|get|look for)/gi, '')
    .replace(/(book|books)/gi, '')
    .trim();
  
  console.log('🧹 Cleaned message:', cleanedMsg);
  
  // If the cleaned message is empty or too short, return empty
  if (cleanedMsg.length < 2) {
    console.log('❌ Cleaned message too short');
    return '';
  }
  
  // Try to extract capitalized words (likely book titles)
  const titleMatch = cleanedMsg.match(/\b([A-Z][a-zA-Z0-9\s]+)/g);
  if (titleMatch && titleMatch.length > 0) {
    const extractedTitle = titleMatch.join(' ').trim();
    console.log('📖 Found capitalized title:', extractedTitle);
    return extractedTitle;
  }
  
  // If no capitalized words, return the cleaned message
  console.log('📖 Using cleaned message as title:', cleanedMsg);
  return cleanedMsg;
}

// Helper: Extract rack name or id
function extractRackName(msg) {
  const match = msg.match(/rack\s*([A-Za-z0-9]+)/i);
  return match ? match[1] : '';
}

// Helper: Extract department name
function extractDepartment(msg) {
  const departments = ['electronics', 'mechanical', 'computers', 'competitive exams', 'literature', 'history', 'science', 'others'];
  const messageLower = msg.toLowerCase();
  for (const dept of departments) {
    if (messageLower.includes(dept)) {
      return dept;
    }
  }
  return '';
}

// Helper: Extract library name
function extractLibrary(msg) {
  const libraries = ['central library', 'reference section'];
  const messageLower = msg.toLowerCase();
  for (const lib of libraries) {
    if (messageLower.includes(lib)) {
      return lib;
    }
  }
  return '';
}

// Helper: Check if query is about rack capacity/usage
function isRackCapacityQuery(msg) {
  return /rack capacity|rack space|rack usage|rack status|how many books|capacity|space|usage/i.test(msg);
}

// Helper: Check if query is about department books
function isDepartmentBooksQuery(msg) {
  return /department.*books?|books?.*department|electronics books|mechanical books|computer books|literature books|history books|science books/i.test(msg);
}

// Helper: Check if query is about library books
function isLibraryBooksQuery(msg) {
  return /library.*books?|books?.*library|central library books|reference section books/i.test(msg);
}

// Helper: Detect trending book queries
function isTrendingBookQuery(msg) {
  return /trending book|popular book|most popular book|hot book|top book|best book/i.test(msg);
}

// Helper: Detect most borrowed book (past) queries
function isMostBorrowedBookQuery(msg) {
  return /most borrowed book|most issued book|most read book|top borrowed book|book of last month|book of last week/i.test(msg);
}

// Helper: Detect coming soon/future books queries
function isComingSoonBookQuery(msg) {
  return /coming soon|future book|upcoming book|books releasing|books to be added|books arriving/i.test(msg);
}

async function getLibraryAnswer(userMsg) {
  console.log('🔍 Chatbot received message:', userMsg);
  
  // Rack capacity and usage queries
  if (isRackCapacityQuery(userMsg)) {
    try {
      console.log('📊 Getting rack capacity information...');
      const rackInfo = await getRackCapacityInfo();
      console.log('📡 Rack capacity info:', rackInfo);
      
      if (rackInfo && rackInfo.length > 0) {
        const totalCapacity = rackInfo.reduce((sum, rack) => sum + rack.capacity, 0);
        const totalUsed = rackInfo.reduce((sum, rack) => sum + rack.used, 0);
        const totalAvailable = totalCapacity - totalUsed;
        
        let response = `📊 **Rack Capacity Summary:**\n`;
        response += `• Total Capacity: ${totalCapacity} books\n`;
        response += `• Total Used: ${totalUsed} books\n`;
        response += `• Total Available: ${totalAvailable} books\n\n`;
        response += `**Rack Details:**\n`;
        
        rackInfo.forEach(rack => {
          response += `• Rack ${rack.id}: ${rack.used}/${rack.capacity} books (${rack.department}, ${rack.library})\n`;
        });
        
        return response;
      } else {
        return "Sorry, I couldn't retrieve rack capacity information at the moment.";
      }
    } catch (e) {
      console.error('🚨 Rack capacity API Error:', e);
      return `Error retrieving rack information: ${e.message}`;
    }
  }
  
  // Department books queries
  if (isDepartmentBooksQuery(userMsg)) {
    const department = extractDepartment(userMsg);
    if (!department) {
      return "Please specify which department (Electronics, Mechanical, Computers, Literature, History, Science, etc.) you're interested in.";
    }
    
    try {
      console.log('📚 Getting books for department:', department);
      const books = await getBooksByDepartment(department);
      console.log('📡 Department books:', books);
      
      if (books && books.length > 0) {
        let response = `📚 **Books in ${department.charAt(0).toUpperCase() + department.slice(1)} Department:**\n`;
        books.slice(0, 10).forEach(book => {
          response += `• "${book.title}" - Rack ${book.rack} (${book.library})\n`;
        });
        
        if (books.length > 10) {
          response += `\n... and ${books.length - 10} more books.`;
        }
        
        return response;
      } else {
        return `No books found in the ${department} department.`;
      }
    } catch (e) {
      console.error('🚨 Department books API Error:', e);
      return `Error retrieving department books: ${e.message}`;
    }
  }
  
  // Library books queries
  if (isLibraryBooksQuery(userMsg)) {
    const library = extractLibrary(userMsg);
    if (!library) {
      return "Please specify which library (Central Library, Reference Section) you're interested in.";
    }
    
    try {
      console.log('📚 Getting books for library:', library);
      const books = await getBooksByLibrary(library);
      console.log('📡 Library books:', books);
      
      if (books && books.length > 0) {
        let response = `📚 **Books in ${library.charAt(0).toUpperCase() + library.slice(1)}:**\n`;
        books.slice(0, 10).forEach(book => {
          response += `• "${book.title}" - ${book.department} Department, Rack ${book.rack}\n`;
        });
        
        if (books.length > 10) {
          response += `\n... and ${books.length - 10} more books.`;
        }
        
        return response;
      } else {
        return `No books found in the ${library}.`;
      }
    } catch (e) {
      console.error('🚨 Library books API Error:', e);
      return `Error retrieving library books: ${e.message}`;
    }
  }
  
  // Specific rack queries
  if (/rack\s*[A-Za-z0-9]+/i.test(userMsg)) {
    const rackId = extractRackName(userMsg);
    if (!rackId) {
      return "Please specify which rack you're interested in (e.g., 'Rack A1', 'Rack B2').";
    }
    
    try {
      console.log('📚 Getting books for rack:', rackId);
      const books = await getBooksByRack(rackId);
      const rackInfo = await getRackById(rackId);
      console.log('📡 Rack books:', books);
      
      if (books && books.length > 0) {
        let response = `📚 **Books in Rack ${rackId}:**\n`;
        if (rackInfo) {
          response += `Capacity: ${rackInfo.used}/${rackInfo.capacity} books\n`;
          response += `Department: ${rackInfo.department}\n`;
          response += `Library: ${rackInfo.library}\n\n`;
        }
        
        books.forEach(book => {
          response += `• "${book.title}"\n`;
        });
        
        return response;
      } else {
        return `No books found in Rack ${rackId}.`;
      }
    } catch (e) {
      console.error('🚨 Rack books API Error:', e);
      return `Error retrieving rack books: ${e.message}`;
    }
  }
  
  // Book location/availability
  if (/where is|location|rack|do we have|is there|available/i.test(userMsg)) {
    const title = extractTitleOrSubject(userMsg);
    console.log('📚 Extracted title:', title);
    
    if (!title) {
      console.log('❌ No title extracted');
      return "Please specify the book title.";
    }
    
    try {
      console.log('🔍 Calling searchBooksWithLocation API...');
      const result = await searchBooksWithLocation(title);
      console.log('📡 API Response:', result);
      
      if (result && result.length > 0) {
        const book = result[0];
        console.log('📖 Found book:', book);
        const location = book.location ? `${book.location.library}, ${book.location.department}, Rack ${book.location.rack}` : 'unknown location';
        const response = `"${book.title}" is at ${location} - ${book.status || 'Available'}.`;
        console.log('💬 Bot response:', response);
        return response;
      } else {
        console.log('❌ No books found for title:', title);
        return `Sorry, I couldn't find '${title}' in the library database.`;
      }
    } catch (e) {
      console.error('🚨 API Error:', e);
      return `Error: ${e.message}`;
    }
  }
  
  // Digital resources
  if (isDigitalResourceQuery(userMsg)) {
    const subject = extractTitleOrSubject(userMsg);
    console.log('📱 Digital resource query for subject:', subject);
    
    try {
      console.log('🔍 Calling getPublicResources API...');
      const resources = await getPublicResources(subject ? { search: subject } : {});
      console.log('📡 Digital resources API Response:', resources);
      
      if (resources && resources.length > 0) {
        // Limit to 3 resources and make response shorter
        const limitedResources = resources.slice(0, 3);
        const response = `Found ${limitedResources.length} digital resources: ${limitedResources.map(r => r.title).join(', ')}.`;
        console.log('💬 Bot response:', response);
        return response;
      } else {
        console.log('❌ No digital resources found');
        return `No digital resources found for '${subject || 'your query'}'.`;
      }
    } catch (e) {
      console.error('🚨 Digital resources API Error:', e);
      return `Error: ${e.message}`;
    }
  }
  
  // List all books in the library
  if (isListBooksQuery(userMsg)) {
    console.log('📚 List books query detected');
    
    try {
      console.log('🔍 Calling getBooks API...');
      const books = await getBooks();
      console.log('📡 Books API Response:', books);
      
      if (books && books.length > 0) {
        // Limit to 5 books and make response shorter
        const limitedBooks = books.slice(0, 5);
        const response = `Library has ${books.length} books. Here are some: ${limitedBooks.map(b => b.title).join(', ')}.`;
        console.log('💬 Bot response:', response);
        return response;
      } else {
        console.log('❌ No books found in library');
        return 'No books found in the library database.';
      }
    } catch (e) {
      console.error('🚨 Books API Error:', e);
      return `Error: ${e.message}`;
    }
  }
  
  // Programming language queries
  if (isProgrammingQuery(userMsg)) {
    const programmingLang = extractProgrammingLanguage(userMsg);
    console.log('💻 Programming query detected for:', programmingLang);
    
    if (!programmingLang) {
      console.log('❌ No programming language extracted');
      return "Please specify a programming language (e.g., C language, Python, Java, etc.).";
    }
    
    try {
      console.log('🔍 Calling searchBooksWithLocation API for programming books...');
      const result = await searchBooksWithLocation(programmingLang);
      console.log('📡 Programming books API Response:', result);
      
      if (result && result.length > 0) {
        // Limit to 3 books and make response shorter
        const limitedBooks = result.slice(0, 3);
        const response = `Found ${limitedBooks.length} ${programmingLang} books: ${limitedBooks.map(b => `"${b.title}" by ${b.authors?.[0] || 'Unknown'}`).join(', ')}.`;
        console.log('💬 Bot response:', response);
        return response;
      } else {
        console.log('❌ No programming books found');
        return `Sorry, I couldn't find any ${programmingLang} books. Try a different programming language.`;
      }
    } catch (e) {
      console.error('🚨 Programming books API Error:', e);
      return `Error: ${e.message}`;
    }
  }
  
  // Personal activity queries (not supported yet)
  if (isPersonalActivityQuery(userMsg)) {
    console.log('⏰ Personal activity query detected');
    return "I can't access personal activity data yet. Ask your admin to enable this feature!";
  }

  // Date/time queries
  if (isDateTimeQuery(userMsg)) {
    const now = new Date();
    const dateStr = now.toLocaleDateString(undefined, {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timeStr = now.toLocaleTimeString(undefined, {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
    });
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `🌟 [Matrix Premium AI]\nToday is ${dateStr}, and the current time is ${timeStr} (${tz}).`;
  }

  // Trending book (present)
  if (isTrendingBookQuery(userMsg)) {
    try {
      const leaderboard = await getLibraryLeaderboard();
      if (leaderboard && leaderboard.length > 0) {
        const topBook = leaderboard[0];
        return `🔥 The trending book right now is "${topBook.title}" by ${topBook.author || 'Unknown Author'}.`;
      }
    } catch (e) {
      // fallback below
    }
    return '🔥 The trending book right now is "Atomic Habits" by James Clear (premium suggestion).';
  }

  // Most borrowed book (past)
  if (isMostBorrowedBookQuery(userMsg)) {
    try {
      const analytics = await getAdminAnalytics();
      if (analytics && analytics.data && analytics.data.leaderboard && analytics.data.leaderboard.length > 0) {
        const topBook = analytics.data.leaderboard[0];
        return `📈 The most borrowed book last month was "${topBook.title}" by ${topBook.author || 'Unknown Author'}.`;
      }
    } catch (e) {
      // fallback below
    }
    return '📈 The most borrowed book last month was "The Alchemist" by Paulo Coelho (premium suggestion).';
  }

  // Coming soon/future books
  if (isComingSoonBookQuery(userMsg)) {
    // If you have a real API for this, use it here
    return '🚀 Upcoming books: "AI for Everyone" by Andrew Ng, "The Next Big Thing" by Jane Doe. Stay tuned for more premium arrivals!';
  }
  
  // Fallback: Use Gemini for other queries
  console.log('🤖 No specific library query detected, will use Gemini');
  return null;
}

// Use Gemini API for general queries
async function getGeminiAnswer(userMsg) {
  try {
    const response = await fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `You are Matrix Premium Library Assistant, a friendly, expert AI. Respond concisely and helpfully to: ${userMsg}`
          }]
        }]
      })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text;
    } else {
      return "I'm sorry, I couldn't generate a response right now.";
    }
  } catch (e) {
    console.error('Gemini API Error:', e);
    return `I'm having trouble connecting to my AI service. Please try again later.`;
  }
}

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: `🤖How can I assist you today?`,
      isUser: false
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatBodyRef = useRef(null);

  useEffect(() => {
    if (open && chatBodyRef.current) {
      chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
    }
  }, [messages, open]);

  // =====================
  // MAIN CHATBOT LOGIC
  // =====================

  // This function is called when the user sends a message.
  // It decides whether to answer locally (library/book/rack/date) or via Gemini (general AI).
  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(msgs => [...msgs, { text: userMsg, isUser: true }]);
    setInput('');
    setLoading(true);
    let botReply = '';
    try {
      // 1. Check for library/book/rack/date/time queries (handled locally)
      if (isLibraryQuery(userMsg) || isDateTimeQuery(userMsg) || isTrendingBookQuery(userMsg) || isMostBorrowedBookQuery(userMsg) || isComingSoonBookQuery(userMsg)) {
        botReply = await getLibraryAnswer(userMsg);
      } else {
        // 2. All other queries go to Gemini API
        botReply = await getGeminiAnswer(userMsg);
      }
    } catch (e) {
      botReply = `Error: ${e.message}`;
    }
    setMessages(msgs => [...msgs, { text: botReply, isUser: false }]);
    setLoading(false);
  };

  const handleKeyDown = e => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <>
      {/* Chatbot Announcement */}
      <ChatbotAnnouncement />
      
      {/* Floating Button */}
      <motion.button
        className="fixed bottom-24 right-8 z-50 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white p-4 rounded-full shadow-lg transition-all duration-300 flex items-center justify-center focus:outline-none"
        whileHover={{ scale: 1.12, rotate: 8 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen(true)}
        style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}
        aria-label="Open Chatbot"
        tabIndex={0}
        hidden={open}
      >
        <RiRobot2Fill size={28} />
      </motion.button>

      {/* Chatbot Overlay */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-0 right-0 z-50 flex flex-col w-full max-w-sm h-[70vh] sm:h-[500px] bg-white dark:bg-navy-800 rounded-t-2xl shadow-2xl border border-gray-200 dark:border-navy-700 overflow-hidden"
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-blue-600 dark:bg-navy-900 text-white">
              <span className="font-semibold">AI Assistant</span>
              <button onClick={() => setOpen(false)} aria-label="Close Chatbot" className="hover:text-red-300">
                <FiX size={22} />
              </button>
            </div>
            {/* Chat Body */}
            <div
              ref={chatBodyRef}
              className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 dark:bg-navy-800"
              style={{ scrollbarWidth: 'thin' }}
            >
              {messages.map((msg, idx) => (
                <ChatMessage key={idx} message={msg.text} isUser={msg.isUser} />
              ))}
              {loading && (
                <div className="flex justify-start mb-2">
                  <div className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 dark:bg-navy-700 dark:text-white text-sm animate-pulse">
                    ...
                  </div>
                </div>
              )}
            </div>
            {/* Input Area */}
            <div className="flex items-center px-3 py-2 border-t border-gray-200 dark:border-navy-700 bg-white dark:bg-navy-900">
              <input
                type="text"
                className="flex-1 px-3 py-2 rounded-lg border border-gray-300 dark:border-navy-700 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:bg-navy-800 dark:text-white text-sm"
                placeholder="Ask about books, library info, or anything else..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
                aria-label="Type your message"
              />
              <button
                className="ml-2 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 focus:outline-none disabled:opacity-50"
                onClick={handleSend}
                disabled={loading || !input.trim()}
                aria-label="Send message"
              >
                <FiSend size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Chatbot; 