import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { storiesApi } from '../services/stories';
import { LocalScene } from '../components/3d/LocalScene';

export function CreateStoryPage() {
  const navigate = useNavigate();
  const [author, setAuthor] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [destination, setDestination] = useState('');
  const [title, setTitle] = useState('');
  const [story, setStory] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [recording, setRecording] = useState(false);

  const onPickImages = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(files.slice(0,6));
  };

  const onPickAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setAudioFile(file);
  };

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    const chunks: BlobPart[] = [];
    recorder.ondataavailable = (ev) => chunks.push(ev.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const file = new File([blob], 'story.webm', { type: 'audio/webm' });
      setAudioFile(file);
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author || !whatsapp || !title || !story) return;
    setLoading(true);
    try {
      const authorRes = await storiesApi.createAuthor({ name: author, whatsapp });
      const storyRes = await storiesApi.createStory({ authorId: authorRes.id, title, destination, text: story });

      for (const img of images) {
        await storiesApi.uploadStoryImage(storyRes.id, img);
      }
      if (audioFile) {
        await storiesApi.uploadStoryAudio(storyRes.id, audioFile);
      }
      setSubmitted(true);
      // Delay navigation so user sees moderation message
      setTimeout(() => navigate('/stories'), 2500);
    } catch (err) {
      console.error(err);
      alert('Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="px-4 py-10 md:px-8 bg-gradient-to-b from-white to-blue-50 min-h-screen pt-24 relative">
      <div className="absolute top-4 right-4 opacity-40"><LocalScene variant="breathing" size={150} /></div>
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900">Share Your Story</h1>
          <p className="text-gray-600 mt-2">Enter your name and WhatsApp number, add your story, photos and optional voice narration.</p>
        </div>

        <Card className="p-6 md:p-8 bg-white/90 shadow-xl rounded-2xl">
          {submitted ? (
            <div className="text-center py-8">
              <div className="text-2xl mb-2">🎉</div>
              <div className="font-semibold text-gray-900">Story submitted!</div>
              <div className="text-gray-600 text-sm">Your story is now pending review by an admin before it becomes visible.</div>
              <div className="mt-2 text-xs text-gray-500">You will be redirected shortly…</div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Your Name</label>
                  <input
                    type="text"
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., Amit"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                  <input
                    type="tel"
                    pattern="^[0-9+\-()\s]{8,15}$"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., +919900112233"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Destination</label>
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="e.g., Hampi, Coorg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                    className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                    placeholder="A memorable sunrise over the ruins"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Story</label>
                <textarea
                  value={story}
                  onChange={(e) => setStory(e.target.value)}
                  required
                  rows={6}
                  className="mt-1 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 outline-none focus:ring-2 focus:ring-blue-200"
                  placeholder="Tell us what made this trip unforgettable…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Photos (up to 6)</label>
                <input type="file" accept="image/*" multiple onChange={onPickImages} />
                {images.length > 0 && (
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {images.map((f, i) => (
                      <img key={i} src={URL.createObjectURL(f)} alt="preview" className="w-full h-24 object-cover rounded" />
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Voice narration (optional)</label>
                <div className="flex items-center gap-3">
                  {!recording ? (
                    <Button type="button" variant="secondary" onClick={startRecording}>Start Recording</Button>
                  ) : (
                    <Button type="button" variant="adventure" onClick={stopRecording}>Stop</Button>
                  )}
                  <input type="file" accept="audio/*" onChange={onPickAudio} />
                </div>
                {audioFile && <div className="mt-2 text-sm text-gray-600">Audio selected: {audioFile.name}</div>}
              </div>

              <div className="flex items-center justify-between">
                <Button type="button" variant="secondary" onClick={() => navigate(-1)}>Cancel</Button>
                <Button type="submit" loading={loading}>Submit Story</Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}

export default CreateStoryPage;
