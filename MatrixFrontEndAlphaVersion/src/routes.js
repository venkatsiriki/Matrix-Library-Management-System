import Analytics from './views/admin/analytics';
import Scanner from './views/admin/scanner';
import BookList from './views/admin/books';
import RackManager from './views/admin/racks';
import BorrowHistory from './views/admin/history';
import Forms from './views/admin/forms';
import OverallAnalysis from './views/admin/overallanalysis';
import DigitalLibrary from './views/admin/digital-library';
import SignIn from './views/auth/SignIn';

// Student routes
import StudentDashboard from './views/student';
import StudentHistory from './views/student/history';
import StudentProfile from './views/student/profile';
import StudentFormCenter from './views/student/StudentFormCenter';
import Bookmarks from './views/student/Bookmarks';

import {
  MdAnalytics,
  MdQrCodeScanner,
  MdLibraryBooks,
  MdViewModule,
  MdHistory,
  MdDescription,
  MdAssessment,
  MdMenuBook,
  MdLock,
  MdHome,
  MdBook,
  MdPerson,
  MdAssignment,
  MdBookmark
} from 'react-icons/md';

const routes = [
  // Admin routes
  {
    name: 'Analytics',
    layout: '/admin',
    path: 'analytics',
    icon: <MdAnalytics className="h-6 w-6" />,
    component: Analytics,
  },
  {
    name: 'ID Scanner',
    layout: '/admin',
    path: 'scanner',
    icon: <MdQrCodeScanner className="h-6 w-6" />,
    component: Scanner,
  },
  {
    name: 'Book List',
    layout: '/admin',
    path: 'books',
    icon: <MdLibraryBooks className="h-6 w-6" />,
    component: BookList,
  },
  {
    name: 'Rack Manager',
    layout: '/admin',
    path: 'racks',
    icon: <MdViewModule className="h-6 w-6" />,
    component: RackManager,
  },
  {
    name: 'Borrow History',
    layout: '/admin',
    path: 'history',
    icon: <MdHistory className="h-6 w-6" />,
    component: BorrowHistory,
  },
  {
    name: 'Forms',
    layout: '/admin',
    path: 'forms',
    icon: <MdDescription className="h-6 w-6" />,
    component: Forms,
  },
  {
    name: 'Overall Analysis',
    layout: '/admin',
    path: 'overall-analysis',
    icon: <MdAssessment className="h-6 w-6" />,
    component: OverallAnalysis,
  },
  {
    name: 'Digital Library',
    layout: '/admin',
    path: 'digital-library',
    icon: <MdMenuBook className="h-6 w-6" />,
    component: DigitalLibrary,
  },
  {
    name: 'Sign In',
    layout: '/auth',
    path: 'sign-in',
    icon: <MdLock className="h-6 w-6" />,
    component: SignIn,
  },
  // Student routes
  {
    name: 'Student Dashboard',
    layout: '/student',
    path: 'dashboard',
    icon: <MdHome className="h-6 w-6" />,
    component: StudentDashboard,
  },
  {
    name: 'Borrow History',
    layout: '/student',
    path: 'history',
    icon: <MdHistory className="h-6 w-6" />,
    component: StudentHistory,
  },
  {
    name: 'Library Forms',
    layout: '/student',
    path: 'forms',
    icon: <MdAssignment className="h-6 w-6" />,
    component: StudentFormCenter,
  },
  {
    name: 'Profile',
    layout: '/student',
    path: 'profile',
    icon: <MdPerson className="h-6 w-6" />,
    component: StudentProfile,
  },
  {
    name: 'Bookmarks',
    layout: '/student',
    path: 'bookmarks',
    icon: <MdBookmark className="h-6 w-6" />,
    component: Bookmarks,
  },
];

export default routes;