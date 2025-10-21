import { QuizQuestion } from '../types';

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'What drains you most right now?',
    subtext: '(No judgment. We\'ve all been there.)',
    type: 'visual',
    options: [
      { id: 'phone', label: 'My Phone', icon: 'Smartphone', value: 'digital_overload' },
      { id: 'work', label: 'My Job', icon: 'Briefcase', value: 'burnout' },
      { id: 'loneliness', label: 'Feeling Disconnected', icon: 'Users', value: 'disconnection' },
      { id: 'purpose', label: 'Lack of Purpose', icon: 'Compass', value: 'searching' }
    ]
  },
  {
    id: 'q2',
    question: 'When you imagine a perfect day off...',
    type: 'visual',
    options: [
      { 
        id: 'nature', 
        label: 'Silent forest walk', 
        image: 'https://images.pexels.com/photos/1563356/pexels-photo-1563356.jpeg?auto=compress&cs=tinysrgb&w=400',
        value: 'nature_seeker'
      },
      { 
        id: 'spa', 
        label: 'Spa & meditation', 
        image: 'https://images.pexels.com/photos/3822906/pexels-photo-3822906.jpeg?auto=compress&cs=tinysrgb&w=400',
        value: 'wellness_focused'
      },
      { 
        id: 'adventure', 
        label: 'Mountain trekking', 
        image: 'https://images.pexels.com/photos/618833/pexels-photo-618833.jpeg?auto=compress&cs=tinysrgb&w=400',
        value: 'adventure_seeker'
      }
    ]
  },
  {
    id: 'q3',
    question: 'How do you travel best?',
    type: 'text',
    options: [
      { id: 'solo', label: 'Solo - I need space to think', value: 'solo' },
      { id: 'couple', label: 'With my partner', value: 'couple' },
      { id: 'small', label: 'Small group (6-8 people)', value: 'small_group' },
      { id: 'dont_mind', label: "I don't mind, just get me out", value: 'flexible' }
    ]
  },
  {
    id: 'q4',
    question: 'What sounds more healing right now?',
    type: 'text',
    options: [
      { id: 'silence', label: 'Complete silence & solitude', value: 'silence' },
      { id: 'conversations', label: 'Deep conversations with strangers', value: 'community' },
      { id: 'movement', label: 'Physical movement & adventure', value: 'active' },
      { id: 'guidance', label: 'Guided meditation & workshops', value: 'structured' }
    ]
  },
  {
    id: 'q5',
    question: 'How much time can you give yourself?',
    type: 'text',
    options: [
      { id: 'weekend', label: '2-3 days (Weekend escape)', value: 'weekend' },
      { id: 'week', label: '5-7 days (Full reset)', value: 'week' },
      { id: 'extended', label: '10-14 days (Deep transformation)', value: 'extended' }
    ]
  },
  {
    id: 'q6',
    question: "What's your comfort zone with phones?",
    type: 'text',
    options: [
      { id: 'full_detox', label: 'Lock it away. I need the break.', value: 'full_detox' },
      { id: 'limited', label: 'Limited access (1 hour/day)', value: 'limited' },
      { id: 'available', label: 'I need to stay reachable', value: 'available' }
    ]
  },
  {
    id: 'q7',
    question: 'If this trip could give you one thing...',
    type: 'text',
    options: [
      { id: 'clarity', label: 'Clarity on my life direction', value: 'clarity' },
      { id: 'peace', label: 'Inner peace & calm', value: 'peace' },
      { id: 'connection', label: 'Deeper connection (to self or partner)', value: 'connection' },
      { id: 'energy', label: 'Energy & motivation to return', value: 'energy' }
    ]
  }
];