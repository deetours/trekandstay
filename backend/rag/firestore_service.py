import os
import json
import logging
from typing import List, Dict, Any, Optional
from datetime import datetime
import firebase_admin
from firebase_admin import credentials, firestore
from django.conf import settings

logger = logging.getLogger(__name__)

class FirestoreKnowledgeService:
    """Service for automatically syncing knowledge base with Firestore"""
    
    def __init__(self):
        self.db = None
        self._init_attempted = False
        # Lazy init; defer until first use to avoid startup failures
    
    def _initialize_firestore(self):
        """Initialize Firestore connection (idempotent, non-fatal)."""
        if self._init_attempted and self.db:
            return
        self._init_attempted = True
        try:
            try:
                firebase_admin.get_app()
            except ValueError:
                service_account_path = os.getenv('FIREBASE_SERVICE_ACCOUNT_PATH')
                sa_json_env = os.getenv('FIREBASE_SERVICE_ACCOUNT_JSON')
                logger.debug(f"Attempting Firestore init. PATH env={service_account_path} exists={os.path.exists(service_account_path) if service_account_path else None} inline_json={'yes' if sa_json_env else 'no'}")
                if service_account_path and os.path.exists(service_account_path):
                    cred = credentials.Certificate(service_account_path)
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase initialized with service account file")
                elif sa_json_env:
                    cred = credentials.Certificate(json.loads(sa_json_env))
                    firebase_admin.initialize_app(cred)
                    logger.info("Firebase initialized with inline JSON")
                else:
                    logger.warning("Skipping Firestore init: no credentials provided (set FIREBASE_SERVICE_ACCOUNT_PATH or FIREBASE_SERVICE_ACCOUNT_JSON).")
                    return
            self.db = firestore.client()
            logger.info("Firestore client initialized")
        except Exception as e:
            logger.error(f"Firestore init failed: {e}")
            self.db = None
    
    def is_connected(self) -> bool:
        """Check if Firestore is properly connected"""
        if not self.db:
            self._initialize_firestore()
        return self.db is not None
    
    def sync_faqs(self) -> List[Dict[str, Any]]:
        """Fetch FAQs from Firestore and format for knowledge base"""
        if not self.is_connected():
            logger.warning("Firestore not connected, skipping FAQ sync")
            return []
        
        try:
            faqs = []
            # Fetch FAQs from 'faqs' collection
            faq_docs = self.db.collection('faqs').get()
            
            for doc in faq_docs:
                data = doc.to_dict()
                if data.get('active', True):  # Only include active FAQs
                    faqs.append({
                        'id': f"faq_{doc.id}",
                        'title': data.get('question', 'FAQ'),
                        'content': f"Q: {data.get('question', '')}\nA: {data.get('answer', '')}",
                        'type': 'faq',
                        'category': data.get('category', 'general'),
                        'priority': data.get('priority', 1),
                        'last_updated': data.get('updated_at', datetime.now())
                    })
            
            logger.info(f"Synced {len(faqs)} FAQs from Firestore")
            return faqs
            
        except Exception as e:
            logger.error(f"Error syncing FAQs: {str(e)}")
            return []
    
    def sync_trip_data(self) -> List[Dict[str, Any]]:
        """Fetch trip/destination data from Firestore"""
        if not self.is_connected():
            logger.warning("Firestore not connected, skipping trips sync")
            return []
        
        try:
            trips = []
            # Fetch trips from 'trips' or 'destinations' collection
            trip_docs = self.db.collection('trips').get()
            
            for doc in trip_docs:
                data = doc.to_dict()
                if data.get('status') == 'active':
                    trips.append({
                        'id': f"trip_fs_{doc.id}",
                        'title': data.get('title', 'Trip'),
                        'content': self._format_trip_content(data),
                        'type': 'trip_info',
                        'location': data.get('location', ''),
                        'difficulty': data.get('difficulty', 'moderate'),
                        'duration': data.get('duration', ''),
                        'price': data.get('price', ''),
                        'last_updated': data.get('updated_at', datetime.now())
                    })
            
            logger.info(f"Synced {len(trips)} trips from Firestore")
            return trips
            
        except Exception as e:
            logger.error(f"Error syncing trips: {str(e)}")
            return []
    
    def sync_policies_and_guidelines(self) -> List[Dict[str, Any]]:
        """Fetch company policies, guidelines, and general info"""
        if not self.is_connected():
            logger.warning("Firestore not connected, skipping policies sync")
            return []
        
        try:
            policies = []
            # Fetch from 'company_info' or 'policies' collection
            policy_docs = self.db.collection('company_info').get()
            
            for doc in policy_docs:
                data = doc.to_dict()
                if data.get('active', True):
                    policies.append({
                        'id': f"policy_{doc.id}",
                        'title': data.get('title', 'Company Policy'),
                        'content': data.get('content', ''),
                        'type': data.get('type', 'policy'),
                        'category': data.get('category', 'general'),
                        'last_updated': data.get('updated_at', datetime.now())
                    })
            
            logger.info(f"Synced {len(policies)} policies from Firestore")
            return policies
            
        except Exception as e:
            logger.error(f"Error syncing policies: {str(e)}")
            return []
    
    def sync_customer_reviews(self) -> List[Dict[str, Any]]:
        """Fetch customer reviews and testimonials"""
        if not self.is_connected():
            logger.warning("Firestore not connected, skipping reviews sync")
            return []
        
        try:
            reviews = []
            # Fetch from 'reviews' or 'testimonials' collection
            review_docs = self.db.collection('reviews').where('rating', '>=', 4).limit(20).get()
            
            for doc in review_docs:
                data = doc.to_dict()
                if data.get('approved', False):
                    reviews.append({
                        'id': f"review_{doc.id}",
                        'title': f"Customer Review - {data.get('trip_name', 'Trek Experience')}",
                        'content': f"Customer {data.get('customer_name', 'Anonymous')} said: \"{data.get('review_text', '')}\"\nRating: {data.get('rating', 5)}/5 stars\nTrip: {data.get('trip_name', 'N/A')}",
                        'type': 'customer_review',
                        'rating': data.get('rating', 5),
                        'trip_name': data.get('trip_name', ''),
                        'last_updated': data.get('created_at', datetime.now())
                    })
            
            logger.info(f"Synced {len(reviews)} reviews from Firestore")
            return reviews
            
        except Exception as e:
            logger.error(f"Error syncing reviews: {str(e)}")
            return []
    
    def _format_trip_content(self, trip_data: Dict[str, Any]) -> str:
        """Format trip data into searchable content"""
        content_parts = []
        
        content_parts.append(f"Trip: {trip_data.get('title', '')}")
        
        if trip_data.get('location'):
            content_parts.append(f"Location: {trip_data.get('location')}")
        
        if trip_data.get('duration'):
            content_parts.append(f"Duration: {trip_data.get('duration')}")
        
        if trip_data.get('difficulty'):
            content_parts.append(f"Difficulty: {trip_data.get('difficulty')}")
        
        if trip_data.get('price'):
            content_parts.append(f"Price: {trip_data.get('price')}")
        
        if trip_data.get('description'):
            content_parts.append(f"Description: {trip_data.get('description')}")
        
        if trip_data.get('highlights'):
            highlights = trip_data.get('highlights')
            if isinstance(highlights, list):
                content_parts.append(f"Highlights: {', '.join(highlights)}")
            else:
                content_parts.append(f"Highlights: {highlights}")
        
        if trip_data.get('included'):
            included = trip_data.get('included')
            if isinstance(included, list):
                content_parts.append(f"Included: {', '.join(included)}")
            else:
                content_parts.append(f"Included: {included}")
        
        if trip_data.get('itinerary'):
            itinerary = trip_data.get('itinerary')
            if isinstance(itinerary, dict):
                itinerary_text = []
                for day, day_data in itinerary.items():
                    if isinstance(day_data, dict):
                        # Handle detailed day structure
                        day_info = f"{day}: {day_data.get('title', '')}"
                        if day_data.get('waterfalls'):
                            waterfalls = [wf.get('name', '') for wf in day_data.get('waterfalls', []) if isinstance(wf, dict)]
                            if waterfalls:
                                day_info += f" - Waterfalls: {', '.join(waterfalls)}"
                        if day_data.get('trek_distance'):
                            day_info += f" - Distance: {day_data.get('trek_distance')}"
                        if day_data.get('difficulty') and day_data.get('difficulty') != 'none':
                            day_info += f" - Difficulty: {day_data.get('difficulty')}"
                        itinerary_text.append(day_info)
                    else:
                        # Handle simple day structure
                        itinerary_text.append(f"{day}: {day_data}")
                content_parts.append(f"Itinerary: {' | '.join(itinerary_text)}")
            elif isinstance(itinerary, str):
                content_parts.append(f"Itinerary: {itinerary}")
        
        # Add waterfall information if available
        if trip_data.get('waterfall_list'):
            waterfalls = trip_data.get('waterfall_list')
            if isinstance(waterfalls, list):
                content_parts.append(f"Waterfalls: {', '.join(waterfalls)}")
        
        # Add total trek distance if available
        if trip_data.get('total_trek_distance'):
            content_parts.append(f"Total Trek Distance: {trip_data.get('total_trek_distance')}")
        
        # Add inclusions if available
        if trip_data.get('inclusions'):
            inclusions = trip_data.get('inclusions')
            if isinstance(inclusions, list):
                content_parts.append(f"Inclusions: {', '.join(inclusions)}")
        
        # Add contact information
        if trip_data.get('contact'):
            content_parts.append(f"Contact: {trip_data.get('contact')}")
        
        # Add cost information  
        if trip_data.get('cost'):
            content_parts.append(f"Cost: {trip_data.get('cost')}")
        
        if trip_data.get('advance'):
            content_parts.append(f"Advance: {trip_data.get('advance')}")
        
        # Add dates
        if trip_data.get('dates'):
            content_parts.append(f"Dates: {trip_data.get('dates')}")
        
        # Add tags for better searchability
        if trip_data.get('tags'):
            tags = trip_data.get('tags')
            if isinstance(tags, list):
                content_parts.append(f"Tags: {', '.join(tags)}")
        
        return '\n'.join(content_parts)
    
    def sync_all_knowledge(self) -> List[Dict[str, Any]]:
        """Sync all knowledge from Firestore"""
        if not self.is_connected():
            logger.warning("Firestore not connected, returning empty knowledge list")
            return []
        
        all_knowledge = []
        
        # Sync different types of data
        all_knowledge.extend(self.sync_faqs())
        all_knowledge.extend(self.sync_trip_data())
        all_knowledge.extend(self.sync_policies_and_guidelines())
        all_knowledge.extend(self.sync_customer_reviews())
        
        logger.info(f"Total knowledge synced from Firestore: {len(all_knowledge)} documents")
        return all_knowledge
    
    def get_knowledge_stats(self) -> Dict[str, int]:
        """Get statistics about knowledge base content"""
        if not self.is_connected():
            return {}
        
        try:
            stats = {}
            
            # Count documents in each collection
            stats['faqs'] = len(self.db.collection('faqs').get())
            stats['trips'] = len(self.db.collection('trips').get())
            stats['company_info'] = len(self.db.collection('company_info').get())
            stats['reviews'] = len(self.db.collection('reviews').get())
            
            return stats
            
        except Exception as e:
            logger.error(f"Error getting knowledge stats: {str(e)}")
            return {}

# Global instance
firestore_knowledge_service = FirestoreKnowledgeService()
