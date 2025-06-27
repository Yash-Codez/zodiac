import React, { useState, useEffect } from 'react';
import { Stars, Calendar, User, Sparkles, Clock, Send } from 'lucide-react';

// Types for our data structures
interface ZodiacResult {
  name: string;
  dateOfBirth: string;
  zodiacSign: string;
}

interface Entry {
  id: string;
  name: string;
  dateOfBirth: string;
  zodiacSign: string;
  timestamp: string;
}

// Zodiac sign descriptions and symbols
const zodiacInfo: Record<string, { symbol: string; description: string; element: string; color: string }> = {
  Aries: { symbol: '♈', description: 'The Ram - Bold and ambitious', element: 'Fire', color: 'text-red-500' },
  Taurus: { symbol: '♉', description: 'The Bull - Reliable and practical', element: 'Earth', color: 'text-green-500' },
  Gemini: { symbol: '♊', description: 'The Twins - Adaptable and curious', element: 'Air', color: 'text-yellow-500' },
  Cancer: { symbol: '♋', description: 'The Crab - Intuitive and emotional', element: 'Water', color: 'text-blue-500' },
  Leo: { symbol: '♌', description: 'The Lion - Generous and warm-hearted', element: 'Fire', color: 'text-orange-500' },
  Virgo: { symbol: '♍', description: 'The Maiden - Analytical and kind', element: 'Earth', color: 'text-green-600' },
  Libra: { symbol: '♎', description: 'The Scales - Diplomatic and fair-minded', element: 'Air', color: 'text-pink-500' },
  Scorpio: { symbol: '♏', description: 'The Scorpion - Brave and passionate', element: 'Water', color: 'text-purple-500' },
  Sagittarius: { symbol: '♐', description: 'The Archer - Adventurous and philosophical', element: 'Fire', color: 'text-indigo-500' },
  Capricorn: { symbol: '♑', description: 'The Goat - Responsible and disciplined', element: 'Earth', color: 'text-gray-600' },
  Aquarius: { symbol: '♒', description: 'The Water Bearer - Progressive and original', element: 'Air', color: 'text-cyan-500' },
  Pisces: { symbol: '♓', description: 'The Fish - Intuitive and gentle', element: 'Water', color: 'text-blue-400' }
};

function App() {
  // State management for form data and UI
  const [formData, setFormData] = useState({ name: '', dateOfBirth: '' });
  const [result, setResult] = useState<ZodiacResult | null>(null);
  const [recentEntries, setRecentEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  /**
   * Fetch recent entries from the server on component mount
   */
  useEffect(() => {
    fetchRecentEntries();
  }, []);

  /**
   * Fetch recent entries from the API
   */
  const fetchRecentEntries = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/entries');
      if (response.ok) {
        const data = await response.json();
        setRecentEntries(data.entries || []);
      }
    } catch (err) {
      console.error('Failed to fetch recent entries:', err);
    }
  };

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setResult(data.result);
        setShowSuccess(true);
        // Refresh recent entries
        await fetchRecentEntries();
        // Clear form
        setFormData({ name: '', dateOfBirth: '' });
        
        // Hide success message after 5 seconds
        setTimeout(() => setShowSuccess(false), 5000);
      } else {
        setError(data.error || 'Failed to calculate zodiac sign');
      }
    } catch (err) {
      setError('Network error. Please check if the server is running.');
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  /**
   * Format timestamp for display
   */
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 relative overflow-hidden">
      {/* Animated background stars */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="stars"></div>
        <div className="stars2"></div>
        <div className="stars3"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 container mx-auto px-4 py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center items-center mb-6">
            <Stars className="w-12 h-12 text-yellow-400 mr-4 animate-pulse" />
            <h1 className="text-4xl lg:text-6xl font-bold text-white bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent">
              Cosmic Zodiac
            </h1>
            <Stars className="w-12 h-12 text-yellow-400 ml-4 animate-pulse" />
          </div>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto leading-relaxed">
            Discover your celestial identity through the ancient art of astrology. 
            Enter your details below to unveil your zodiac sign and cosmic personality.
          </p>
        </div>

        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left Column - Form */}
          <div className="space-y-8">
            {/* Main Form Card */}
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
              <div className="flex items-center mb-6">
                <Sparkles className="w-6 h-6 text-yellow-400 mr-3" />
                <h2 className="text-2xl font-bold text-white">Enter Your Details</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div className="space-y-2">
                  <label htmlFor="name" className="block text-sm font-medium text-purple-200 flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white placeholder-purple-300 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Date of Birth Input */}
                <div className="space-y-2">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium text-purple-200 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-all duration-300"
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 text-red-200">
                    <p className="text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-yellow-400 to-pink-500 text-white font-bold py-4 px-6 rounded-xl hover:from-yellow-500 hover:to-pink-600 focus:ring-4 focus:ring-yellow-400/50 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <Send className="w-5 h-5 mr-2" />
                  )}
                  {loading ? 'Calculating...' : 'Discover My Sign'}
                </button>
              </form>
            </div>

            {/* Success Message */}
            {showSuccess && (
              <div className="bg-green-500/20 border border-green-500/50 backdrop-blur-lg rounded-3xl p-6 animate-fade-in">
                <div className="flex items-center">
                  <Sparkles className="w-6 h-6 text-green-400 mr-3" />
                  <p className="text-green-200 font-medium">
                    Successfully calculated and saved your zodiac sign!
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Results and Recent Entries */}
          <div className="space-y-8">
            {/* Zodiac Result */}
            {result && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl animate-fade-in">
                <div className="text-center">
                  <div className="mb-6">
                    <div className={`text-6xl mb-2 ${zodiacInfo[result.zodiacSign]?.color || 'text-white'}`}>
                      {zodiacInfo[result.zodiacSign]?.symbol || '⭐'}
                    </div>
                    <h3 className="text-3xl font-bold text-white mb-2">{result.zodiacSign}</h3>
                    <p className="text-purple-200 text-lg">
                      {zodiacInfo[result.zodiacSign]?.description || 'Your cosmic identity awaits'}
                    </p>
                  </div>

                  <div className="bg-white/10 rounded-2xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Name:</span>
                      <span className="text-white font-medium">{result.name}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Birth Date:</span>
                      <span className="text-white font-medium">{formatDate(result.dateOfBirth)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-purple-200">Element:</span>
                      <span className="text-white font-medium">
                        {zodiacInfo[result.zodiacSign]?.element || 'Cosmic'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Entries */}
            {recentEntries.length > 0 && (
              <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center mb-6">
                  <Clock className="w-6 h-6 text-purple-300 mr-3" />
                  <h3 className="text-2xl font-bold text-white">Recent Cosmic Discoveries</h3>
                </div>

                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {recentEntries.map((entry) => (
                    <div
                      key={entry.id}
                      className="bg-white/10 border border-white/20 rounded-xl p-4 hover:bg-white/20 transition-all duration-300"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`text-2xl mr-3 ${zodiacInfo[entry.zodiacSign]?.color || 'text-white'}`}>
                            {zodiacInfo[entry.zodiacSign]?.symbol || '⭐'}
                          </div>
                          <div>
                            <p className="text-white font-medium">{entry.name}</p>
                            <p className="text-purple-200 text-sm">{entry.zodiacSign}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-300 text-sm">{formatDate(entry.dateOfBirth)}</p>
                          <p className="text-purple-400 text-xs">{formatTimestamp(entry.timestamp)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        .stars, .stars2, .stars3 {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .stars {
          background: radial-gradient(2px 2px at 20px 30px, #eee, transparent),
                      radial-gradient(2px 2px at 40px 70px, rgba(255,255,255,0.8), transparent),
                      radial-gradient(1px 1px at 90px 40px, #fff, transparent),
                      radial-gradient(1px 1px at 130px 80px, rgba(255,255,255,0.6), transparent);
          background-repeat: repeat;
          background-size: 200px 100px;
          animation: zoom 20s alternate infinite;
        }

        .stars2 {
          background: radial-gradient(1px 1px at 40px 60px, #fff, transparent),
                      radial-gradient(1px 1px at 120px 10px, rgba(255,255,255,0.7), transparent),
                      radial-gradient(2px 2px at 160px 30px, rgba(255,255,255,0.5), transparent);
          background-repeat: repeat;
          background-size: 200px 80px;
          animation: zoom 15s alternate infinite;
        }

        .stars3 {
          background: radial-gradient(1px 1px at 60px 90px, rgba(255,255,255,0.4), transparent),
                      radial-gradient(2px 2px at 100px 50px, rgba(255,255,255,0.3), transparent),
                      radial-gradient(1px 1px at 180px 10px, rgba(255,255,255,0.6), transparent);
          background-repeat: repeat;
          background-size: 220px 120px;
          animation: zoom 25s alternate infinite;
        }

        @keyframes zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default App;