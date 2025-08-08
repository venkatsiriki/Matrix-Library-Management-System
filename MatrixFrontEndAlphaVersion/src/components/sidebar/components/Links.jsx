/* eslint-disable */
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { motion } from "framer-motion";

const Links = ({ routes }) => {
  const location = useLocation();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  const isActive = (route) => {
    return location.pathname === route.layout + "/" + route.path;
  };

        return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-3 space-y-2"
    >
      {routes.map((route, index) => (
        <motion.div key={index} variants={item}>
          <Link to={`${route.layout}/${route.path}`}>
            <div
              className={`sidebar-link relative flex items-center rounded-xl px-4 py-3 font-medium transition-all duration-200
                ${
                  isActive(route)
                    ? "bg-brand-500/10 text-brand-500 dark:bg-navy-700 dark:text-brand-400"
                    : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-navy-700"
                }
              `}
                >
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="mr-3 text-inherit"
              >
                {route.icon}
              </motion.div>
              <span className="text-sm font-medium">{route.name}</span>
              {isActive(route) && (
                <motion.div
                  className="absolute right-4 h-2 w-2 rounded-full bg-brand-500 dark:bg-brand-400"
                  layoutId="activeIndicator"
                />
              )}
            </div>
          </Link>
        </motion.div>
      ))}
    </motion.div>
        );
  };

export default Links;
