// import React, { useState, useEffect } from "react";
// import { MdTrendingUp, MdPeople, MdMenuBook, MdHistory, MdWarning, MdArrowUpward, MdArrowDownward } from "react-icons/md";
// import { FiAward } from "react-icons/fi";
// import Widget from "components/widget/Widget";
// import Card from "components/card";
// import { getAdminAnalytics } from "../../../api/borrowApi";
// import { ToastContainer, toast } from 'react-toastify';
// import 'react-toastify/dist/ReactToastify.css';
// import Chart from "react-apexcharts";

// // Updated badge system based on hours spent
// function getBadgeByHours(hours) {
//   if (hours >= 100) return { name: "Diamond", style: "bg-blue-500 text-white" };
//   if (hours >= 75) return { name: "Platinum", style: "bg-purple-500 text-white" };
//   if (hours >= 50) return { name: "Gold", style: "bg-yellow-500 text-white" };
//   if (hours >= 25) return { name: "Silver", style: "bg-gray-400 text-white" };
//   if (hours >= 10) return { name: "Bronze", style: "bg-orange-700 text-white" };
//   return { name: "Beginner", style: "bg-gray-600 text-white" };
// }

// const Analytics = () => {
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);
//   const [mockLeaderboard] = useState([
//     { _id: 1, student: { name: "John Doe", rollNumber: "24M11MC123" }, totalHours: 120, totalBorrows: 25 },
//     { _id: 2, student: { name: "Jane Smith", rollNumber: "24M11MC124" }, totalHours: 95, totalBorrows: 20 },
//     { _id: 3, student: { name: "Alice Johnson", rollNumber: "24M11MC125" }, totalHours: 82, totalBorrows: 18 },
//     { _id: 4, student: { name: "Bob Wilson", rollNumber: "24M11MC126" }, totalHours: 75, totalBorrows: 15 },
//     { _id: 5, student: { name: "Charlie Brown", rollNumber: "24M11MC127" }, totalHours: 65, totalBorrows: 14 },
//     { _id: 6, student: { name: "Diana Prince", rollNumber: "24M11MC128" }, totalHours: 55, totalBorrows: 12 },
//     { _id: 7, student: { name: "Edward Stone", rollNumber: "24M11MC129" }, totalHours: 45, totalBorrows: 10 },
//     { _id: 8, student: { name: "Fiona Green", rollNumber: "24M11MC130" }, totalHours: 35, totalBorrows: 8 },
//     { _id: 9, student: { name: "George Martin", rollNumber: "24M11MC131" }, totalHours: 25, totalBorrows: 6 },
//     { _id: 10, student: { name: "Helen Adams", rollNumber: "24M11MC132" }, totalHours: 20, totalBorrows: 5 },
//     { _id: 11, student: { name: "Ian Clark", rollNumber: "24M11MC133" }, totalHours: 15, totalBorrows: 4 },
//     { _id: 12, student: { name: "Julia Davis", rollNumber: "24M11MC134" }, totalHours: 12, totalBorrows: 3 },
//     { _id: 13, student: { name: "Kevin White", rollNumber: "24M11MC135" }, totalHours: 8, totalBorrows: 2 },
//     { _id: 14, student: { name: "Laura Hall", rollNumber: "24M11MC136" }, totalHours: 5, totalBorrows: 1 },
//     { _id: 15, student: { name: "Mike Turner", rollNumber: "24M11MC137" }, totalHours: 3, totalBorrows: 1 }
//   ]);
//   const [data, setData] = useState({
//     totalBooks: 0,
//     totalBooksTrend: 0,
//     activeMembers: 0,
//     activeMembersTrend: 0,
//     booksBorrowed: 0,
//     booksBorrowedTrend: 0,
//     overdueBooks: 0,
//     overdueBooksTrend: 0,
//     totalIssued: 0,
//     totalReturned: 0,
//     totalFines: 0,
//     dailyTraffic: Array(24).fill(0),
//     leaderboard: []
//   });

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const response = await getAdminAnalytics();
//         setData(response.data);
//         setError(null);
//       } catch (err) {
//         console.error('Error fetching analytics:', err);
//         setError('Failed to fetch analytics data');
//         toast.error('Failed to fetch analytics data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//     // Refresh data every 5 minutes
//     const interval = setInterval(fetchData, 5 * 60 * 1000);
//     return () => clearInterval(interval);
//   }, []);

//   // Format trend value for display
//   const formatTrend = (trend) => {
//     const isPositive = trend > 0;
//     return {
//       icon: isPositive ? <MdArrowUpward className="text-green-500" /> : <MdArrowDownward className="text-red-500" />,
//       text: `${Math.abs(trend)}%`,
//       style: isPositive ? "text-green-500" : "text-red-500"
//     };
//   };

//   // Chart configuration
//   const barChartDataDailyTraffic = [{
//     name: "Books Borrowed",
//     data: data.dailyTraffic,
//   }];

//   const barChartOptionsDailyTraffic = {
//     chart: {
//       toolbar: {
//         show: false,
//       },
//     },
//     tooltip: {
//       style: {
//         fontSize: "12px",
//         fontFamily: undefined,
//       },
//       onDatasetHover: {
//         style: {
//           fontSize: "12px",
//           fontFamily: undefined,
//         },
//       },
//       theme: "dark",
//     },
//     xaxis: {
//       categories: Array.from({ length: 24 }, (_, i) => `${i}:00`),
//       show: true,
//       labels: {
//         show: true,
//         style: {
//           colors: "#A3AED0",
//           fontSize: "14px",
//           fontWeight: "500",
//         },
//       },
//       axisBorder: {
//         show: false,
//       },
//       axisTicks: {
//         show: false,
//       },
//     },
//     yaxis: {
//       show: true,
//       labels: {
//         show: true,
//         style: {
//           colors: "#A3AED0",
//           fontSize: "14px",
//           fontWeight: "500",
//         },
//       },
//     },
//     grid: {
//       show: false,
//       strokeDashArray: 5,
//       yaxis: {
//         lines: {
//           show: true,
//         },
//       },
//       xaxis: {
//         lines: {
//           show: false,
//         },
//       },
//     },
//     fill: {
//       type: "gradient",
//       gradient: {
//         type: "vertical",
//         shadeIntensity: 1,
//         opacityFrom: 0.7,
//         opacityTo: 0.9,
//         colorStops: [
//           [
//             {
//               offset: 0,
//               color: "#4318FF",
//               opacity: 1,
//             },
//             {
//               offset: 100,
//               color: "rgba(67, 24, 255, 1)",
//               opacity: 0.28,
//             },
//           ],
//         ],
//       },
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     plotOptions: {
//       bar: {
//         borderRadius: 10,
//         columnWidth: "40px",
//       },
//     },
//   };

//   if (loading) {
//     return (
//       <div className="flex justify-center items-center h-full">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="flex justify-center items-center h-full text-red-500">
//         <p>{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div>
//       <ToastContainer />

//       {/* Stats Grid */}
//         <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
//         {/* Total Books */}
//           <Widget
//             icon={<MdMenuBook className="h-7 w-7" />}
//             title={"Total Books"}
//             subtitle={
//               <div className="flex items-center gap-1">
//               <span className="text-lg font-bold">{data.totalBooks}</span>
//               <span className={`flex items-center text-sm ${formatTrend(data.totalBooksTrend).style}`}>
//                 {formatTrend(data.totalBooksTrend).icon}
//                 {formatTrend(data.totalBooksTrend).text}
//                 </span>
//               </div>
//             }
//           />

//         {/* Active Members */}
//           <Widget
//             icon={<MdPeople className="h-7 w-7" />}
//             title={"Active Members"}
//             subtitle={
//               <div className="flex items-center gap-1">
//               <span className="text-lg font-bold">{data.activeMembers}</span>
//               <span className={`flex items-center text-sm ${formatTrend(data.activeMembersTrend).style}`}>
//                 {formatTrend(data.activeMembersTrend).icon}
//                 {formatTrend(data.activeMembersTrend).text}
//                 </span>
//               </div>
//             }
//           />

//         {/* Active Book Borrows */}
//           <Widget
//             icon={<MdHistory className="h-7 w-7" />}
//           title={"Active Book Borrows"}
//             subtitle={
//               <div className="flex items-center gap-1">
//               <span className="text-lg font-bold">{data.booksBorrowed}</span>
//               <span className={`flex items-center text-sm ${formatTrend(data.booksBorrowedTrend).style}`}>
//                 {formatTrend(data.booksBorrowedTrend).icon}
//                 {formatTrend(data.booksBorrowedTrend).text}
//                 </span>
//               </div>
//             }
//           />

//         {/* Overdue Books */}
//            <Widget
//           icon={<MdWarning className="h-7 w-7 text-orange-500" />}
//             title={"Overdue Books"}
//             subtitle={
//               <div className="flex items-center gap-1">
//               <span className="text-lg font-bold">{data.overdueBooks}</span>
//               <span className={`flex items-center text-sm ${formatTrend(data.overdueBooksTrend).style}`}>
//                 {formatTrend(data.overdueBooksTrend).icon}
//                 {formatTrend(data.overdueBooksTrend).text}
//                 </span>
//               </div>
//             }
//           />
//         </div>

//       <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
//           {/* Daily Traffic Chart */}
//           <Card extra="!p-[20px]">
//             <div className="flex flex-row justify-between">
//               <div>
//                 <h4 className="text-lg font-bold text-navy-700 dark:text-white">
//                   Daily Borrowing Traffic
//                 </h4>
//                 <p className="mt-2 text-base text-gray-600">
//                   Track daily book borrowing patterns
//                 </p>
//               </div>
//             </div>

//           <div className="h-[300px] w-full pt-10 pb-0">
//             <Chart
//               options={barChartOptionsDailyTraffic}
//               series={barChartDataDailyTraffic}
//               type="bar"
//               width="100%"
//               height="100%"
//               />
//             </div>
//           </Card>

//           {/* Issues and Returns */}
//           <Card extra="!p-[20px]">
//             <div className="mb-4">
//               <div className="flex items-center justify-between">
//                 <div>
//                   <h4 className="text-lg font-bold text-navy-700 dark:text-white">
//                     Issues and Returns
//                   </h4>
//                   <p className="mt-2 text-base text-gray-600">
//                     Summary of book transactions
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="space-y-3">
//               <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-navy-800">
//                 <h6 className="font-medium text-navy-700 dark:text-white">
//                   Total Books Issued
//                 </h6>
//                 <span className="text-base font-bold text-navy-700 dark:text-white">
//                 {data.totalIssued}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-navy-800">
//                 <h6 className="font-medium text-navy-700 dark:text-white">
//                   Total Books Returned
//                 </h6>
//                 <span className="text-base font-bold text-navy-700 dark:text-white">
//                 {data.totalReturned}
//                 </span>
//               </div>
//               <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-navy-800">
//                 <h6 className="font-medium text-navy-700 dark:text-white">
//                 Total Fines Collected
//                 </h6>
//                 <span className="text-base font-bold text-green-500">
//                 ₹{data.totalFines}
//                 </span>
//               </div>
//             </div>
//           </Card>

//         {/* Library Leaderboard */}
//         <Card extra="!p-[20px] col-span-full">
//           <div className="mb-4">
//             <h4 className="text-lg font-bold text-navy-700 dark:text-white">
//               Library Leaderboard
//             </h4>
//             <p className="mt-2 text-base text-gray-600">
//               Top Library Users by Hours Spent
//             </p>
//           </div>

//           <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-6">
//             {[
//               { name: "Diamond", hours: "100+" },
//               { name: "Platinum", hours: "75+" },
//               { name: "Gold", hours: "50+" },
//               { name: "Silver", hours: "25+" },
//               { name: "Bronze", hours: "10+" },
//               { name: "Beginner", hours: "<10" }
//             ].map(({ name, hours }) => (
//               <div key={name} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-navy-700">
//                 <div className={`font-bold ${getBadgeByHours(name === "Diamond" ? 100 : name === "Platinum" ? 75 : name === "Gold" ? 50 : name === "Silver" ? 25 : name === "Bronze" ? 10 : 0).style} rounded-full px-2 py-1`}>
//                   {name}
//           </div>
//                 <div className="text-xs text-gray-500 mt-1">{hours} hrs</div>
//               </div>
//             ))}
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full">
//               <thead>
//                 <tr className="border-b border-gray-200">
//                   <th className="py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
//                   <th className="py-3 text-left text-sm font-semibold text-gray-600">Roll No</th>
//                   <th className="py-3 text-left text-sm font-semibold text-gray-600">Name</th>
//                   <th className="py-3 text-left text-sm font-semibold text-gray-600">Badge</th>
//                   <th className="py-3 text-left text-sm font-semibold text-gray-600">Hours</th>
//                   <th className="py-3 text-left text-sm font-semibold text-gray-600">Books</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                 {(data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard)
//                   .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
//                   .map((item, index) => {
//                   const badge = getBadgeByHours(Math.floor(item.totalHours));
//                   const actualRank = ((currentPage - 1) * itemsPerPage) + index + 1;
//                   return (
//                     <tr key={item._id} className="border-b border-gray-200 last:border-0">
//                       <td className="py-3 text-sm">{actualRank}</td>
//                       <td className="py-3 text-sm">{item.student?.rollNumber}</td>
//                       <td className="py-3 text-sm">{item.student?.name}</td>
//                       <td className="py-3 text-sm">
//                         <span className={`px-2 py-1 rounded-full text-xs ${badge.style}`}>
//                           {badge.name}
//                           </span>
//                       </td>
//                       <td className="py-3 text-sm">{Math.floor(item.totalHours)}</td>
//                       <td className="py-3 text-sm">{item.totalBorrows}</td>
//                     </tr>
//                   );
//                 })}
//                 </tbody>
//               </table>
//           </div>

//           {/* Pagination */}
//           <div className="mt-4 flex justify-between items-center">
//             <div className="text-sm text-gray-600">
//               Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, (data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length)} 
//               - {Math.min(currentPage * itemsPerPage, (data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length)} 
//               of {(data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length} entries
//             </div>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
//                 disabled={currentPage === 1}
//                 className={`px-3 py-1 rounded ${
//                   currentPage === 1
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-brand-500 text-white hover:bg-brand-600'
//                 }`}
//               >
//                 Previous
//               </button>
//             <button
//                 onClick={() => setCurrentPage(prev => Math.min(Math.ceil((data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length / itemsPerPage), prev + 1))}
//                 disabled={currentPage === Math.ceil((data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length / itemsPerPage)}
//                 className={`px-3 py-1 rounded ${
//                   currentPage === Math.ceil((data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length / itemsPerPage)
//                     ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
//                     : 'bg-brand-500 text-white hover:bg-brand-600'
//                 }`}
//               >
//                 Next
//             </button>
//             </div>
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default Analytics; 


import React, { useState, useEffect } from "react";
import { MdTrendingUp, MdPeople, MdMenuBook, MdHistory, MdWarning, MdArrowUpward, MdArrowDownward } from "react-icons/md";
import { FiAward } from "react-icons/fi";
import Widget from "components/widget/Widget";
import Card from "components/card";
import { getAdminAnalytics } from "../../../api/borrowApi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Chart from "react-apexcharts";

// Updated badge system based on hours spent
function getBadgeByHours(hours) {
  if (hours >= 100) return { name: "Diamond", style: "bg-blue-500 text-white" };
  if (hours >= 75) return { name: "Platinum", style: "bg-purple-500 text-white" };
  if (hours >= 50) return { name: "Gold", style: "bg-yellow-500 text-white" };
  if (hours >= 25) return { name: "Silver", style: "bg-gray-400 text-white" };
  if (hours >= 10) return { name: "Bronze", style: "bg-orange-700 text-white" };
  return { name: "Beginner", style: "bg-gray-600 text-white" };
}

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [mockLeaderboard] = useState([
    { _id: 1, student: { name: "John Doe", rollNumber: "24M11MC123" }, totalHours: 120, totalBorrows: 25 },
    { _id: 2, student: { name: "Jane Smith", rollNumber: "24M11MC124" }, totalHours: 95, totalBorrows: 20 },
    { _id: 3, student: { name: "Alice Johnson", rollNumber: "24M11MC125" }, totalHours: 82, totalBorrows: 18 },
    { _id: 4, student: { name: "Bob Wilson", rollNumber: "24M11MC126" }, totalHours: 75, totalBorrows: 15 },
    { _id: 5, student: { name: "Charlie Brown", rollNumber: "24M11MC127" }, totalHours: 65, totalBorrows: 14 },
    { _id: 6, student: { name: "Diana Prince", rollNumber: "24M11MC128" }, totalHours: 55, totalBorrows: 12 },
    { _id: 7, student: { name: "Edward Stone", rollNumber: "24M11MC129" }, totalHours: 45, totalBorrows: 10 },
    { _id: 8, student: { name: "Fiona Green", rollNumber: "24M11MC130" }, totalHours: 35, totalBorrows: 8 },
    { _id: 9, student: { name: "George Martin", rollNumber: "24M11MC131" }, totalHours: 25, totalBorrows: 6 },
    { _id: 10, student: { name: "Helen Adams", rollNumber: "24M11MC132" }, totalHours: 20, totalBorrows: 5 },
    { _id: 11, student: { name: "Ian Clark", rollNumber: "24M11MC133" }, totalHours: 15, totalBorrows: 4 },
    { _id: 12, student: { name: "Julia Davis", rollNumber: "24M11MC134" }, totalHours: 12, totalBorrows: 3 },
    { _id: 13, student: { name: "Kevin White", rollNumber: "24M11MC135" }, totalHours: 8, totalBorrows: 2 },
    { _id: 14, student: { name: "Laura Hall", rollNumber: "24M11MC136" }, totalHours: 5, totalBorrows: 1 },
    { _id: 15, student: { name: "Mike Turner", rollNumber: "24M11MC137" }, totalHours: 3, totalBorrows: 1 }
  ]);
  const [data, setData] = useState({
    totalBooks: 0,
    totalBooksTrend: 0,
    activeMembers: 0,
    activeMembersTrend: 0,
    booksBorrowed: 0,
    booksBorrowedTrend: 0,
    overdueBooks: 0,
    overdueBooksTrend: 0,
    totalIssued: 0,
    totalReturned: 0,
    totalFines: 0,
    dailyTraffic: Array(6).fill(0), // 6 days: Mon-Sat
    leaderboard: []
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await getAdminAnalytics();
        setData(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to fetch analytics data');
        toast.error('Failed to fetch analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Format trend value for display
  const formatTrend = (trend) => {
    const isPositive = trend > 0;
    return {
      icon: isPositive ? <MdArrowUpward className="text-green-500" /> : <MdArrowDownward className="text-red-500" />,
      text: `${Math.abs(trend)}%`,
      style: isPositive ? "text-green-500" : "text-red-500"
    };
  };

  // Chart configuration
  const barChartDataDailyTraffic = [{
    name: "Books Borrowed",
    data: [5, 10, 7, 3, 8, 2], // Example data for Mon-Sat
  }];

  const barChartOptionsDailyTraffic = {
    chart: {
      toolbar: {
        show: false,
      },
    },
    tooltip: {
      style: {
        fontSize: "12px",
        fontFamily: undefined,
      },
      onDatasetHover: {
        style: {
          fontSize: "12px",
          fontFamily: undefined,
        },
      },
      theme: "dark",
    },
    xaxis: {
      categories: ["Mon", "Tues", "Wed", "Thu", "Fri", "Sat"],
      show: true,
      labels: {
        show: true,
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    yaxis: {
      show: true,
      labels: {
        show: true,
        style: {
          colors: "#A3AED0",
          fontSize: "14px",
          fontWeight: "500",
        },
      },
    },
    grid: {
      show: false,
      strokeDashArray: 5,
      yaxis: {
        lines: {
          show: true,
        },
      },
      xaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      type: "gradient",
      gradient: {
        type: "vertical",
        shadeIntensity: 1,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        colorStops: [
          [
            {
              offset: 0,
              color: "#4318FF",
              opacity: 1,
            },
            {
              offset: 100,
              color: "rgba(67, 24, 255, 1)",
              opacity: 0.28,
            },
          ],
        ],
      },
    },
    dataLabels: {
      enabled: false,
    },
    plotOptions: {
      bar: {
        borderRadius: 10,
        columnWidth: "40px",
      },
    },
  };

  console.log("Daily Traffic Data:", data.dailyTraffic);
  console.log("Categories:", barChartOptionsDailyTraffic.xaxis.categories);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <ToastContainer />

      {/* Stats Grid */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Total Books */}
          <Widget
            icon={<MdMenuBook className="h-7 w-7" />}
            title={"Total Books"}
            subtitle={
              <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{data.totalBooks}</span>
              <span className={`flex items-center text-sm ${formatTrend(data.totalBooksTrend).style}`}>
                {formatTrend(data.totalBooksTrend).icon}
                {formatTrend(data.totalBooksTrend).text}
                </span>
              </div>
            }
          />

        {/* Active Members */}
          <Widget
            icon={<MdPeople className="h-7 w-7" />}
            title={"Active Members"}
            subtitle={
              <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{data.activeMembers}</span>
              <span className={`flex items-center text-sm ${formatTrend(data.activeMembersTrend).style}`}>
                {formatTrend(data.activeMembersTrend).icon}
                {formatTrend(data.activeMembersTrend).text}
                </span>
              </div>
            }
          />

        {/* Active Book Borrows */}
          <Widget
            icon={<MdHistory className="h-7 w-7" />}
          title={"Active Book Borrows"}
            subtitle={
              <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{data.booksBorrowed}</span>
              <span className={`flex items-center text-sm ${formatTrend(data.booksBorrowedTrend).style}`}>
                {formatTrend(data.booksBorrowedTrend).icon}
                {formatTrend(data.booksBorrowedTrend).text}
                </span>
              </div>
            }
          />

        {/* Overdue Books */}
           <Widget
          icon={<MdWarning className="h-7 w-7 text-orange-500" />}
            title={"Overdue Books"}
            subtitle={
              <div className="flex items-center gap-1">
              <span className="text-lg font-bold">{data.overdueBooks}</span>
              <span className={`flex items-center text-sm ${formatTrend(data.overdueBooksTrend).style}`}>
                {formatTrend(data.overdueBooksTrend).icon}
                {formatTrend(data.overdueBooksTrend).text}
                </span>
              </div>
            }
          />
        </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Daily Traffic Chart */}
          <Card extra="!p-[20px]">
            <div className="flex flex-row justify-between">
              <div>
                <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                  Daily Borrowing Traffic
                </h4>
                <p className="mt-2 text-base text-gray-600">
                  Track daily book borrowing patterns
                </p>
              </div>
            </div>

          <div className="h-[300px] w-full pt-10 pb-0">
            <Chart
              options={barChartOptionsDailyTraffic}
              series={barChartDataDailyTraffic}
              type="bar"
              width="100%"
              height="100%"
              />
            </div>
          </Card>

          {/* Issues and Returns */}
          <Card extra="!p-[20px]">
            <div className="mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-lg font-bold text-navy-700 dark:text-white">
                    Issues and Returns
                  </h4>
                  <p className="mt-2 text-base text-gray-600">
                    Summary of book transactions
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-navy-800">
                <h6 className="font-medium text-navy-700 dark:text-white">
                  Total Books Issued
                </h6>
                <span className="text-base font-bold text-navy-700 dark:text-white">
                {data.totalIssued}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-navy-800">
                <h6 className="font-medium text-navy-700 dark:text-white">
                  Total Books Returned
                </h6>
                <span className="text-base font-bold text-navy-700 dark:text-white">
                {data.totalReturned}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-navy-800">
                <h6 className="font-medium text-navy-700 dark:text-white">
                Total Fines Collected
                </h6>
                <span className="text-base font-bold text-green-500">
                ₹{data.totalFines}
                </span>
              </div>
            </div>
          </Card>

        {/* Library Leaderboard */}
        <Card extra="!p-[20px] col-span-full">
          <div className="mb-4">
            <h4 className="text-lg font-bold text-navy-700 dark:text-white">
              Library Leaderboard
            </h4>
            <p className="mt-2 text-base text-gray-600">
              Top Library Users by Hours Spent
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4 md:grid-cols-6">
            {[
              { name: "Diamond", hours: "100+" },
              { name: "Platinum", hours: "75+" },
              { name: "Gold", hours: "50+" },
              { name: "Silver", hours: "25+" },
              { name: "Bronze", hours: "10+" },
              { name: "Beginner", hours: "<10" }
            ].map(({ name, hours }) => (
              <div key={name} className="text-center p-2 rounded-lg bg-gray-50 dark:bg-navy-700">
                <div className={`font-bold ${getBadgeByHours(name === "Diamond" ? 100 : name === "Platinum" ? 75 : name === "Gold" ? 50 : name === "Silver" ? 25 : name === "Bronze" ? 10 : 0).style} rounded-full px-2 py-1`}>
                  {name}
          </div>
                <div className="text-xs text-gray-500 mt-1">{hours} hrs</div>
              </div>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="py-3 text-left text-sm font-semibold text-gray-600">Rank</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-600">Roll No</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-600">Name</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-600">Badge</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-600">Hours</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-600">Books</th>
                  </tr>
                </thead>
                <tbody>
                {(data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard)
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((item, index) => {
                  const badge = getBadgeByHours(Math.floor(item.totalHours));
                  const actualRank = ((currentPage - 1) * itemsPerPage) + index + 1;
                  return (
                    <tr key={item._id} className="border-b border-gray-200 last:border-0">
                      <td className="py-3 text-sm">{actualRank}</td>
                      <td className="py-3 text-sm">{item.student?.rollNumber}</td>
                      <td className="py-3 text-sm">{item.student?.name}</td>
                      <td className="py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${badge.style}`}>
                          {badge.name}
                          </span>
                      </td>
                      <td className="py-3 text-sm">{Math.floor(item.totalHours)}</td>
                      <td className="py-3 text-sm">{item.totalBorrows}</td>
                    </tr>
                  );
                })}
                </tbody>
              </table>
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {Math.min(((currentPage - 1) * itemsPerPage) + 1, (data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length)} 
              - {Math.min(currentPage * itemsPerPage, (data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length)} 
              of {(data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length} entries
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                Previous
              </button>
            <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil((data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil((data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length / itemsPerPage)}
                className={`px-3 py-1 rounded ${
                  currentPage === Math.ceil((data.leaderboard.length > 0 ? data.leaderboard : mockLeaderboard).length / itemsPerPage)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                Next
            </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Analytics; 