import os
import threading
from typing import List, Tuple, Dict, Any
from sentence_transformers import SentenceTransformer
import numpy as np
from .models import Embedding, Trip, Story, ChatFAQ

_MODEL = None
_MODEL_LOCK = threading.Lock()
_CACHE = {
    'matrix': None,        # numpy array (N, D)
    'meta': [],            # list of dicts with object_type, object_id, text
    'id_index': {},        # (object_type, object_id) -> row idx
}

DEFAULT_MODEL = os.getenv('EMBEDDING_MODEL', 'sentence-transformers/all-MiniLM-L6-v2')


def load_model():
    global _MODEL
    if _MODEL is None:
        with _MODEL_LOCK:
            if _MODEL is None:
                _MODEL = SentenceTransformer(DEFAULT_MODEL)
    return _MODEL


def embed_texts(texts: List[str]):
    model = load_model()
    return model.encode(texts, show_progress_bar=False, normalize_embeddings=True).tolist()


def rebuild_cache():
    rows = list(Embedding.objects.all().order_by('id').values('id', 'object_type', 'object_id', 'text', 'vector'))
    if not rows:
        _CACHE['matrix'] = np.zeros((0, 384), dtype='float32')
        _CACHE['meta'] = []
        _CACHE['id_index'] = {}
        return
    matrix = np.array([r['vector'] for r in rows], dtype='float32')
    meta = [{'object_type': r['object_type'], 'object_id': r['object_id'], 'text': r['text']} for r in rows]
    id_index = {(r['object_type'], r['object_id']): idx for idx, r in enumerate(rows)}
    _CACHE['matrix'] = matrix
    _CACHE['meta'] = meta
    _CACHE['id_index'] = id_index


def upsert_embedding(object_type: str, object_id: int, text: str):
    vec = embed_texts([text])[0]
    obj, created = Embedding.objects.update_or_create(
        object_type=object_type,
        object_id=object_id,
        defaults={'text': text, 'vector': vec}
    )
    # update single row in cache (simple approach: rebuild all for correctness)
    rebuild_cache()
    return obj


def build_all_embeddings():
    items: List[Tuple[str, int, str]] = []
    for trip in Trip.objects.all():
        combined = ' '.join(filter(None, [trip.name, trip.description, ' '.join(trip.location.split()), ' '.join(trip.highlights or [])]))
        items.append(('trip', trip.id, combined[:4000]))
    for story in Story.objects.all():
        combined = ' '.join(filter(None, [story.title, story.destination, story.text]))
        items.append(('story', story.id, combined[:4000]))
    for faq in ChatFAQ.objects.all():
        combined = ' '.join(filter(None, [faq.question, faq.answer, ' '.join(faq.tags or [])]))
        items.append(('faq', faq.id, combined[:4000]))

    if not items:
        rebuild_cache()
        return 0
    texts = [t[2] for t in items]
    vectors = embed_texts(texts)
    for (object_type, object_id, text), vec in zip(items, vectors):
        Embedding.objects.update_or_create(
            object_type=object_type,
            object_id=object_id,
            defaults={'text': text, 'vector': vec}
        )
    rebuild_cache()
    return len(items)


def semantic_search(query: str, top_k: int = 5):
    if not query.strip():
        return []
    if _CACHE['matrix'] is None:
        rebuild_cache()
    if _CACHE['matrix'].shape[0] == 0:
        return []
    q_vec = np.array(embed_texts([query])[0], dtype='float32')
    # cosine similarity (vectors normalized already)
    sims = (_CACHE['matrix'] @ q_vec).tolist()  # shape (N,)
    scored = []
    for idx, score in enumerate(sims):
        m = _CACHE['meta'][idx]
        scored.append({
            'object_type': m['object_type'],
            'object_id': m['object_id'],
            'score_vec': float(score),
            'text': m['text'][:400],
        })
    scored.sort(key=lambda x: x['score_vec'], reverse=True)
    return scored[:top_k]
