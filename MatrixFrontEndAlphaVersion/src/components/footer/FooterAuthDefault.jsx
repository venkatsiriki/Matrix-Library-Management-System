/*eslint-disable*/
import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { FiGithub, FiTwitter, FiLinkedin, FiInstagram, FiMail, FiHelpCircle, FiFileText, FiShield } from "react-icons/fi";

const footerLinks = [
  { icon: FiHelpCircle, label: 'Help Center', path: '/help' },
  { icon: FiFileText, label: 'Terms', path: '/terms' },
  { icon: FiShield, label: 'Privacy', path: '/privacy' },
  { icon: FiMail, label: 'Support', path: 'mailto:support@matrix.com' },
];

const socialLinks = [
  { icon: FiGithub, href: 'https://github.com', label: 'GitHub' },
  { icon: FiTwitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: FiLinkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  { icon: FiInstagram, href: 'https://instagram.com', label: 'Instagram' }
];

export default function Footer() {
  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center">
          {/* Main Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-3 mb-6">
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                to={link.path}
                className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <link.icon className="h-3.5 w-3.5" />
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex gap-4 mb-6">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <social.icon className="h-4 w-4" />
              </motion.a>
            ))}
          </div>

          {/* Copyright */}
          <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
            © {new Date().getFullYear()} <span className="font-['Audiowide'] bg-clip-text text-transparent bg-gradient-to-r from-primary/80 via-primary/70 to-primary/60">MATRIX</span>
          </p>
        </div>
      </div>
    </div>
  );
}
