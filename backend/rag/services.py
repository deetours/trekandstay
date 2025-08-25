import os
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any, Tuple
from dataclasses import dataclass
import logging
import requests
from datetime import datetime, timedelta
from .firestore_service import firestore_knowledge_service

logger = logging.getLogger(__name__)

@dataclass
class RAGQuery:
    query: str
    context: List[Dict[str, Any]]
    response: str

class RAGService:
    def __init__(self):
        # Initialize Chroma client
        self.chroma_client = chromadb.Client()
        
        # Lazy load sentence transformer for embeddings
        self._embedding_model = None
        
        # Create or get collection
        self.collection = self.chroma_client.get_or_create_collection(
            name="trek_knowledge",
            metadata={"description": "Trek and Stay knowledge base"}
        )
        
        # OpenRouter setup
        self.openrouter_api_key = os.getenv('OPENROUTER_API_KEY')
        if not self.openrouter_api_key:
            logger.warning("OPENROUTER_API_KEY not found in environment variables")
            
        # Track last sync time
        self.last_firestore_sync = None
        self.sync_interval = timedelta(hours=1)  # Sync every hour
        self._initialized = False
        
    def _ensure_initialized(self):
        """Ensure the knowledge base is initialized (lazy initialization)"""
        if not self._initialized:
            logger.info("Initializing knowledge base...")
            self._initialize_knowledge_base()
            self._initialized = True
    
    @property
    def embedding_model(self):
        """Lazy load the embedding model only when needed"""
        if self._embedding_model is None:
            logger.info("Loading SentenceTransformer model...")
            self._embedding_model = SentenceTransformer('all-MiniLM-L6-v2')
            logger.info("SentenceTransformer model loaded successfully")
        return self._embedding_model

    def _initialize_knowledge_base(self):
        """Initialize knowledge base with Firestore data or fallback to basic knowledge"""
        try:
            current_count = self.collection.count()
            
            if current_count == 0:
                logger.info("Empty knowledge base, attempting to sync from Firestore...")
                
                # Try to sync from Firestore first
                firestore_docs = firestore_knowledge_service.sync_all_knowledge()
                
                if firestore_docs:
                    logger.info(f"Found {len(firestore_docs)} documents in Firestore")
                    self.add_documents(firestore_docs)
                    self.last_firestore_sync = datetime.now()
                else:
                    logger.info("No Firestore data found, initializing with basic knowledge...")
                    self._initialize_basic_knowledge()
            else:
                logger.info(f"Knowledge base already has {current_count} documents")
                # Check if we need to sync updates from Firestore
                self._check_and_sync_firestore_updates()
                
        except Exception as e:
            logger.error(f"Error initializing knowledge base: {str(e)}")
            # Fallback to basic knowledge
            self._initialize_basic_knowledge()

    def _check_and_sync_firestore_updates(self):
        """Check if we need to sync updates from Firestore"""
        try:
            if not firestore_knowledge_service.is_connected():
                return
            
            # Check if enough time has passed since last sync
            if (self.last_firestore_sync is None or 
                datetime.now() - self.last_firestore_sync >= self.sync_interval):
                
                logger.info("Syncing updates from Firestore...")
                firestore_docs = firestore_knowledge_service.sync_all_knowledge()
                
                if firestore_docs:
                    # Add new documents (ChromaDB will handle duplicates)
                    self.add_documents(firestore_docs)
                    self.last_firestore_sync = datetime.now()
                    logger.info(f"Synced {len(firestore_docs)} documents from Firestore")
                
        except Exception as e:
            logger.error(f"Error syncing Firestore updates: {str(e)}")

    def _initialize_basic_knowledge(self):
        """Initialize with basic knowledge about Trek and Stay"""
        try:
            # Check if we already have documents
            current_count = self.collection.count()
            if current_count > 0:
                logger.info(f"Knowledge base already has {current_count} documents")
                return
                
            # Maharashtra 7 Days Trip FAQs (most important)
            maharashtra_faqs = [
                {
                    'id': 'maharashtra_cost',
                    'title': 'Maharashtra 7 Days Trip Cost',
                    'content': 'Q: What is the cost of Maharashtra 7 Days Trip?\nA: The total cost is ₹15,000/- per head. An advance of ₹2,000/- per head is required for booking (non-refundable).',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_dates',
                    'title': 'Maharashtra Trip Dates',
                    'content': 'Q: What are the trip dates for Explore Maharashtra 7 Days Trip?\nA: The trip is scheduled from August 12th to August 19th, 2025. Journey starts from Bengaluru on August 12th evening at 6:00 PM.',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_inclusions',
                    'title': 'Maharashtra Trip Inclusions',
                    'content': 'Q: What is included in the Maharashtra trip cost?\nA: ✅ AC travel from Bengaluru and back ✅ Accommodation on sharing basis (Hotels/Homestays) ✅ All meals (Veg/Non-veg) ✅ Entry fees to waterfalls, forts, temples ✅ Guide charges ✅ Trek leader and first-aid assistance',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_treks',
                    'title': 'Maharashtra Trek Details',
                    'content': 'Q: What treks are included in Maharashtra trip?\nA: Day 2: Savlya Ghat & Kumbhe Waterfall – Easy (2+2 km). Day 3: Devkund, Nanemachi, Satsada, Shevate Waterfalls – Easy to Moderate (6+6 km). Day 5: Kalu Waterfall & Adra Jungle Trek – Easy to Moderate (4+4 km). All treks are beginner-friendly.',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_packing',
                    'title': 'Maharashtra Trip Packing List',
                    'content': 'Q: What should I carry for Maharashtra trip?\nA: Trekking shoes with good grip, comfortable trekking clothes, raincoat/poncho (monsoon season), water bottle (1-2 liters), small backpack, personal medicines, power bank, camera, and ID proof.',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_weather',
                    'title': 'Maharashtra Weather in August',
                    'content': 'Q: What is the weather like in August in Maharashtra?\nA: Expect monsoon conditions – pleasant temperatures (18–25°C), frequent rain, lush greenery, and misty views. Our treks are planned with safety in mind during monsoons.',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_booking',
                    'title': 'How to Book Maharashtra Trip',
                    'content': 'Q: How do I book my seat for Maharashtra 7 Days Trip?\nA: 1. Pay the ₹2,000/- booking advance via UPI/Bank Transfer 2. Share payment proof and your ID details 3. Receive confirmation & trip checklist',
                    'type': 'maharashtra_faq'
                },
                {
                    'id': 'maharashtra_highlights',
                    'title': 'Maharashtra Trip Highlights',
                    'content': 'Q: What are the main highlights of Maharashtra 7 Days Trip?\nA: 10+ breathtaking waterfalls including Devkund, Kalu, Nanemachi, Bhandardara Reverse Waterfall. Historical forts like Rajmachi Fort. Temples like Bhimashankar, Trimbakeshwar. Scenic treks and jungle trails. Monsoon special misty mountains & lush greenery.',
                    'type': 'maharashtra_faq'
                },
                # Maharashtra Waterfall Edition 5 Days Trip (Aug 13-17, 2025)
                {
                    'id': 'maharashtra_5day_cost',
                    'title': 'Maharashtra 5 Days Waterfall Trip Cost',
                    'content': 'Q: What is the cost of Maharashtra 5 Days Waterfall Trip?\nA: The total cost is ₹9,000/- per head. Booking advance: ₹2,000/- per head (non-refundable). Contact: 9902937730',
                    'type': 'maharashtra_5day_faq'
                },
                {
                    'id': 'maharashtra_5day_dates',
                    'title': 'Maharashtra 5 Days Trip Dates',
                    'content': 'Q: What are the dates for Maharashtra Waterfall Edition 5 Days Trip?\nA: August 13-17, 2025. Journey starts from Bengaluru on August 13th evening at 6:00 PM. Returns to Bengaluru on August 17th evening.',
                    'type': 'maharashtra_5day_faq'
                },
                {
                    'id': 'maharashtra_5day_waterfalls',
                    'title': 'Maharashtra 5 Days Waterfall Details',
                    'content': 'Q: Which waterfalls are covered in the 5-day trip?\nA: Day 2: Nanemachi, Satsada, Shevate Waterfalls (2+2 km, Easy). Day 3: Devkund, Kumbhe, Secret Waterfall (6+6 km, Easy to Moderate). Day 4: Kalu Waterfall (4+4 km, Easy to Moderate).',
                    'type': 'maharashtra_5day_faq'
                },
                {
                    'id': 'maharashtra_5day_itinerary',
                    'title': 'Maharashtra 5 Days Trip Itinerary',
                    'content': 'Q: What is the detailed itinerary for 5 days trip?\nA: Day 1: 6 PM departure from Bengaluru to Pune/Satara. Day 2: Reach Pune/Satara, travel to waterfalls (Nanemachi, Satsada, Shevate). Day 3: Devkund, Kumbhe, Secret Waterfall, then 6-hour journey to next destination. Day 4: Kalu Waterfall, afternoon journey to Pune, night return to Bengaluru. Day 5: Reach Bengaluru by evening.',
                    'type': 'maharashtra_5day_faq'
                },
                {
                    'id': 'maharashtra_5day_inclusions',
                    'title': 'Maharashtra 5 Days Trip Inclusions',
                    'content': 'Q: What is included in Maharashtra 5 Days trip?\nA: ✅ Accommodation: Tent Stay/Dormitory stay/Shared Room ✅ Transportation: Tempo Traveller/Mini bus ✅ All waterfall entry fees ✅ Professional guide assistance ✅ Safety equipment and first-aid support',
                    'type': 'maharashtra_5day_faq'
                }
            ]
            
            # General company info
            basic_docs = [
                {
                    'id': 'about_company',
                    'title': 'About Trek and Stay',
                    'content': 'Trek and Stay is a premier adventure travel company specializing in trekking and outdoor experiences in Maharashtra and other beautiful locations across India. We offer guided treks, camping, and adventure activities for all skill levels.',
                    'type': 'company_info'
                },
                {
                    'id': 'booking_process',
                    'title': 'How to Book',
                    'content': 'Booking with Trek and Stay is easy: 1) Browse our trips and select your adventure, 2) Click Book Now and fill in your details, 3) Make payment via UPI, card, or bank transfer, 4) Receive confirmation and trip details via email/WhatsApp, 5) Pack your bags and get ready for adventure!',
                    'type': 'booking_info'
                },
                {
                    'id': 'safety_guidelines',
                    'title': 'Safety Guidelines',
                    'content': 'Your safety is our priority. We provide: experienced guides, first aid kits, safety briefings, proper equipment checks, emergency communication devices, and comprehensive insurance coverage. We follow all safety protocols and guidelines for outdoor activities.',
                    'type': 'safety_info'
                },
                {
                    'id': 'what_to_pack',
                    'title': 'General Packing Essentials',
                    'content': 'Essential items for trekking: sturdy hiking boots, comfortable clothing (layers recommended), water bottle, headlamp/flashlight, personal medications, sunscreen, hat, rain gear, backpack, sleeping bag (if camping), energy snacks, and personal hygiene items.',
                    'type': 'packing_info'
                },
                {
                    'id': 'contact_info',
                    'title': 'Contact Information',
                    'content': 'Get in touch with Trek and Stay: WhatsApp support available 24/7, email support for detailed queries, phone support during business hours. We are responsive and ready to help plan your perfect adventure.',
                    'type': 'contact_info'
                }
            ]
            
            # Combine Maharashtra FAQs with general info (Maharashtra FAQs first for priority)
            all_docs = maharashtra_faqs + basic_docs
            
            logger.info("Initializing knowledge base with Maharashtra FAQs (7-day & 5-day trips) and basic information...")
            self.add_documents(all_docs)
            logger.info(f"Knowledge initialized with {len(all_docs)} documents ({len(maharashtra_faqs)} Maharashtra FAQs + {len(basic_docs)} general info)")
            
        except Exception as e:
            logger.error(f"Error initializing basic knowledge: {str(e)}")
            
    def add_documents(self, documents: List[Dict[str, Any]]) -> None:
        """Add documents to the vector store"""
        try:
            logger.info(f"Starting to add {len(documents)} documents")
            for doc in documents:
                # Create embedding
                text = doc.get('content', '')
                if not text:
                    logger.warning(f"Document {doc.get('id')} has no content, skipping")
                    continue
                    
                logger.info(f"Creating embedding for document {doc.get('id')}")
                embedding = self.embedding_model.encode(text).tolist()
                
                # Add to Chroma
                self.collection.add(
                    embeddings=[embedding],
                    documents=[text],
                    metadatas=[{
                        'title': doc.get('title', ''),
                        'type': doc.get('type', 'general'),
                        'id': str(doc.get('id', ''))
                    }],
                    ids=[f"doc_{doc.get('id', len(self.collection.peek()['ids']) + 1)}"]
                )
                
            logger.info(f"Successfully added {len(documents)} documents to vector store")
            
        except Exception as e:
            logger.error(f"Error adding documents: {str(e)}")
            raise
    
    def search_similar(self, query: str, n_results: int = 5) -> List[Dict[str, Any]]:
        """Search for similar documents"""
        try:
            # Ensure the service is initialized
            self._ensure_initialized()
            
            # Create query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Search in Chroma
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=n_results,
                include=['documents', 'metadatas', 'distances']
            )
            
            # Format results
            similar_docs = []
            for i, doc in enumerate(results['documents'][0]):
                similar_docs.append({
                    'content': doc,
                    'metadata': results['metadatas'][0][i],
                    'similarity': 1 - results['distances'][0][i]  # Convert distance to similarity
                })
            
            return similar_docs
            
        except Exception as e:
            logger.error(f"Error searching documents: {str(e)}")
            return []
    
    def generate_response(self, query: str, context: List[Dict[str, Any]]) -> str:
        """Generate response using OpenRouter API"""
        try:
            if not self.openrouter_api_key:
                return "Sorry, the AI assistant is temporarily unavailable."
            
            # Prepare context from similar documents
            context_text = "\n\n".join([
                f"Title: {doc['metadata'].get('title', 'N/A')}\nContent: {doc['content'][:500]}..."
                for doc in context[:3]  # Use top 3 most similar
            ])
            
            # Create prompt
            prompt = f"""You are a helpful assistant for Trek and Stay, specializing in Maharashtra trek packages. Always provide SPECIFIC, PRECISE information from the context. Never give generic or vague responses.

INSTRUCTIONS:
1. If asked about Maharashtra trip details, provide exact information including costs, trek names, distances, and specifics
2. Give direct answers with specific numbers, names, and details
3. If the context contains the exact information, provide it immediately
4. For costs, durations, or specifications, give exact figures from the context
5. Never say "check with the company" if the information is available in the context

Context:
{context_text}

Question: {query}

Provide a SPECIFIC, DETAILED response using exact information from the context. Include numbers, costs, trek names, and precise details:"""

            # Call OpenRouter API
            response = requests.post(
                "https://openrouter.ai/api/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.openrouter_api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": "anthropic/claude-3-haiku",  # Fast and cost-effective
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "max_tokens": 800,
                    "temperature": 0.3  # Lower temperature for more precise, factual responses
                }
            )
            
            if response.status_code == 200:
                response_data = response.json()
                return response_data['choices'][0]['message']['content']
            else:
                logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                return "Sorry, I'm having trouble processing your request right now."
                
        except Exception as e:
            logger.error(f"Error generating response: {str(e)}")
            return "Sorry, something went wrong while processing your question."
    
    def query(self, user_query: str) -> RAGQuery:
        """Main RAG pipeline with auto-sync check"""
        # Ensure the service is initialized
        self._ensure_initialized()
        
        # Check for Firestore updates before processing query
        self._check_and_sync_firestore_updates()
        
        # Search for relevant documents
        context = self.search_similar(user_query, n_results=5)
        
        # Generate response
        response = self.generate_response(user_query, context)
        
        return RAGQuery(
            query=user_query,
            context=context,
            response=response
        )
    
    def force_sync_firestore(self) -> Dict[str, Any]:
        """Force sync with Firestore and return stats"""
        try:
            if not firestore_knowledge_service.is_connected():
                return {
                    'status': 'error',
                    'message': 'Firestore not connected',
                    'synced_count': 0
                }
            
            # Get current count
            before_count = self.collection.count()
            
            # Sync from Firestore
            firestore_docs = firestore_knowledge_service.sync_all_knowledge()
            
            if firestore_docs:
                self.add_documents(firestore_docs)
                self.last_firestore_sync = datetime.now()
            
            after_count = self.collection.count()
            
            # Get Firestore stats
            firestore_stats = firestore_knowledge_service.get_knowledge_stats()
            
            return {
                'status': 'success',
                'message': f'Successfully synced from Firestore',
                'before_count': before_count,
                'after_count': after_count,
                'synced_count': len(firestore_docs),
                'firestore_stats': firestore_stats,
                'last_sync': self.last_firestore_sync.isoformat() if self.last_firestore_sync else None
            }
            
        except Exception as e:
            logger.error(f"Error forcing Firestore sync: {str(e)}")
            return {
                'status': 'error',
                'message': str(e),
                'synced_count': 0
            }
    
    def initialize_with_trips_data(self, trips_data: List[Dict[str, Any]]) -> None:
        """Initialize vector store with trips/stories data"""
        documents = []
        
        for trip in trips_data:
            # Add main trip info
            documents.append({
                'id': f"trip_{trip.get('id', '')}",
                'title': trip.get('title', ''),
                'content': f"Trip: {trip.get('title', '')}\n"
                         f"Location: {trip.get('location', '')}\n"
                         f"Duration: {trip.get('duration', '')} days\n"
                         f"Price: {trip.get('price', '')}\n"
                         f"Description: {trip.get('description', '')}\n"
                         f"Highlights: {', '.join(trip.get('highlights', []))}\n"
                         f"Included: {', '.join(trip.get('included', []))}\n"
                         f"Difficulty: {trip.get('difficulty', '')}",
                'type': 'trip'
            })
            
            # Add itinerary details
            for day, activities in trip.get('itinerary', {}).items():
                if activities:
                    documents.append({
                        'id': f"itinerary_{trip.get('id', '')}_{day}",
                        'title': f"{trip.get('title', '')} - {day}",
                        'content': f"Day activities for {trip.get('title', '')} on {day}: {activities}",
                        'type': 'itinerary'
                    })
        
        self.add_documents(documents)

# Global RAG service instance
rag_service = RAGService()
