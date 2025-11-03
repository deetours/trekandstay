import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Loader } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface TripUploadResult {
  success: boolean;
  created: number;
  updated: number;
  errors: string[];
  trips: Array<{ name: string; status: string }>;
}

export const SimpleTripUploader: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<TripUploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/upload-trips/', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      setResult(data);
      setFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = `# SIMPLE TRIP FORMAT - Just copy this format for each trip
# Lines starting with # are comments and ignored

---TRIP---
NAME: Your Trip Name
LOCATION: City, State
PRICE: 5999
DURATION: 2 Days 1 Night
DIFFICULTY: Easy
CATEGORY: adventure
DESCRIPTION: A brief description of your trip experience.
HIGHLIGHTS: Highlight 1 | Highlight 2 | Highlight 3
AVAILABLE_SEATS: 15
IMAGE: https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800

---TRIP---
NAME: Another Trip
LOCATION: Another Place
PRICE: 7999
DURATION: 3 Days 2 Nights
DIFFICULTY: Moderate
CATEGORY: trekking
DESCRIPTION: Another amazing adventure waiting for you.
HIGHLIGHTS: Mountain Views | Camping | Local Food
AVAILABLE_SEATS: 12
IMAGE: https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800

# ADD MORE TRIPS - Just copy the format above
`;

    const blob = new Blob([template], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'trip_template.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl font-oswald font-bold text-forest-green mb-2">
          Simple Trip Uploader
        </h2>
        <p className="text-gray-600">
          Upload trips using a simple text file - No coding required!
        </p>
      </div>

      {/* Instructions Card */}
      <Card className="p-6 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start space-x-3">
          <FileText className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="font-bold text-blue-900 mb-2">How to Use:</h3>
            <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
              <li>Download the template file below</li>
              <li>Open it in Notepad or any text editor</li>
              <li>Fill in your trip details (Name, Price, Location, etc.)</li>
              <li>Copy the format for multiple trips</li>
              <li>Save the file and upload it here</li>
            </ol>
          </div>
        </div>
      </Card>

      {/* Download Template */}
      <div className="text-center">
        <Button
          variant="secondary"
          size="lg"
          onClick={downloadTemplate}
          className="font-semibold"
        >
          <FileText className="w-5 h-5 mr-2" />
          Download Template File
        </Button>
      </div>

      {/* Upload Section */}
      <Card className="p-8">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-adventure-orange transition-colors">
            <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <input
              type="file"
              accept=".txt"
              onChange={handleFileChange}
              className="hidden"
              id="trip-file-upload"
            />
            <label
              htmlFor="trip-file-upload"
              className="cursor-pointer text-adventure-orange font-semibold hover:underline"
            >
              Click to select file
            </label>
            <p className="text-sm text-gray-500 mt-2">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">Only .txt files accepted</p>
          </div>

          {file && (
            <div className="flex items-center justify-between bg-gray-100 p-4 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <span className="font-medium text-gray-700">{file.name}</span>
              </div>
              <button
                onClick={() => setFile(null)}
                className="text-red-600 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
          )}

          <Button
            variant="adventure"
            size="lg"
            onClick={handleUpload}
            disabled={!file || uploading}
            className="w-full font-semibold"
          >
            {uploading ? (
              <>
                <Loader className="w-5 h-5 mr-2 animate-spin" />
                Uploading Trips...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-2" />
                Upload & Create Trips
              </>
            )}
          </Button>
        </div>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="p-4 bg-red-50 border-2 border-red-200">
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-red-900">Upload Error</h4>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </Card>
      )}

      {/* Success Result */}
      {result && result.success && (
        <Card className="p-6 bg-green-50 border-2 border-green-200">
          <div className="flex items-start space-x-3 mb-4">
            <CheckCircle className="w-6 h-6 text-green-600 mt-0.5" />
            <div>
              <h4 className="font-bold text-green-900 text-lg">
                Upload Successful! 🎉
              </h4>
              <p className="text-sm text-green-700 mt-1">
                {result.created} trips created • {result.updated} trips updated
              </p>
            </div>
          </div>

          {result.trips && result.trips.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="font-semibold text-green-900 text-sm mb-2">
                Trips Processed:
              </h5>
              <div className="max-h-64 overflow-y-auto space-y-1">
                {result.trips.map((trip, idx) => (
                  <div
                    key={idx}
                    className="flex items-center space-x-2 text-sm bg-white p-2 rounded"
                  >
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="font-medium text-gray-700">{trip.name}</span>
                    <span className="text-xs text-gray-500">({trip.status})</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Example Format */}
      <Card className="p-6 bg-gray-50">
        <h3 className="font-bold text-gray-900 mb-3">Example Format:</h3>
        <pre className="text-xs bg-white p-4 rounded border overflow-x-auto">
{`---TRIP---
NAME: Agumbe Rainforest Trek
LOCATION: Agumbe, Karnataka
PRICE: 4999
DURATION: 2 Days 1 Night
DIFFICULTY: Easy
CATEGORY: rainforest
DESCRIPTION: Experience the lush Western Ghats...
HIGHLIGHTS: Sunset Point | King Cobra Territory | Camping
AVAILABLE_SEATS: 15
IMAGE: https://images.unsplash.com/photo-xxx?w=800`}
        </pre>
      </Card>

      {/* Categories & Difficulties */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-4">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">Valid Categories:</h4>
          <div className="flex flex-wrap gap-2">
            {['adventure', 'trekking', 'beach', 'mountain', 'waterfall', 'heritage', 'wilderness', 'river', 'plantation', 'rainforest'].map(cat => (
              <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {cat}
              </span>
            ))}
          </div>
        </Card>

        <Card className="p-4">
          <h4 className="font-bold text-gray-900 mb-2 text-sm">Valid Difficulties:</h4>
          <div className="flex flex-wrap gap-2">
            {['Easy', 'Moderate', 'Challenging', 'Extreme'].map(diff => (
              <span key={diff} className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs">
                {diff}
              </span>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};
