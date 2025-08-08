import React, { useState, useEffect } from 'react';
import { MdBook, MdHistory, MdPerson, MdCalendarToday, MdOutlineWatchLater } from 'react-icons/md';
import { FiAward } from 'react-icons/fi';
import Card from '../../components/card';
import Widget from '../../components/widget/Widget';
import MiniCalendar from '../../components/calendar/MiniCalendar';
import { getStudentAnalytics, getLibraryLeaderboard } from '../../api/borrowApi';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

// Updated badge system based on hours spent
function getBadgeByHours(hours) {
  if (hours >= 100) return "Diamond";
  if (hours >= 75) return "Platinum";
  if (hours >= 50) return "Gold";
  if (hours >= 25) return "Silver";
  if (hours >= 10) return "Bronze";
  return "Beginner";
}

function getBadgeColor(badge) {
  switch (badge) {
    case "Diamond":
      return "text-blue-500";
    case "Platinum":
      return "text-purple-500";
    case "Gold":
      return "text-yellow-500";
    case "Silver":
      return "text-gray-400";
    case "Bronze":
      return "text-orange-500";
    default:
      return "text-gray-600";
  }
}

const LeaderboardTable = ({ data }) => (
  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
    <thead>
      <tr>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Rank</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll No</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Badge</th>
        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Hours</th>
      </tr>
    </thead>
    <tbody className="bg-white dark:bg-navy-800 divide-y divide-gray-200 dark:divide-gray-700">
      {data.map((user, index) => (
        <tr key={index} className={user.isCurrentUser ? "bg-blue-100 dark:bg-blue-900 font-bold" : ""}>
          <td className="px-4 py-2 font-bold">{user.rank}</td>
          <td className="px-4 py-2">{user.name}</td>
          <td className={`px-4 py-2 font-semibold ${getBadgeColor(user.badge)}`}>{user.badge}</td>
          <td className="px-4 py-2">{user.hours}h</td>
        </tr>
      ))}
    </tbody>
  </table>
);

const StudentDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await getStudentAnalytics();
        setAnalytics(data);
        // Fetch leaderboard from backend
        let leaderboardWithBadges = [];
        try {
          const leaderboard = await getLibraryLeaderboard();
          // Get current user's roll number from localStorage
          const user = localStorage.getItem('user');
          let myRoll = '';
          if (user) {
            try { myRoll = JSON.parse(user).rollNumber; } catch {}
          }
          leaderboardWithBadges = leaderboard.map((entry, idx) => {
            const entryRoll = (entry.rollNumber || '').toLowerCase().trim();
            const myRollNorm = (myRoll || '').toLowerCase().trim();
            const isMe = entryRoll === myRollNorm;
            return {
              rank: idx + 1,
              name: isMe ? 'You' : entry.rollNumber || entry.name || 'Unknown',
              badge: getBadgeByHours(entry.totalHours),
              hours: entry.totalHours,
              isCurrentUser: isMe
            };
          });
        } catch (err) {
          toast.error('Failed to fetch leaderboard');
        }
        setLeaderboardData(leaderboardWithBadges);
      } catch (error) {
        console.error('Error fetching analytics:', error);
        toast.error('Failed to fetch analytics');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  // Chart configuration
  const timeSpentData = {
    labels: analytics ? Object.keys(analytics.dailyTimeSpent).map(date => {
      const d = new Date(date);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }) : [],
    datasets: [
      {
        label: 'Time Spent (hours)',
        data: analytics ? Object.values(analytics.dailyTimeSpent).map(mins => +(mins / 60).toFixed(1)) : [],
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgb(75, 192, 192)',
        borderWidth: 1,
        borderRadius: 5,
        maxBarThickness: 50,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            size: 12,
            family: "'DM Sans', sans-serif",
          },
        },
      },
      title: {
        display: true,
        text: 'Your Daily Library Time',
        font: {
          size: 16,
          family: "'DM Sans', sans-serif",
          weight: 'bold',
        },
        padding: 20,
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const hours = context.raw;
            const minutes = Math.round((hours % 1) * 60);
            return `Time: ${Math.floor(hours)}h ${minutes}m`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Hours',
          font: {
            size: 12,
            family: "'DM Sans', sans-serif",
          },
        },
        ticks: {
          callback: (value) => `${value}h`,
          font: {
            size: 11,
          },
        },
        grid: {
          display: true,
          drawBorder: false,
        },
      },
      x: {
        grid: {
          display: false,
          drawBorder: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  // Get personal stats from analytics
  const personalStats = {
    totalTimeSpent: analytics ? {
      hours: Math.floor(analytics.totalTimeSpent / 60),
      minutes: analytics.totalTimeSpent % 60
    } : { hours: 0, minutes: 0 },
    totalVisits: analytics?.totalVisits || 0,
    averageTime: analytics ? {
      hours: Math.floor(analytics.averageTimePerVisit / 60),
      minutes: analytics.averageTimePerVisit % 60
    } : { hours: 0, minutes: 0 },
    mostVisited: analytics?.mostVisitedSection || 'N/A'
  };

  const borrowedBooks = [
    { id: 1, title: "The Great Gatsby", dueDate: "2024-06-10", status: "Active" },
    { id: 2, title: "1984", dueDate: "2024-06-15", status: "Overdue" },
    { id: 3, title: "To Kill a Mockingbird", dueDate: "2024-06-20", status: "Active" },
  ];

  // Determine which leaderboard entries to show
  let leaderboardToShow = leaderboardData;
  const currentUserIndex = leaderboardData.findIndex(u => u.isCurrentUser);
  if (leaderboardData.length > 0) {
    if (currentUserIndex > 4) {
      // Show 5 above + current user
      leaderboardToShow = leaderboardData.slice(Math.max(0, currentUserIndex - 5), currentUserIndex + 1);
    } else {
      // Show top 5
      leaderboardToShow = leaderboardData.slice(0, 5);
    }
  }

  // Find current user's rank in the leaderboard
  const myRank = leaderboardData.find((entry) => entry.isCurrentUser)?.rank || 'N/A';

  return (
    <div>
      <ToastContainer position="top-right" autoClose={2000} />
      
      {/* Card widgets */}
      <div className="mt-3 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
        <Widget
          icon={<MdOutlineWatchLater className="h-6 w-6" />}
          title="Your Total Time"
          subtitle={`${personalStats.totalTimeSpent.hours}h ${personalStats.totalTimeSpent.minutes}m`}
        />
        <Widget
          icon={<MdBook className="h-6 w-6" />}
          title="Your Total Visits"
          subtitle={`${personalStats.totalVisits} visits`}
        />
        <Widget
          icon={<MdHistory className="h-6 w-6" />}
          title="Your Avg. Time/Visit"
          subtitle={`${personalStats.averageTime.hours}h ${personalStats.averageTime.minutes}m`}
        />
        <Widget
          icon={<FiAward className="h-6 w-6" />}
          title="Most Visited Section"
          subtitle={personalStats.mostVisited}
        />
      </div>

      {/* Main content */}
      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
        {/* Time Spent Chart */}
        <Card extra="pb-7 p-[20px]">
          <div className="flex flex-row justify-between">
            <div className="ml-1 pt-2">
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                Your Library Time Analysis
              </h4>
              <p className="mt-2 text-base text-gray-600">
                Track your daily library usage
              </p>
            </div>
          </div>

          <div className="h-[300px] w-full pt-10">
            {loading ? (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <div className="spinner"></div>
                  <p className="mt-2 text-gray-600">Loading your analytics...</p>
                </div>
            </div>
            ) : (
              <Bar data={timeSpentData} options={chartOptions} />
            )}
          </div>
        </Card>

        {/* Updated Leaderboard Section */}
        <Card extra="pb-7 p-[20px]">
          <div className="flex flex-row justify-between items-center mb-4">
            <div className="ml-1 pt-2">
              <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                Library Time Leaderboard
              </h4>
              <p className="mt-2 text-base text-gray-600">
                Top Library Users by Hours Spent
              </p>
            </div>
            {/* My Rank Card */}
            <div className="flex flex-col items-end bg-white dark:bg-navy-800 rounded-lg shadow px-6 py-3 ml-4 border border-gray-200 dark:border-white/10 min-w-[120px]">
              <span className="text-xs text-gray-500 dark:text-gray-400">Library Rank</span>
              <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{myRank}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">Based on time spent</span>
            </div>
          </div>

          <div className="mt-4">
            <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-3">
              {Object.entries({
                "Diamond": "100+ hours",
                "Platinum": "75+ hours",
                "Gold": "50+ hours",
                "Silver": "25+ hours",
                "Bronze": "10+ hours",
                "Beginner": "0-10 hours"
              }).map(([badge, requirement]) => (
                <div key={badge} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-navy-700">
                  <div className={`font-bold ${getBadgeColor(badge)}`}>{badge}</div>
                  <div className="text-xs text-gray-500">{requirement}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="h-full w-full overflow-x-auto">
            <LeaderboardTable data={leaderboardToShow} />
            </div>
          </Card>
      </div>
    </div>
  );
};

// Activity Item Component
const ActivityItem = ({ title, date, icon }) => (
  <div className="flex items-center gap-4 rounded-xl bg-white p-3 shadow-3xl shadow-shadow-500 dark:!bg-navy-700 dark:shadow-none">
    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-lightPrimary dark:!bg-navy-900">
      {icon}
    </div>
    <div>
      <h5 className="text-base font-bold text-navy-700 dark:text-white">
        {title}
      </h5>
      <p className="text-sm text-gray-600">{date}</p>
    </div>
  </div>
);

// Book Card Component
const BookCard = ({ title, author, available }) => (
  <Card extra="!p-4 flex flex-col">
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-lightPrimary p-2 dark:bg-navy-700">
        <MdBook className="h-6 w-6 text-brand-500" />
      </div>
      <div className="flex-grow">
        <h5 className="text-base font-bold text-navy-700 dark:text-white">
          {title}
        </h5>
        <p className="text-sm text-gray-600">{author}</p>
      </div>
    </div>
    <div className={`mt-3 self-end rounded-full px-3 py-1 text-sm ${
      available 
        ? 'bg-green-100 text-green-700' 
        : 'bg-red-100 text-red-700'
    }`}>
      {available ? 'Available' : 'Borrowed'}
    </div>
  </Card>
);

export default StudentDashboard;