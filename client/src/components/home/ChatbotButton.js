// src/components/home/ChatbotButton.js
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send } from "lucide-react";
import axios from "axios";

export default function ChatbotButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "bot",
      text: "Hi! I'm your AI travel assistant. I can help you plan trips, find destinations, and answer travel questions. How can I help you today?",
      options: [
        "Plan a trip to Kerala for 5 days",
        "Best places to visit in Rajasthan",
        "Budget trip under ₹20,000",
        "Honeymoon destinations in India",
        "Manali ₹15,000", // ✅ New demo option
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (text, fromOption = false) => {
    if (!text?.trim()) return;

    const userMessage = { sender: "user", text: text.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");

    // ✅ Handle Demo Trip (no API call)
    if (text.toLowerCase().includes("manali")) {
      const demoReply = {
        sender: "bot",
        text: `🏔️ **Manali 3N/4D Trip (₹15,000 per person)**  
        
**Inclusions:**
• 3 nights stay in a 3⭐ hotel  
• Daily breakfast & dinner  
• Solang Valley & Rohtang Pass sightseeing  
• Volvo bus from Delhi & local transfers  

**Highlights:**
- Visit Hidimba Temple, Old Manali Café Street  
- Enjoy snow adventure at Solang Valley  
- Evening bonfire at hotel  

**Contact us to customize this trip!**`,
      };
      setMessages((prev) => [...prev, demoReply]);
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:1337/api/chatbot", { message: text.trim() });

      const botReply = res.data?.response || "Sorry, I couldn't find an answer. Try rephrasing your question.";

      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: botReply, options: fromOption ? [] : null },
      ]);
    } catch (err) {
      console.error("Chatbot error:", err);
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "⚠️ Something went wrong while fetching response." },
      ]);
    }

    setLoading(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {!isOpen && (
        <motion.button
          onClick={() => setIsOpen(true)}
          className="bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <MessageCircle className="h-6 w-6" />
        </motion.button>
      )}

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="w-96 h-[500px] bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-blue-600 text-white p-4 flex justify-between items-center">
              <h3 className="font-semibold">AI Travel Assistant</h3>
              <button onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`p-3 rounded-lg max-w-xs whitespace-pre-wrap ${
                      msg.sender === "user"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    <p>{msg.text}</p>
                    {msg.options && (
                      <div className="mt-2 space-y-2">
                        {msg.options.map((opt, i) => (
                          <button
                            key={i}
                            onClick={() => sendMessage(opt, true)}
                            className="block w-full text-left text-sm bg-white border rounded-md px-3 py-2 hover:bg-gray-100"
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && <p className="text-gray-500 text-sm">Bot is typing...</p>}
            </div>

            {/* Input */}
            <div className="p-3 border-t flex items-center space-x-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me about travel plans..."
                className="flex-1 border p-2 rounded-lg focus:ring-2 focus:ring-blue-500"
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendMessage(input);
                }}
              />
              <button
                onClick={() => sendMessage(input)}
                className="bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
