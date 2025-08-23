from django.urls import path
from . import views

app_name = 'rag'

# RAG API endpoints
urlpatterns = [
    path('chat/', views.chat_query, name='chat_query'),
    path('initialize/', views.initialize_knowledge_base, name='initialize_knowledge_base'),
    path('health/', views.chat_health, name='chat_health'),
    
    # Firestore management endpoints
    path('sync-firestore/', views.sync_firestore, name='sync_firestore'),
    path('firestore-stats/', views.firestore_stats, name='firestore_stats'),
    path('test-faqs/', views.test_firestore_faqs, name='test_firestore_faqs'),
]
