import os
import json
import requests
from typing import List, Dict, Any, Tuple
from datetime import datetime
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class MultiModelLLMService:
    """
    Multi-Model LLM Service supporting:
    - Kimi K2: Classification & rewrites (temp 0.0-0.2)
    - MiniMax-M2: Retrieval & planning (temp 0.0-0.3)
    - Grok: Persona & multi-turn chat (temp 0.2-0.7)
    - Qwen: Longform & summarization (temp 0.1-0.3)
    """
    
    # Model configurations
    MODELS = {
        'kimi-k2': {
            'id': 'kimi-k2',
            'use_case': 'classification, rewrites',
            'temperature': 0.1,
            'max_tokens': 128,
            'description': 'Best for: Classification, intent detection, message rewrites'
        },
        'minimax-m2': {
            'id': 'minimax-text-large',
            'use_case': 'retrieval, planning',
            'temperature': 0.15,
            'max_tokens': 512,
            'description': 'Best for: Retrieval augmented responses, plan generation'
        },
        'grok': {
            'id': 'grok-beta',
            'use_case': 'persona, multi-turn',
            'temperature': 0.4,
            'max_tokens': 1024,
            'description': 'Best for: Personalized messages, conversational AI'
        },
        'qwen': {
            'id': 'qwen-plus',
            'use_case': 'longform, summarization',
            'temperature': 0.2,
            'max_tokens': 2048,
            'description': 'Best for: Long messages, summarization, detailed responses'
        }
    }
    
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY', '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')
        self.base_url = 'https://openrouter.ai/api/v1'
        self.current_model = 'grok'  # Default model
    
    def select_model_for_task(self, task_type: str) -> str:
        """
        Select best model based on task type
        
        task_type options:
        - 'classify': Intent classification (use Kimi K2)
        - 'retrieve': RAG retrieval (use MiniMax-M2)
        - 'personalize': Personalized messages (use Grok)
        - 'summarize': Long content (use Qwen)
        - 'default': General (use Grok)
        """
        
        model_map = {
            'classify': 'kimi-k2',
            'retrieve': 'minimax-m2',
            'personalize': 'grok',
            'summarize': 'qwen',
            'default': 'grok'
        }
        
        return model_map.get(task_type, 'grok')
    
    def classify_intent(self, message: str) -> Dict[str, Any]:
        """
        Classify user intent using Kimi K2
        Returns: intent, confidence, category
        """
        
        model = self.MODELS['kimi-k2']
        
        system_prompt = """You are an intent classifier for Trek & Stay chatbot.
Classify user messages into one of these intents:
- trip_inquiry: User asking about trips
- booking: User wants to book
- pricing: User asking about prices
- support: User needs help
- feedback: User providing feedback
- other: Anything else

Response format: {"intent": "...", "confidence": 0.0-1.0, "category": "..."}
"""
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'HTTP-Referer': 'https://trekandstay.com',
                    'X-Title': 'Trek & Stay Chatbot'
                },
                json={
                    'model': model['id'],
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': message}
                    ],
                    'temperature': model['temperature'],
                    'max_tokens': model['max_tokens'],
                    'top_p': 0.95
                },
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            response_text = result['choices'][0]['message']['content']
            
            # Parse JSON response
            try:
                classification = json.loads(response_text)
                return {
                    'success': True,
                    'data': classification,
                    'model': model['id']
                }
            except json.JSONDecodeError:
                return {
                    'success': True,
                    'data': {'intent': 'other', 'confidence': 0.5},
                    'model': model['id']
                }
        
        except Exception as e:
            logger.error(f"Classification error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'data': {'intent': 'other', 'confidence': 0.0}
            }
    
    def generate_personalized_message(self, template: str, user_data: Dict, context: str = '') -> Dict[str, Any]:
        """
        Generate personalized message using Grok
        Perfect for marketing campaigns and user-specific responses
        """
        
        model = self.MODELS['grok']
        
        system_prompt = f"""You are Trek & Stay's AI assistant creating personalized messages.
User Profile: {json.dumps(user_data)}

Guidelines:
- Be warm, personal, and engaging
- Reference specific user preferences/history
- Use emojis appropriately
- Keep it concise but impactful
- Always include a call-to-action

Context: {context}
"""
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'HTTP-Referer': 'https://trekandstay.com',
                    'X-Title': 'Trek & Stay Chatbot'
                },
                json={
                    'model': model['id'],
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': f"Create personalized message based on: {template}"}
                    ],
                    'temperature': model['temperature'],
                    'max_tokens': model['max_tokens'],
                    'top_p': 0.95
                },
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            message = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'message': message,
                'model': model['id']
            }
        
        except Exception as e:
            logger.error(f"Message generation error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'message': template
            }
    
    def generate_campaign_message(self, campaign_brief: str, audience: str = 'general') -> Dict[str, Any]:
        """
        Generate marketing campaign message using Qwen
        Great for detailed, persuasive messages
        """
        
        model = self.MODELS['qwen']
        
        system_prompt = """You are a expert marketing copywriter for Trek & Stay.
Create compelling WhatsApp marketing messages that:
- Hook with curiosity or emotion
- Highlight benefits clearly
- Include a clear call-to-action
- Use line breaks for readability
- Are 2-3 paragraphs max

Target audience: {audience}
"""
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'HTTP-Referer': 'https://trekandstay.com',
                    'X-Title': 'Trek & Stay Chatbot'
                },
                json={
                    'model': model['id'],
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': campaign_brief}
                    ],
                    'temperature': model['temperature'],
                    'max_tokens': model['max_tokens'],
                    'top_p': 0.95
                },
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            message = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'campaign_message': message,
                'model': model['id']
            }
        
        except Exception as e:
            logger.error(f"Campaign message error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def generate_ai_response(self, user_message: str, context: str = '', user_data: Dict = None) -> Dict[str, Any]:
        """
        Generate AI response for chat
        Uses MiniMax-M2 for retrieval-augmented responses
        """
        
        model = self.MODELS['minimax-m2']
        
        user_info = ''
        if user_data:
            user_info = f"\nUser: {user_data.get('name', 'Friend')}, interests: {', '.join(user_data.get('interests', []))}"
        
        system_prompt = f"""You are Trek & Stay's friendly AI assistant.
Help users book transformational retreats.

Available Information:
{context}

{user_info}

Guidelines:
- Be warm and supportive
- Provide specific trip recommendations when relevant
- Use emojis to add personality
- Keep responses concise
- Always offer next steps
"""
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'HTTP-Referer': 'https://trekandstay.com',
                    'X-Title': 'Trek & Stay Chatbot'
                },
                json={
                    'model': model['id'],
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': user_message}
                    ],
                    'temperature': model['temperature'],
                    'max_tokens': model['max_tokens'],
                    'top_p': 0.95
                },
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            ai_message = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'message': ai_message,
                'model': model['id']
            }
        
        except Exception as e:
            logger.error(f"AI response error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def rewrite_for_tone(self, text: str, tone: str = 'friendly') -> Dict[str, Any]:
        """
        Rewrite text with different tone using Kimi K2
        Tones: friendly, professional, persuasive, casual
        """
        
        model = self.MODELS['kimi-k2']
        
        system_prompt = f"""Rewrite the following text in a {tone} tone.
Keep the core message but adjust the style.
Return only the rewritten text."""
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'HTTP-Referer': 'https://trekandstay.com',
                    'X-Title': 'Trek & Stay Chatbot'
                },
                json={
                    'model': model['id'],
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': text}
                    ],
                    'temperature': model['temperature'],
                    'max_tokens': model['max_tokens'],
                    'top_p': 0.95
                },
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            rewritten = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'original': text,
                'rewritten': rewritten,
                'tone': tone,
                'model': model['id']
            }
        
        except Exception as e:
            logger.error(f"Rewrite error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'original': text
            }
    
    def summarize_content(self, content: str, length: str = 'brief') -> Dict[str, Any]:
        """
        Summarize long content using Qwen
        length: 'brief' (50 words), 'medium' (150 words), 'detailed' (300 words)
        """
        
        model = self.MODELS['qwen']
        
        lengths = {
            'brief': '50 words',
            'medium': '150 words',
            'detailed': '300 words'
        }
        
        system_prompt = f"""Summarize the following content in approximately {lengths.get(length, '100 words')}.
Keep key information, remove fluff.
Return only the summary."""
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers={
                    'Authorization': f'Bearer {self.api_key}',
                    'HTTP-Referer': 'https://trekandstay.com',
                    'X-Title': 'Trek & Stay Chatbot'
                },
                json={
                    'model': model['id'],
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': content}
                    ],
                    'temperature': model['temperature'],
                    'max_tokens': model['max_tokens'],
                    'top_p': 0.95
                },
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            summary = result['choices'][0]['message']['content']
            
            return {
                'success': True,
                'summary': summary,
                'original_length': len(content.split()),
                'model': model['id']
            }
        
        except Exception as e:
            logger.error(f"Summarization error: {str(e)}")
            return {
                'success': False,
                'error': str(e)
            }
    
    def get_available_models(self) -> Dict[str, Any]:
        """Get all available models with their capabilities"""
        
        return {
            'models': self.MODELS,
            'total': len(self.MODELS),
            'current_default': self.current_model
        }


class RAGChatbotService:
    """
    RAG-powered Chatbot Service
    Combines Multi-Model LLM with context retrieval
    """
    
    def __init__(self):
        self.llm_service = MultiModelLLMService()
    
    def chat_with_context(self, user_message: str, context: List[Dict], user_data: Dict = None) -> Dict[str, Any]:
        """
        Send message with RAG context and multi-model LLM
        
        Process:
        1. Classify intent (Kimi K2)
        2. Generate context-aware response (MiniMax-M2)
        3. Personalize if needed (Grok)
        4. Cache conversation
        """
        
        try:
            # Step 1: Classify intent
            intent_result = self.llm_service.classify_intent(user_message)
            intent = intent_result.get('data', {}).get('intent', 'other')
            
            # Step 2: Generate response with context
            context_str = self._format_context(context)
            response_result = self.llm_service.generate_ai_response(
                user_message,
                context_str,
                user_data
            )
            
            if not response_result['success']:
                return {
                    'success': False,
                    'error': response_result['error'],
                    'timestamp': datetime.now().isoformat()
                }
            
            # Step 3: Cache conversation
            if user_data:
                self._cache_conversation(
                    str(user_data.get('id', 'anonymous')),
                    user_message,
                    response_result['message']
                )
            
            return {
                'success': True,
                'message': response_result['message'],
                'intent': intent,
                'suggested_actions': self._get_suggested_actions(intent),
                'model': response_result['model'],
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Chat error: {str(e)}")
            return {
                'success': False,
                'error': str(e),
                'timestamp': datetime.now().isoformat()
            }
    
    def _format_context(self, context: List[Dict]) -> str:
        """Format context documents for LLM"""
        
        if not context:
            return "No specific context available."
        
        formatted = "Available Information:\n"
        for doc in context[:3]:  # Top 3 docs
            formatted += f"- {doc.get('content', '')}\n"
        
        return formatted
    
    def _get_suggested_actions(self, intent: str) -> List[str]:
        """Get suggested actions based on intent"""
        
        actions_map = {
            'trip_inquiry': ['🔍 Browse Trips', '❤️ View Favorites', '💰 Check Prices'],
            'booking': ['💳 Complete Booking', '📝 View Details', '❓ Booking Help'],
            'pricing': ['💰 View Pricing', '🎁 Check Offers', '📞 Contact Sales'],
            'support': ['📞 Chat Support', '💬 WhatsApp', '📧 Email Us'],
            'feedback': ['⭐ Rate Us', '💬 More Feedback', '👍 Thank You'],
            'other': ['🏠 Home', '🔍 Explore', '💬 Ask More']
        }
        
        return actions_map.get(intent, actions_map['other'])
    
    def _cache_conversation(self, user_id: str, user_msg: str, bot_msg: str):
        """Cache conversation for future context"""
        
        cache_key = f'chat_history_{user_id}'
        history = cache.get(cache_key, [])
        
        history.append({
            'user': user_msg,
            'bot': bot_msg,
            'timestamp': datetime.now().isoformat()
        })
        
        # Keep only last 20 messages
        history = history[-20:]
        cache.set(cache_key, history, 86400)  # 24 hours
