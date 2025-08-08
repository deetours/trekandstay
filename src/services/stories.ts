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
}

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
}

export const storiesApi = {
  createAuthor: (data: CreateAuthorPayload) => api.post('/stories/authors/', data).then(r => r.data),
  createStory: (data: CreateStoryPayload) => api.post('/stories/', data).then(r => r.data),
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
  listStories: () => api.get('/stories/').then(r => r.data as StoryItem[]),
  getStory: (id: string | number) => api.get(`/stories/${id}/`).then(r => r.data as StoryItem),
  rateStory: (storyId: string | number, value: number) => api.post(`/stories/${storyId}/rate/`, { value }).then(r => r.data),
};
