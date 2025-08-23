import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { db } from '../../firebase';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp } from 'firebase/firestore';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/useToast';

interface ItemForm { day: number; title: string; description: string; }
interface Item extends ItemForm { id: string; }

const empty: ItemForm = { day:1, title:'', description:'' };

const AdminItineraryPage: React.FC = () => {
  const { id } = useParams();
  const tripId = id!;
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<ItemForm>(empty);
  const [editing, setEditing] = useState<string|null>(null);
  const { success } = useToast();

  useEffect(() => {
    if (!db) return;
    const q = query(collection(db, 'trips', tripId, 'itinerary'), orderBy('day', 'asc'));
    const unsub = onSnapshot(q, snap => {
      setItems(snap.docs.map(d => ({ id: d.id, ...d.data() }) as Item));
    });
    return () => unsub();
  }, [tripId]);

  const change = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) => {
    const target = e.target as HTMLInputElement | HTMLTextAreaElement;
    const { name, value } = target;
    setForm(f=>({...f,[name]: name==='day'? Number(value): value }));
  };
  const reset = () => { setForm(empty); setEditing(null); };
  const save = async () => {
    if (!form.title.trim()) return;
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot save itinerary step.' });
      return;
    }
    const payload = { ...form, updatedAt: serverTimestamp() };
    if (editing) await updateDoc(doc(db, 'trips', tripId, 'itinerary', editing), payload);
    else await addDoc(collection(db, 'trips', tripId, 'itinerary'), { ...payload, createdAt: serverTimestamp() });
    success({ title: editing ? 'Step updated' : 'Step added', description: '' });
    reset();
  };
  const remove = async (itemId: string) => {
    if (!confirm('Delete step?')) return;
    if (!db) {
      success({ title: 'Firestore not available', description: 'Cannot delete itinerary step.' });
      return;
    }
    await deleteDoc(doc(db, 'trips', tripId, 'itinerary', itemId));
    success({ title: 'Deleted', description: '' });
  };

  return (
    <main className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Itinerary Builder</h1>
        <Link to="/admin/trips"><Button variant="secondary" size="sm">Back to Trips</Button></Link>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white p-5 rounded-xl border shadow">
          <h2 className="font-semibold mb-4">{editing? 'Edit Step':'Add Step'}</h2>
            <input name="day" type="number" value={form.day} onChange={change} placeholder="Day" className="w-full border rounded px-3 py-2 text-sm mb-3" />
            <input name="title" value={form.title} onChange={change} placeholder="Title" className="w-full border rounded px-3 py-2 text-sm mb-3" />
            <textarea name="description" value={form.description} onChange={change} placeholder="Description" className="w-full border rounded px-3 py-2 text-sm min-h-[100px] mb-3" />
            <div className="flex gap-2">
              <Button size="sm" variant="adventure" className="flex-1" onClick={save}>{editing? 'Update':'Add'}</Button>
              {editing && <Button size="sm" variant="secondary" onClick={reset}>Cancel</Button>}
            </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          {items.map(it => (
            <div key={it.id} className="bg-white border rounded-xl p-4 flex flex-col gap-2 shadow">
              <div className="flex items-center justify-between">
                <div className="font-semibold">Day {it.day}: {it.title}</div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={()=>{ setForm({ day: it.day, title: it.title, description: it.description }); setEditing(it.id); }}>Edit</Button>
                  <Button size="sm" variant="destructive" onClick={()=>remove(it.id)}>Delete</Button>
                </div>
              </div>
              <div className="text-sm text-gray-700 whitespace-pre-wrap">{it.description}</div>
            </div>
          ))}
          {items.length===0 && <div className="text-sm text-gray-500">No itinerary steps yet.</div>}
        </div>
      </div>
    </main>
  );
};

export default AdminItineraryPage;
