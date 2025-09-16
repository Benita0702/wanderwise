import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-gray-300 py-6 text-center mt-12">
      <div className="space-x-6 mb-4">
        <Link to="/about" className="hover:text-white">About Us</Link>
        <Link to="/contact" className="hover:text-white">Contact Us</Link>
        <Link to="/faqs" className="hover:text-white">FAQs</Link>
        <Link to="/terms" className="hover:text-white">Terms & Conditions</Link>
        <Link to="/privacy" className="hover:text-white">Privacy</Link>
      </div>
      <p className="text-sm">© 2025 WanderWise. All rights reserved.</p>
      <div className="flex justify-center space-x-4 mt-4">
        <a href="https://google.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">🌐</a>
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">📘</a>
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">📸</a>
        <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="hover:text-white">🐦</a>
      </div>
    </footer>
  );
}
