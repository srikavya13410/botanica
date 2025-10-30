
import React, { useState } from 'react';
import { User } from '../types';

interface AuthProps {
  onAuthSuccess: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState(1);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [username, setUsername] = useState('');
  const [medicalCondition, setMedicalCondition] = useState('');
  const [error, setError] = useState('');

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.match(/^\d{10}$/)) {
      setError('');
      setStep(2);
    } else {
      setError('Please enter a valid 10-digit phone number.');
    }
  };

  const handleOtpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp === '123456') { // Mock OTP
      setError('');
      setStep(3);
    } else {
      setError('Invalid OTP. Please use 123456 for this prototype.');
    }
  };

  const handleDetailsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username && medicalCondition) {
      setError('');
      onAuthSuccess({ phoneNumber, username, medicalCondition });
    } else {
      setError('Please fill out all fields.');
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handlePhoneSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-green text-center">Enter Your Phone Number</h2>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-brand-brown">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
                placeholder="e.g., 1234567890"
              />
            </div>
            <button type="submit" className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-light-green transition-colors">Send OTP</button>
          </form>
        );
      case 2:
        return (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-green text-center">Enter OTP</h2>
            <p className="text-center text-gray-600">An OTP has been sent to {phoneNumber}. <br/>(Hint: use 123456)</p>
            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-brand-brown">OTP</label>
              <input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
                placeholder="6-digit code"
              />
            </div>
            <button type="submit" className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-light-green transition-colors">Verify</button>
          </form>
        );
      case 3:
        return (
          <form onSubmit={handleDetailsSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold text-brand-green text-center">Tell Us About Yourself</h2>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-brand-brown">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
                placeholder="e.g., PlantLover23"
              />
            </div>
            <div>
              <label htmlFor="condition" className="block text-sm font-medium text-brand-brown">Medical Condition (optional, for recommendations)</label>
              <input
                id="condition"
                type="text"
                value={medicalCondition}
                onChange={(e) => setMedicalCondition(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-light-green"
                placeholder="e.g., Arthritis, Allergies"
              />
            </div>
            <button type="submit" className="w-full bg-brand-green text-white py-2 rounded-lg hover:bg-brand-light-green transition-colors">Get Started</button>
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-cream p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-brand-green mb-2 font-serif">Botanica</h1>
        <p className="text-center text-brand-brown mb-8">Your AI companion for mindful gardening.</p>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {renderStep()}
      </div>
    </div>
  );
};

export default Auth;
