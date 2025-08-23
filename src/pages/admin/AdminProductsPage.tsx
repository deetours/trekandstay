import React, { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { Button } from '../../components/ui/Button';
import { useToast } from '../../components/ui/useToast';

interface ProductForm { name: string; price: number; image: string; description: string; category: string; active: boolean; stock: number; }
interface Product extends ProductForm { id: string; }

const empty: ProductForm = { name:'', price:0, image:'', description:'', category:'General', active:true, stock:0 };

const AdminProductsPage: React.FC = () => {
  const [form, setForm] = useState<ProductForm>(empty);
  const [list, setList] = useState<Product[]>([]);
  const [editing, setEditing] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);
  const { success, error: toastError } = useToast();

  useEffect(()=>{
    if (!db) return; // Firestore not available
    const colRef = collection(db, 'products');
    const unsub = onSnapshot(colRef, snap => {
      const docs: Product[] = snap.docs.map(d=>({ id:d.id, ...d.data() }) as Product);
      setList(docs.sort((a,b)=>a.name.localeCompare(b.name)));
    }, err => {
      console.warn('Products snapshot error', err);
      toastError({ title: 'Failed to load products', description: err instanceof Error ? err.message : 'Unknown error' });
    });
    return () => unsub();
  },[toastError]);

  const change = (e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement|HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type, checked } = target;
    setForm(f=>({...f,[name]: type==='checkbox'? checked : name==='price'||name==='stock'? Number(value): value}));
  };

  const reset = () => { setForm(empty); setEditing(null); };

  const save = async () => {
    if (!form.name.trim()) return;
    if (!db) {
      toastError({ title: 'Firestore unavailable', description: 'Cannot save product right now.' });
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await updateDoc(doc(db,'products',editing), { ...form });
      } else {
        await addDoc(collection(db,'products'), { ...form, createdAt: serverTimestamp() });
      }
      success({ title: editing ? 'Product updated' : 'Product created', description: '' });
      reset();
    } catch (e: unknown) { 
      const errorMessage = e instanceof Error ? e.message : 'Failed';
      toastError({ title: 'Failed', description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id:string) => {
    if (!confirm('Delete product?')) return;
    if (!db) {
      toastError({ title: 'Firestore unavailable', description: 'Cannot delete product right now.' });
      return;
    }
    try {
      await deleteDoc(doc(db,'products',id));
      success({ title: 'Deleted', description: '' });
    } catch (e: unknown) {
      toastError({ title: 'Failed to delete', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  const seedDefaults = async () => {
    if (!db) {
      toastError({ title: 'Firestore unavailable', description: 'Cannot seed sample products.' });
      return;
    }
    try {
      const defaults = [
        { name:'Organic Honey', price:299, image:'/shop/honey.jpg', description:'Pure, local honey.', category:'Food', active:true, stock:15 },
        { name:'Travel T-shirt', price:499, image:'/shop/tshirt.jpg', description:'Adventure cotton tee.', category:'Apparel', active:true, stock:50 },
      ];
      for (const p of defaults) {
        await addDoc(collection(db,'products'), { ...p, createdAt: serverTimestamp() });
      }
      success({ title: 'Seeded sample products', description: '' });
    } catch (e: unknown) {
      toastError({ title: 'Seeding failed', description: e instanceof Error ? e.message : 'Unknown error' });
    }
  };

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button variant="secondary" size="sm" onClick={seedDefaults}>Seed</Button>
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-white border rounded-xl p-5 shadow">
          <h2 className="font-semibold mb-4">{editing? 'Edit':'Add'} Product</h2>
          <div className="space-y-3">
            <input name="name" value={form.name} placeholder="Name" onChange={change} className="w-full border rounded px-3 py-2 text-sm" />
            <input name="price" type="number" value={form.price} placeholder="Price" onChange={change} className="w-full border rounded px-3 py-2 text-sm" />
            <input name="image" value={form.image} placeholder="Image URL" onChange={change} className="w-full border rounded px-3 py-2 text-sm" />
            <textarea name="description" value={form.description} placeholder="Description" onChange={change} className="w-full border rounded px-3 py-2 text-sm min-h-[70px]" />
            <input name="category" value={form.category} placeholder="Category" onChange={change} className="w-full border rounded px-3 py-2 text-sm" />
            <input name="stock" type="number" value={form.stock} placeholder="Stock" onChange={change} className="w-full border rounded px-3 py-2 text-sm" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" checked={form.active} onChange={change} /> Active</label>
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="adventure" className="flex-1" disabled={loading} onClick={save}>{loading? 'Saving...': editing? 'Update':'Create'}</Button>
              {editing && <Button size="sm" variant="secondary" onClick={reset}>Cancel</Button>}
            </div>
          </div>
        </div>
        <div className="md:col-span-2 space-y-4">
          {list.map(p => (
            <div key={p.id} className="bg-white border rounded-xl p-4 flex gap-4 items-center shadow">
              <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-lg border" />
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-lg truncate flex items-center gap-2">{p.name} {!p.active && <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200">Inactive</span>}</div>
                <div className="text-xs text-gray-500">{p.category} · Stock {p.stock}</div>
                <div className="text-sm text-gray-600 line-clamp-2">{p.description}</div>
              </div>
              <div className="text-forest-green font-bold">₹{p.price}</div>
              <div className="flex flex-col gap-2">
                <Button size="sm" variant="secondary" onClick={()=>{ setForm({ name: p.name, price: p.price, image: p.image, description: p.description, category: p.category, active: p.active, stock: p.stock }); setEditing(p.id);}}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={()=>remove(p.id)}>Delete</Button>
              </div>
            </div>
          ))}
          {list.length === 0 && <div className="text-sm text-gray-500">No products yet.</div>}
        </div>
      </div>
    </main>
  );
};

export default AdminProductsPage;
