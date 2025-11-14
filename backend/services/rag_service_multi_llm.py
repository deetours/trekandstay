import os
import json
import requests
from typing import List, Dict, Any, Optional
from datetime import datetime
from django.core.cache import cache
import logging

logger = logging.getLogger(__name__)

class MultiLLMRAGService:
    """
    Multi-LLM RAG Service with OpenRouter
    
    Models:
    - Kimi K2: Classification, rewrites (temp: 0.0-0.2, tokens: 128)
    - MiniMax-M2: Retrieval stitching, planning (temp: 0.0-0.3, tokens: 512)
    - Grok: Persona, multi-turn chat (temp: 0.2-0.7, tokens: 512-1024)
    - Qwen: Polishing, summarization (temp: 0.1-0.3, tokens: 1024-2048)
    """
    
    def __init__(self):
        self.api_key = os.getenv('OPENROUTER_API_KEY')
        self.base_url = os.getenv('OPENROUTER_BASE_URL', 'https://openrouter.ai/api/v1')
        
        # Model configurations with optimal parameters
        self.models = {
            'kimi_k2': {
                'name': 'kimi-k2',
                'display_name': 'Kimi K2',
                'temperature': 0.1,  # Mid-range for classification
                'max_tokens': 128,
                'use_case': 'classification, rewrites, intent detection',
                'price_per_million': 0.15
            },
            'minimax_m2': {
                'name': 'minimax-m2',
                'display_name': 'MiniMax-M2',
                'temperature': 0.2,
                'max_tokens': 512,
                'use_case': 'retrieval stitching, plan generation',
                'price_per_million': 0.2
            },
            'grok': {
                'name': 'grok-beta',
                'display_name': 'Grok',
                'temperature': 0.5,  # Mid-range for conversational
                'max_tokens': 800,
                'use_case': 'persona, multi-turn chat, engaging responses',
                'price_per_million': 0.5
            },
            'qwen': {
                'name': 'qwen/qwen-32b-instruct',
                'display_name': 'Qwen',
                'temperature': 0.2,
                'max_tokens': 1500,
                'use_case': 'polishing, summarization, detailed content',
                'price_per_million': 0.25
            }
        }
        
        self.current_model_key = 'grok'  # Default for conversational
    
    def generate_whatsapp_message(self, template: str, context: Dict, use_case: str = 'conversation') -> Dict[str, Any]:
        """
        Generate WhatsApp message using appropriate model
        
        Args:
            template: Message template with placeholders
            context: Context data for message generation
            use_case: 'classification', 'planning', 'conversation', 'summarization'
        
        Returns:
            Generated message with metadata
        """
        
        # Select model based on use case
        model_key = self._select_model_for_use_case(use_case)
        model_config = self.models[model_key]
        
        # Build prompt
        prompt = self._build_message_prompt(template, context, use_case)
        
        try:
            # Call LLM
            response = self._call_llm(
                model_config['name'],
                prompt,
                temperature=model_config['temperature'],
                max_tokens=model_config['max_tokens']
            )
            
            if not response['success']:
                return {'success': False, 'error': response.get('error')}
            
            message_text = response['message']
            
            return {
                'success': True,
                'message': message_text,
                'model': model_config['display_name'],
                'model_key': model_key,
                'use_case': use_case,
                'tokens_used': response.get('tokens_used', 0),
                'cost_estimate': response.get('cost_estimate', 0),
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error generating WhatsApp message: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def generate_personalized_campaign_message(self, 
                                               campaign_data: Dict,
                                               recipient_data: Dict) -> Dict[str, Any]:
        """
        Generate personalized WhatsApp campaign message
        
        Args:
            campaign_data: {
                'template': 'Hey {name}, ...',
                'tone': 'friendly', 'professional', 'casual'
                'include_emojis': True
            }
            recipient_data: {
                'name': 'Raj',
                'interests': ['yoga', 'wellness'],
                'previous_trips': ['Himalayan Retreat'],
                'booking_count': 2,
                'budget_range': '30000-50000'
            }
        
        Returns:
            Personalized message
        """
        
        try:
            # Use Grok for personalized conversation
            model_config = self.models['grok']
            
            # Build personalization prompt
            prompt = f"""Generate a WhatsApp message for {recipient_data.get('name', 'Friend')}:

Campaign Template: {campaign_data.get('template', '')}
Tone: {campaign_data.get('tone', 'friendly')}
Include Emojis: {campaign_data.get('include_emojis', True)}

Recipient Profile:
- Interests: {', '.join(recipient_data.get('interests', []))}
- Previous Trips: {', '.join(recipient_data.get('previous_trips', []))}
- Booking Count: {recipient_data.get('booking_count', 0)}
- Budget Range: ₹{recipient_data.get('budget_range', 'flexible')}

Generate a personalized, engaging WhatsApp message that:
1. Addresses the person by name
2. References their interests and history
3. Feels natural and conversational
4. Includes relevant emojis
5. Has a clear call-to-action
6. Fits in 1-2 WhatsApp messages (max 300 characters each)

Respond with just the message text, no explanations."""

            response = self._call_llm(
                model_config['name'],
                prompt,
                temperature=0.6,  # Slightly higher for creativity
                max_tokens=300
            )
            
            if not response['success']:
                return {'success': False, 'error': response.get('error')}
            
            return {
                'success': True,
                'message': response['message'],
                'recipient': recipient_data.get('name'),
                'model': 'Grok',
                'personalized': True,
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error generating personalized message: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def classify_user_intent(self, user_message: str) -> Dict[str, Any]:
        """
        Classify user intent using Kimi K2 (fast, accurate classification)
        
        Returns intent and confidence
        """
        
        try:
            model_config = self.models['kimi_k2']
            
            prompt = f"""Classify the user intent in this WhatsApp message:

Message: "{user_message}"

Intent options: trip_inquiry, booking, pricing, complaint, wellness, support, other

Respond with ONLY: [INTENT_NAME] [confidence_0-1]

Example: trip_inquiry 0.95"""

            response = self._call_llm(
                model_config['name'],
                prompt,
                temperature=0.1,  # Very low for consistent classification
                max_tokens=50
            )
            
            if not response['success']:
                return {'success': False, 'error': response.get('error')}
            
            # Parse response
            try:
                parts = response['message'].strip().split()
                intent = parts[0].lower() if parts else 'other'
                confidence = float(parts[1]) if len(parts) > 1 else 0.5
            except:
                intent = 'other'
                confidence = 0.5
            
            return {
                'success': True,
                'intent': intent,
                'confidence': confidence,
                'model': 'Kimi K2',
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error classifying intent: {str(e)}")
            return {'success': False, 'error': str(e), 'intent': 'other'}
    
    def plan_user_response(self, user_message: str, context: List[Dict]) -> Dict[str, Any]:
        """
        Plan response strategy using MiniMax M2
        
        Returns response plan with steps
        """
        
        try:
            model_config = self.models['minimax_m2']
            
            prompt = f"""Plan a response strategy for this WhatsApp user message:

User Message: "{user_message}"

Context (previous messages):
{json.dumps(context[-3:], indent=2) if context else 'None'}

Generate a response plan that includes:
1. Primary response message
2. Follow-up action if needed
3. Alternative if user needs more help

Keep response concise and actionable."""

            response = self._call_llm(
                model_config['name'],
                prompt,
                temperature=0.2,
                max_tokens=400
            )
            
            if not response['success']:
                return {'success': False, 'error': response.get('error')}
            
            return {
                'success': True,
                'plan': response['message'],
                'model': 'MiniMax-M2',
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error planning response: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def summarize_conversation(self, messages: List[Dict]) -> Dict[str, Any]:
        """
        Summarize WhatsApp conversation using Qwen
        
        Returns conversation summary and key points
        """
        
        try:
            model_config = self.models['qwen']
            
            # Format messages
            formatted_msgs = "\n".join([
                f"{msg['sender']}: {msg['text']}"
                for msg in messages[-10:]  # Last 10 messages
            ])
            
            prompt = f"""Summarize this WhatsApp conversation:

{formatted_msgs}

Provide:
1. Conversation summary (1-2 sentences)
2. Key points (bullet list)
3. User sentiment (positive/neutral/negative)
4. Recommended follow-up action"""

            response = self._call_llm(
                model_config['name'],
                prompt,
                temperature=0.2,
                max_tokens=1000
            )
            
            if not response['success']:
                return {'success': False, 'error': response.get('error')}
            
            return {
                'success': True,
                'summary': response['message'],
                'model': 'Qwen',
                'message_count': len(messages),
                'timestamp': datetime.now().isoformat()
            }
        
        except Exception as e:
            logger.error(f"Error summarizing conversation: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def _select_model_for_use_case(self, use_case: str) -> str:
        """Select best model for specific use case"""
        
        use_case_map = {
            'classification': 'kimi_k2',
            'planning': 'minimax_m2',
            'conversation': 'grok',
            'summarization': 'qwen',
            'personalization': 'grok',
            'campaign': 'grok',
            'rewrite': 'kimi_k2',
            'detailed': 'qwen'
        }
        
        return use_case_map.get(use_case.lower(), 'grok')
    
    def _build_message_prompt(self, template: str, context: Dict, use_case: str) -> str:
        """Build prompt for message generation"""
        
        base_prompt = f"""Generate a WhatsApp message based on this template:

Template: {template}

Context:
{json.dumps(context, indent=2)}

Requirements:
1. Keep it under 300 characters (fits in 1-2 WhatsApp messages)
2. Use conversational tone
3. Include relevant emojis
4. Make it personalized
5. Add clear call-to-action if applicable

Use case: {use_case}

Respond with just the message text."""
        
        return base_prompt
    
    def _call_llm(self, model_name: str, prompt: str, temperature: float, max_tokens: int) -> Dict:
        """Call OpenRouter LLM API"""
        
        headers = {
            'Authorization': f'Bearer {self.api_key}',
            'Content-Type': 'application/json',
            'HTTP-Referer': 'https://trekandstay.com',
            'X-Title': 'Trek & Stay WhatsApp AI'
        }
        
        payload = {
            'model': model_name,
            'messages': [
                {'role': 'user', 'content': prompt}
            ],
            'temperature': temperature,
            'max_tokens': max_tokens,
            'top_p': 0.9,
        }
        
        try:
            response = requests.post(
                f'{self.base_url}/chat/completions',
                headers=headers,
                json=payload,
                timeout=30
            )
            response.raise_for_status()
            
            result = response.json()
            message = result['choices'][0]['message']['content']
            tokens_used = result.get('usage', {}).get('total_tokens', 0)
            
            return {
                'success': True,
                'message': message,
                'tokens_used': tokens_used,
                'cost_estimate': (tokens_used / 1000000) * 0.0001  # Rough estimate
            }
        
        except requests.exceptions.RequestException as e:
            logger.error(f"OpenRouter API Error: {str(e)}")
            return {'success': False, 'error': str(e)}
    
    def get_model_info(self) -> Dict:
        """Get information about all available models"""
        
        return {
            'models': self.models,
            'current_model': self.current_model_key,
            'current_model_config': self.models[self.current_model_key]
        }
    
    def set_current_model(self, model_key: str) -> bool:
        """Set default model for operations"""
        
        if model_key in self.models:
            self.current_model_key = model_key
            return True
        return False
    
    def cache_conversation(self, phone: str, user_msg: str, bot_msg: str, metadata: Dict = None):
        """Cache conversation for history and analysis"""
        
        cache_key = f'whatsapp_conversation_{phone}'
        history = cache.get(cache_key, [])
        
        entry = {
            'user': user_msg,
            'bot': bot_msg,
            'timestamp': datetime.now().isoformat(),
            'metadata': metadata or {}
        }
        
        history.append(entry)
        history = history[-100:]  # Keep last 100 messages
        
        cache.set(cache_key, history, 86400 * 30)  # 30 days
    
    def get_conversation_history(self, phone: str) -> List[Dict]:
        """Get cached conversation history"""
        
        cache_key = f'whatsapp_conversation_{phone}'
        return cache.get(cache_key, [])
