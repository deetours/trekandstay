import React, { useEffect, useState } from 'react';
import { collection, addDoc, onSnapshot, deleteDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/useToast';

interface TripForm {
  title: string; // admin input
  location: string;
  price: number;
  shortDescription: string; // mapped to description
  days: number; // mapped to duration
  difficulty: string;
  active: boolean;
  images: string; // comma separated URLs
  tags: string; // comma separated tags
  highlights: string; // comma separated highlights
  routes: string; // e.g. "Bangalore|14999, Pune|13999"
}

interface Trip extends Omit<TripForm, 'tags'> {
  id: string;
  createdAt?: { seconds: number; nanoseconds: number } | Date;
  duration?: number; // Legacy field
  tags?: string[] | string; // Can be array or comma-separated string
}

const emptyForm: TripForm = {
  title: '',
  location: '',
  price: 0,
  shortDescription: '',
  days: 1,
  difficulty: 'Easy',
  active: true,
  images: '',
  tags: '',
  highlights: '',
  routes: ''
};

const AdminTripsPage: React.FC = () => {
  const [form, setForm] = useState<TripForm>(emptyForm);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { error: toastError, success } = useToast();

  // Real-time listener
  useEffect(() => {
    if (!db) return; // Firestore unavailable
    const colRef = collection(db, 'trips');
    const unsub = onSnapshot(colRef, snapshot => {
      const data: Trip[] = snapshot.docs.map(d => ({ id: d.id, ...d.data() }) as Trip);
      setTrips(data.sort((a,b) => {
        const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : (a.createdAt?.seconds || 0) * 1000;
        const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : (b.createdAt?.seconds || 0) * 1000;
        return aTime - bTime;
      }));
    }, err => {
      console.warn('Trips snapshot error', err);
      toastError({ title: 'Failed to load trips', description: err instanceof Error ? err.message : 'Unknown error' });
    });
    return () => unsub();
  }, [toastError]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : (name === 'price' || name === 'days' ? Number(value) : value) }));
  };

  const reset = () => { setForm(emptyForm); setEditingId(null); };

  const save = async () => {
    if (!form.title.trim()) return;
    if (!db) {
      toastError({ title: 'Firestore unavailable', description: 'Cannot save trip right now.' });
      return;
    }
    setLoading(true);
    try {
      const payload = {
        title: form.title,
        name: form.title,
        location: form.location,
        price: form.price,
        shortDescription: form.shortDescription,
        description: form.shortDescription,
        days: form.days,
        duration: `${form.days} Day${form.days>1? 's':''}`,
        difficulty: form.difficulty,
        active: form.active,
        images: form.images.split(',').map(s=>s.trim()).filter(Boolean),
        tags: form.tags.split(',').map(s=>s.trim()).filter(Boolean),
        highlights: form.highlights.split(',').map(s=>s.trim()).filter(Boolean),
        routeOptions: form.routes.split(',').map(r=>r.trim()).filter(Boolean).map(r=>{
          const [label, priceStr] = r.split(/\||:/);
          return { label: (label||'').trim(), price: Number((priceStr||'').trim())||0 };
        }).filter(o=>o.label)
      };
      if (editingId) {
        await updateDoc(doc(db, 'trips', editingId), payload);
        success({ title: 'Trip updated', description: '' });
      } else {
        await addDoc(collection(db, 'trips'), { ...payload, createdAt: serverTimestamp() });
        success({ title: 'Trip created', description: '' });
      }
      reset();
    } catch (e) {
      console.error('Save failed', e);
      toastError({ title: 'Save failed', description: e instanceof Error ? e.message : 'Unknown error' });
    } finally {
      setLoading(false);
    }
  };

  const edit = (trip: Trip) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, createdAt, duration, ...rest } = trip;
    const formData: TripForm = {
      ...rest,
      tags: Array.isArray(trip.tags) ? trip.tags.join(', ') : (trip.tags || ''),
    };
    setForm(formData);
    setEditingId(id);
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this trip?')) return;
    if (!db) {
      toastError({ title: 'Firestore unavailable', description: 'Cannot delete trip right now.' });
      return;
    }
    try {
      await deleteDoc(doc(db, 'trips', id));
      success({ title: 'Trip deleted', description: '' });
    } catch (e) {
      console.error('Delete failed', e);
      toastError({ title: 'Delete failed', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Trips Management</h1>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white rounded-xl shadow p-5 border border-emerald-100">
          <h2 className="text-xl font-semibold mb-4">{editingId ? 'Edit Trip' : 'Add New Trip'}</h2>
          <div className="space-y-3">
            <input name="title" placeholder="Title" value={form.title} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            <input name="location" placeholder="Location" value={form.location} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            <input name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            <input name="days" type="number" placeholder="Days" value={form.days} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            <select name="difficulty" value={form.difficulty} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm">
              <option>Easy</option>
              <option>Moderate</option>
              <option>Hard</option>
            </select>
            <textarea name="shortDescription" placeholder="Short Description" value={form.shortDescription} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm min-h-[80px]" />
            <textarea name="images" placeholder="Image URLs (comma separated)" value={form.images} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm min-h-[60px]" />
            <input name="tags" placeholder="Tags (comma separated)" value={form.tags} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm" />
            <textarea name="highlights" placeholder="Highlights (comma separated)" value={form.highlights} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm min-h-[60px]" />
            <textarea name="routes" placeholder="Routes (City|Price comma separated) e.g. Bangalore|14999, Pune|13999" value={form.routes} onChange={handleChange} className="w-full border rounded px-3 py-2 text-sm min-h-[60px]" />
            <label className="flex items-center gap-2 text-sm"><input name="active" type="checkbox" checked={form.active} onChange={handleChange} /> Active</label>
            <div className="flex gap-2 pt-2">
              <Button onClick={save} disabled={loading} variant="adventure" size="sm" className="flex-1">{loading ? 'Saving...' : (editingId ? 'Update' : 'Create')}</Button>
              {editingId && <Button onClick={reset} size="sm" variant="secondary">Cancel</Button>}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          {trips.map(t => (
            <div key={t.id} className="bg-white border border-emerald-100 rounded-xl shadow p-4 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {t.title}
                  {!t.active && <span className="text-xs bg-gray-200 rounded px-2 py-0.5">Draft</span>}
                </h3>
                <p className="text-sm text-gray-500 line-clamp-2">{t.shortDescription}</p>
                <div className="text-xs text-gray-400 mt-1">{t.location} · {t.days || t.duration} · {t.difficulty} · ₹{t.price}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {(Array.isArray(t.tags) ? t.tags : (typeof t.tags === 'string' ? t.tags.split(',').map(s => s.trim()).filter(Boolean) : [])).map((tag: string) => (
                    <span key={tag} className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="secondary" onClick={() => edit(t)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => remove(t.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {trips.length === 0 && <div className="text-sm text-gray-500">No trips yet.</div>}
        </div>
      </div>
    </main>
  );
};

export default AdminTripsPage;
