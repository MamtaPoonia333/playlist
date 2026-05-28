import { useState } from 'react';
import { apiUrl } from '../utils/api';

export default function Upload() {
  const [formData, setFormData] = useState({
    title: '',
    artist: '',
    genre: 'Pop',
    audio: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [preview, setPreview] = useState('');

  const genres = [
    'Pop',
    'Rock',
    'Hip-Hop',
    'Jazz',
    'Classical',
    'Electronic',
    'R&B',
    'Country',
    'Indie',
    'Reggae',
    'Soul',
    'Metal',
    'Folk',
    'Ambient',
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('audio/')) {
        setMessage({ type: 'error', text: 'Please select a valid audio file' });
        return;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        setMessage({ type: 'error', text: 'File size must be less than 50MB' });
        return;
      }
      setFormData(prev => ({
        ...prev,
        audio: file,
      }));
      setPreview(file.name);
      setMessage({ type: '', text: '' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.artist || !formData.audio) {
      setMessage({ type: 'error', text: 'Please fill in all fields and select an audio file' });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('audio', formData.audio);
      uploadFormData.append('title', formData.title);
      uploadFormData.append('artist', formData.artist);
      uploadFormData.append('genre', formData.genre);

      const response = await fetch(apiUrl('/api/songs/upload'), {
        method: 'POST',
        credentials: 'include',
        body: uploadFormData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Upload failed');
      }

      setMessage({ type: 'success', text: 'Song uploaded successfully!' });
      setFormData({
        title: '',
        artist: '',
        genre: 'Pop',
        audio: null,
      });
      setPreview('');

      // Reset message after 3 seconds
      setTimeout(() => {
        setMessage({ type: '', text: '' });
      }, 3000);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to upload song' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Container */}
        <div className="bg-slate-900 border border-blue-500/30 rounded-2xl shadow-2xl p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">Upload Song</h1>
            <p className="text-blue-300/70 text-sm">Share your music with the community</p>
          </div>

          {/* Messages */}
          {message.text && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-green-500/10 border-green-500/50 text-green-300'
                  : 'bg-red-500/10 border-red-500/50 text-red-300'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title Input */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Song Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter song title"
                className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
              />
            </div>

            {/* Artist Input */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Artist Name
              </label>
              <input
                type="text"
                name="artist"
                value={formData.artist}
                onChange={handleInputChange}
                placeholder="Enter artist name"
                className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
              />
            </div>

            {/* Genre Dropdown */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Genre
              </label>
              <select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg text-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400/50 transition"
              >
                {genres.map(genre => (
                  <option key={genre} value={genre} className="bg-slate-900 text-white">
                    {genre}
                  </option>
                ))}
              </select>
            </div>

            {/* Audio File Input */}
            <div>
              <label className="block text-sm font-semibold text-blue-300 mb-2">
                Audio File
              </label>
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileChange}
                className="w-full px-4 py-3 bg-slate-800 border border-blue-500/30 rounded-lg text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 cursor-pointer transition"
              />
              {preview && (
                <p className="text-xs text-blue-300/70 mt-2">
                  ✓ {preview}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-8 py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 disabled:from-slate-600 disabled:to-slate-600 text-white font-bold rounded-lg transition duration-200 transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </span>
              ) : (
                'Upload Song'
              )}
            </button>
          </form>

          {/* Footer Note */}
          <p className="text-xs text-slate-400/70 text-center mt-6">
            Max file size: 50MB • Supported formats: MP3, WAV, FLAC, OGG
          </p>
        </div>
      </div>
    </div>
  );
}
