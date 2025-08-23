import api from './api';

export interface CreateAuthorPayload {
  name: string;
  whatsapp: string;
}

export interface CreateStoryPayload {
  authorId: number | string;
  title: string;
  destination: string;
  text: string;
  images?: string[]; // optional client-provided references
}

export type StoryStatus = 'pending' | 'approved' | 'rejected';

export interface StoryItem {
  id: string;
  title: string;
  destination: string;
  text: string;
  images: string[];
  audioUrl?: string;
  authorName: string;
  avgRating: number;
  createdAt: string;
  status?: StoryStatus; // moderation status
  rejectionReason?: string | null;
  version?: number;
  approvedAt?: string | null;
  approvedBy?: string | null;
}

export const storiesApi = {
  createAuthor: (data: CreateAuthorPayload) => api.post('/stories/authors/', data).then(r => r.data),
  createStory: (data: CreateStoryPayload) => api.post('/stories/', { ...data, status: 'pending' }).then(r => r.data),
  uploadStoryImage: (storyId: string | number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/stories/${storyId}/images/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  uploadStoryAudio: (storyId: string | number, file: File) => {
    const form = new FormData();
    form.append('file', file);
    return api.post(`/stories/${storyId}/audio/`, form, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data);
  },
  listStories: (opts?: { includePending?: boolean }) => api.get('/stories/', { params: { include_pending: opts?.includePending || undefined } }).then(r => r.data as StoryItem[]),
  getStory: (id: string | number) => api.get(`/stories/${id}/`).then(r => r.data as StoryItem),
  rateStory: (storyId: string | number, value: number) => api.post(`/stories/${storyId}/rate/`, { value }).then(r => r.data),
  approveStory: (id: string | number) => api.post(`/stories/${id}/approve/`, {}).then(r => r.data),
  rejectStory: (id: string | number, reason: string) => api.post(`/stories/${id}/reject/`, { reason }).then(r => r.data),
};
