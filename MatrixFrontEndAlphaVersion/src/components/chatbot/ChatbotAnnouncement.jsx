import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RiRobot2Fill } from "react-icons/ri";

// These should match your chat button's position
const chatButtonBottom = 24; // px
const chatButtonRight = 32;  // px (adjust if your button is not exactly at 24px)
const announcementBottom = 90; // px
const announcementRight = 32;  // px

const ChatbotAnnouncement = () => {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-hide after 3 seconds
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  // Calculate the vertical and horizontal offset for the animation
  const yOffset = chatButtonBottom - announcementBottom;
  const xOffset = chatButtonRight - announcementRight;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{
            opacity: 0,
            scale: 0.4,
            y: -yOffset,
            x: -xOffset,
            filter: "blur(8px)",
          }}
          animate={{
            opacity: 1,
            scale: 1,
            y: 0,
            x: 0,
            filter: "blur(0px)",
          }}
          exit={{
            opacity: 0,
            scale: 0.4,
            y: -yOffset,
            x: -xOffset,
            filter: "blur(8px)",
          }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          style={{
            position: "fixed",
            bottom: `${announcementBottom}px`,
            right: `${announcementRight}px`,
            background: "#2563eb",
            color: "white",
            padding: "8px 18px",
            borderRadius: "10px",
            boxShadow: "0 2px 12px 0 rgba(80, 0, 200, 0.10)",
            zIndex: 9999,
            fontWeight: 500,
            fontSize: "0.98rem",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            border: "1.5px solid #e0e7ef",
            textShadow: "0 1px 4px #1e40af22"
          }}
        >
          <motion.span
            animate={{
              scale: [1, 1.13, 1],
              rotate: [0, 7, -7, 0],
              filter: [
                "drop-shadow(0 0 4px #fff)",
                "drop-shadow(0 0 8px #a78bfa)",
                "drop-shadow(0 0 4px #fff)"
              ]
            }}
            transition={{
              repeat: Infinity,
              duration: 1.2,
              ease: "easeInOut"
            }}
            style={{ fontSize: "1.25em" }}
          >
            <RiRobot2Fill size={28} />
          </motion.span>
          <span>Your Library Assistant is here to help. Click the chat icon!</span>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ChatbotAnnouncement; 