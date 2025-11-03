import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { storiesApi } from '../services/stories';
import { LocalScene } from '../components/3d/LocalScene';
import { Upload, Trash2, Mic, MicOff, CheckCircle2, AlertCircle } from 'lucide-react';

export function CreateStoryPage() {
  const navigate = useNavigate();
  const [author, setAuthor] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragOverRef = useRef(false);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    processImages([...images, ...files].slice(0, 6));
  };

  const processImages = (files: File[]) => {
    setImages(files);
    const previews = files.map(f => URL.createObjectURL(f));
    setImagePreviews(previews);
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    URL.revokeObjectURL(imagePreviews[index]);
    setImages(newImages);
    setImagePreviews(newPreviews);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = true;
  };

  const handleDragLeave = () => {
    dragOverRef.current = false;
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragOverRef.current = false;
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length > 0) {
      processImages([...images, ...files].slice(0, 6));
    }
  };

  const onPickAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];
      recorder.ondataavailable = (ev) => chunks.push(ev.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        const file = new File([blob], `story-${Date.now()}.webm`, { type: 'audio/webm' });
        setAudioFile(file);
        setRecordingTime(0);
      };
      recorder.start();
      mediaRecorderRef.current = recorder;
      setRecording(true);
      setRecordingTime(0);

      // Timer
      recordingTimerRef.current = setInterval(() => {
        setRecordingTime(t => t + 1);
      }, 1000);
    } catch {
      setError('Unable to access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    setRecording(false);
  };

  const removeAudio = () => {
    setAudioFile(null);
    setRecordingTime(0);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!author || !whatsapp || !title || !story) {
      setError('Please fill in all required fields');
      return;
    }

    if (!destination) {
      setError('Please enter a destination');
      return;
    }

    setLoading(true);
    setUploading(true);

    try {
      setUploadProgress(10);
      const authorRes = await storiesApi.createAuthor({ name: author, whatsapp });
      setUploadProgress(20);

      const storyRes = await storiesApi.createStory({ 
        authorId: authorRes.id, 
        title, 
        destination, 
        text: story 
      });
      setUploadProgress(30);

      let uploaded = 30;
      const imageIncrement = images.length > 0 ? 40 / images.length : 0;
      
      for (const img of images) {
        await storiesApi.uploadStoryImage(storyRes.id, img);
        uploaded += imageIncrement;
        setUploadProgress(Math.min(uploaded, 70));
      }
      
      setUploadProgress(75);
      
      if (audioFile) {
        await storiesApi.uploadStoryAudio(storyRes.id, audioFile);
        setUploadProgress(90);
      }

      setUploadProgress(100);
      setSubmitted(true);
      setTimeout(() => navigate('/stories'), 3000);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Failed to submit story. Please try again.');
      setLoading(false);
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="px-4 py-10 md:px-8 bg-gradient-to-b from-white to-blue-50 min-h-screen pt-24 relative">
      <div className="absolute top-4 right-4 opacity-40"><LocalScene variant="breathing" size={150} /></div>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">📖 Share Your Adventure</h1>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">Help inspire other travelers by sharing your unforgettable journey with rich photos, text, and even your voice!</p>
        </div>

        <Card className="p-6 md:p-8 bg-white/95 shadow-xl rounded-2xl">
          {submitted ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">🎉 Story Submitted!</h2>
              <p className="text-gray-600 mb-1">Your story has been received and is pending review.</p>
              <p className="text-sm text-gray-500">You'll be notified via WhatsApp when it's approved. Redirecting…</p>
              {uploading && (
                <div className="mt-4 bg-blue-50 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2 text-sm">
                    <span className="font-medium text-blue-900">Upload Progress</span>
                    <span className="text-blue-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              )}

              {/* Personal Info Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">👤</span> Your Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Your Name *</label>
                    <input
                      type="text"
                      value={author}
                      onChange={(e) => setAuthor(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Amit Singh"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number *</label>
                    <input
                      type="tel"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+919900112233"
                    />
                  </div>
                </div>
              </div>

              {/* Story Details Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">✍️</span> Story Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Destination *</label>
                    <input
                      type="text"
                      value={destination}
                      onChange={(e) => setDestination(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., Hampi, Coorg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Story Title *</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                      className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="e.g., A Sunrise Over Ancient Ruins"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Your Story *</label>
                  <textarea
                    value={story}
                    onChange={(e) => setStory(e.target.value)}
                    required
                    rows={6}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tell us what made this trip unforgettable… Include details, emotions, and moments that stood out!"
                  />
                  <p className="text-xs text-gray-500 mt-1">{story.length} characters</p>
                </div>
              </div>

              {/* Media Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="text-xl">📸</span> Add Media
                </h3>

                {/* Photo Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos (up to 6)</label>
                  <div
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                      dragOverRef.current ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={onPickImages}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Click to upload</span> or drag and drop
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB ({images.length}/6)</p>
                    </div>
                  </div>

                  {imagePreviews.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreviews.map((preview, i) => (
                        <div key={i} className="relative group">
                          <img src={preview} alt="preview" className="w-full h-32 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(i)}
                            className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Audio Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Voice Narration (Optional)</label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      {!recording ? (
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={startRecording}
                          className="flex items-center gap-2"
                        >
                          <Mic className="w-4 h-4" />
                          Start Recording
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          variant="adventure"
                          onClick={stopRecording}
                          className="flex items-center gap-2 animate-pulse"
                        >
                          <MicOff className="w-4 h-4" />
                          Stop Recording ({formatTime(recordingTime)})
                        </Button>
                      )}
                      <p className="text-sm text-gray-600">or</p>
                      <input
                        type="file"
                        accept="audio/*"
                        onChange={onPickAudio}
                        className="text-sm"
                      />
                    </div>

                    {audioFile && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-blue-900">✓ Audio ready: {audioFile.name}</p>
                          <p className="text-xs text-blue-700">Size: {(audioFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        </div>
                        <button
                          type="button"
                          onClick={removeAudio}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              {uploading && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-blue-900">Uploading…</span>
                    <span className="text-sm font-medium text-blue-900">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={() => navigate(-1)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || uploading || !author || !whatsapp || !title || !story || !destination}
                  className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
                >
                  {loading ? 'Submitting...' : 'Submit Story'}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}

export default CreateStoryPage;
