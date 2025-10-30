import React, { useState, useEffect, useRef } from 'react';
import { User, ChatMessage } from '../types';
import * as geminiService from '../services/geminiService';
import { Chat } from '@google/genai';
import Spinner from './common/Spinner';

interface AIGuideProps {
  user: User;
}

const AIGuide: React.FC<AIGuideProps> = ({ user }) => {
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initChat = () => {
      try {
        const session = geminiService.startAIGuideChat(user);
        setChatSession(session);
        setMessages([
          { role: 'model', text: `Hello ${user.username}! I'm your AI Guide. I can help you with gardening questions about soil, weather, or how to use the Botanica app. What's on your mind?` }
        ]);
        setIsLoading(false);
      } catch (error) {
        console.error("Failed to start AI Guide chat:", error);
        setMessages([{ role: 'model', text: 'Sorry, I am unable to start our chat right now. Please try again later.' }]);
        setIsLoading(false);
      }
    };
    initChat();
  }, [user]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || !chatSession || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    const currentInput = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await chatSession.sendMessage({ message: currentInput });
      const modelMessage: ChatMessage = { role: 'model', text: response.text };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error("Failed to get response from AI:", error);
      const errorMessage: ChatMessage = { role: 'model', text: 'I seem to be having trouble connecting. Please check your connection and try again.' };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const renderMarkdown = (text: string) => {
      return text.split('\n').map((line, index) => {
        if (line.startsWith('* ')) {
          return <li key={index} className="ml-5 list-disc">{line.substring(2)}</li>;
        }
        return <p key={index} className="my-1">{line}</p>;
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-180px)] bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-brand-brown p-4 text-center border-b">AI Guide</h2>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'model' && <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>}
            <div className={`max-w-xs md:max-w-md p-3 rounded-2xl ${msg.role === 'user' ? 'bg-blue-500 text-white rounded-br-none' : 'bg-gray-200 text-brand-brown rounded-bl-none'}`}>
              {renderMarkdown(msg.text)}
            </div>
          </div>
        ))}
        {isLoading && messages.length > 0 && (
          <div className="flex items-start gap-3">
             <div className="w-8 h-8 rounded-full bg-brand-green flex items-center justify-center text-white font-bold text-sm flex-shrink-0">AI</div>
             <div className="max-w-xs md:max-w-md p-3 rounded-2xl bg-gray-200 text-brand-brown rounded-bl-none">
                <Spinner />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSendMessage} className="p-4 flex gap-2 border-t">
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          placeholder="Ask about plants, weather, or the app..."
          className="flex-grow px-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-brand-light-green"
          disabled={!chatSession || isLoading}
        />
        <button
          type="submit"
          disabled={!chatSession || isLoading || !userInput.trim()}
          className="bg-brand-green text-white font-bold p-3 rounded-full hover:bg-brand-light-green transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.428A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
          </svg>
        </button>
      </form>
    </div>
  );
};

export default AIGuide;