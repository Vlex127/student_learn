"use client";
import { useState, useRef } from "react";
import { Bot } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  // For draggable chat icon
  const [chatPos, setChatPos] = useState({ x: 20, y: 20 });
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [showChat, setShowChat] = useState(false);
  const [hasDragged, setHasDragged] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(true);
    setHasDragged(false);
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (dragging) {
      setHasDragged(true);
      const newX = e.clientX - offset.x;
      const newY = e.clientY - offset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setChatPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const onMouseUp = () => {
    setDragging(false);
  };

  // Touch handlers for mobile
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(true);
    setHasDragged(false);
    const touch = e.touches[0];
    const rect = chatRef.current?.getBoundingClientRect();
    if (rect) {
      setOffset({ x: touch.clientX - rect.left, y: touch.clientY - rect.top });
    }
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (dragging) {
      e.preventDefault();
      setHasDragged(true);
      const touch = e.touches[0];
      const newX = touch.clientX - offset.x;
      const newY = touch.clientY - offset.y;
      
      // Keep within viewport bounds
      const maxX = window.innerWidth - 60;
      const maxY = window.innerHeight - 60;
      
      setChatPos({
        x: Math.max(0, Math.min(newX, maxX)),
        y: Math.max(0, Math.min(newY, maxY))
      });
    }
  };

  const onTouchEnd = () => {
    setDragging(false);
  };

  // Handle click (only if not dragged)
  const handleClick = () => {
    if (!hasDragged) {
      setShowChat(true);
    }
  };

  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8"
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      style={{ minHeight: "80vh" }}
    >
      {/* Take Test */}
      <section id="tests" className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-xl shadow hover:shadow-lg transition">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Take a Practice Test</h2>
        <p className="mb-4 text-muted-foreground">Sharpen your skills with a new quiz.</p>
        <Link href="/tests" className="block">
          <button className="bg-indigo-600 hover:bg-indigo-700 transition text-white px-4 py-2 rounded shadow w-full">Start Test</button>
        </Link>
      </section>

      {/* Library */}
      <section id="library" className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-xl shadow hover:shadow-lg transition">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Library</h2>
        <p className="mb-4 text-muted-foreground">Read books, notes, and study materials.</p>
        <Link href="/library" className="block">
          <button className="bg-blue-600 hover:bg-blue-700 transition text-white px-4 py-2 rounded shadow w-full">Browse Library</button>
        </Link>
      </section>

      {/* Progress */}
      <section id="progress" className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-xl shadow hover:shadow-lg transition">
        <h2 className="text-lg md:text-xl font-semibold mb-2">Your Progress</h2>
        <p className="mb-4 text-muted-foreground">Track your scores and improvement over time.</p>
        <Link href="/progress" className="block">
          <div className="h-24 bg-gray-100 dark:bg-zinc-800 rounded flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700 transition cursor-pointer">
            View Progress
          </div>
        </Link>
      </section>

      {/* AI Tutor */}
      <section className="bg-white dark:bg-zinc-900 p-4 md:p-6 rounded-xl shadow hover:shadow-lg transition flex flex-col items-center justify-center">
        <h2 className="text-lg md:text-xl font-semibold mb-2">AI Tutor</h2>
        <p className="mb-4 text-muted-foreground">Get help with your studies</p>
        <Link href="/ai" className="block w-full">
          <button className="bg-green-600 hover:bg-green-700 transition text-white px-4 py-2 rounded shadow w-full">Open AI Tutor</button>
        </Link>
      </section>

      {/* Draggable AI Chat Icon */}
      <div
        ref={chatRef}
        style={{
          position: "fixed",
          left: chatPos.x,
          bottom: chatPos.y,
          zIndex: 50,
          cursor: dragging ? "grabbing" : "grab",
          transition: dragging ? "none" : "all 0.2s ease",
          touchAction: "none",
          userSelect: "none",
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onClick={handleClick}
        className={`bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg p-4 flex items-center justify-center md:p-4 sm:p-3 ${dragging ? 'scale-110' : 'hover:scale-105'}`}
        title="Chat with AI Tutor"
      >
        <Bot size={24} />
      </div>

      {/* Chat Modal (simple placeholder) */}
      {showChat && (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-end z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-t-2xl shadow-2xl w-full max-w-md p-4 md:p-6 m-2 md:m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2"><Bot /> AI Tutor</h3>
              <button onClick={() => setShowChat(false)} className="text-gray-400 hover:text-red-500 text-xl">&times;</button>
            </div>
            <div className="h-40 md:h-48 overflow-y-auto border rounded p-2 mb-4 bg-gray-50 dark:bg-zinc-800">
              <p className="text-muted-foreground">Chat UI coming soon...</p>
            </div>
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Type your question..."
              disabled
            />
          </div>
        </div>
      )}
    </div>
  );
}
