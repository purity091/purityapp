// @ts-nocheck
import React, { useEffect, useMemo, useState } from 'react';
import { Check, Languages, LogOut, RefreshCw, Save } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { AdminNavigation } from './AdminDashboardPage';
import { invalidateCatalogCache } from '../context/CatalogContext';
import { Language, supportedLanguages } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';

type EntityType = 'item' | 'deal' | 'category';
type EditorForm = { title: string; description: string; category: string; badge: string };
type CatalogItem = { id: string; name: string; description: string | null; metadata: Record<string, unknown> | null; status: string; item_type: string };
type Deal = { id: string; title: string; description: string | null; metadata: Record<string, unknown> | null; status: string };
type Category = { id: string; name: string; description: string | null };
type ItemTranslation = { item_id: string; language_code: Language; name: string; description: string | null; metadata: Record<string, unknown> | null; deleted_at: string | null };
type DealTranslation = { deal_id: string; language_code: Language; title: string; description: string | null; metadata: Record<string, unknown> | null; deleted_at: string | null };
type CategoryTranslation = { category_id: string; language_code: Language; name: string; description: string | null; deleted_at: string | null };

const emptyForm: EditorForm = { title: '', description: '', category: '', badge: '' };
const languageOptions = supportedLanguages.filter(language => language.code !== 'en');

export const AdminTranslationsPage: React.FC = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [language, setLanguage] = useState<Language>('fr');
    const [entityType, setEntityType] = useState<EntityType>('item');
    const [items, setItems] = useState<CatalogItem[]>([]);
    const [deals, setDeals] = useState<Deal[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [itemTranslations, setItemTranslations] = useState<ItemTranslation[]>([]);
    const [dealTranslations, setDealTranslations] = useState<DealTranslation[]>([]);
    const [categoryTranslations, setCategoryTranslations] = useState<CategoryTranslation[]>([]);
    const [selectedId, setSelectedId] = useState('');
    const [form, setForm] = useState<EditorForm>(emptyForm);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    const loadData = async () => {
        setLoading(true);
        setFeedback(null);
        const [itemsResult, dealsResult, categoriesResult, itemTranslationsResult, dealTranslationsResult, categoryTranslationsResult] = await Promise.all([
            supabase.from('catalog_items').select('id, name, description, metadata, status, item_type').is('deleted_at', null).order('name'),
            supabase.from('deals').select('id, title, description, metadata, status').is('deleted_at', null).order('title'),
            supabase.from('catalog_categories').select('id, name, description').is('deleted_at', null).order('name'),
            supabase.from('catalog_item_translations').select('item_id, language_code, name, description, metadata, deleted_at').order('language_code'),
            supabase.from('deal_translations').select('deal_id, language_code, title, description, metadata, deleted_at').order('language_code'),
            supabase.from('catalog_category_translations').select('category_id, language_code, name, description, deleted_at').order('language_code'),
        ]);
        const error = itemsResult.error || dealsResult.error || categoriesResult.error || itemTranslationsResult.error || dealTranslationsResult.error || categoryTranslationsResult.error;
        if (error) setFeedback({ type: 'error', message: error.code === '42P01' ? 'Run supabase_multilingual_catalog.sql before managing translations.' : error.message });
        setItems((itemsResult.data || []) as CatalogItem[]);
        setDeals((dealsResult.data || []) as Deal[]);
        setCategories((categoriesResult.data || []) as Category[]);
        setItemTranslations(itemTranslationsResult.data || []);
        setDealTranslations(dealTranslationsResult.data || []);
        setCategoryTranslations(categoryTranslationsResult.data || []);
        setLoading(false);
    };

    useEffect(() => { void loadData(); }, []);

    const entities = entityType === 'item' ? items : entityType === 'deal' ? deals : categories;
    const current = useMemo(() => entities.find(entity => entity.id === selectedId) || entities[0], [entities, selectedId]);
    const currentTranslation = useMemo(() => {
        if (!current) return null;
        if (entityType === 'item') return itemTranslations.find(row => row.item_id === current.id && row.language_code === language && !row.deleted_at);
        if (entityType === 'deal') return dealTranslations.find(row => row.deal_id === current.id && row.language_code === language && !row.deleted_at);
        return categoryTranslations.find(row => row.category_id === current.id && row.language_code === language && !row.deleted_at);
    }, [current, entityType, language, itemTranslations, dealTranslations, categoryTranslations]);

    useEffect(() => {
        if (!current) { setSelectedId(''); setForm(emptyForm); return; }
        setSelectedId(current.id);
        if (language === 'en') {
            if (entityType === 'item') setForm({ title: current.name, description: current.description || '', category: '', badge: String(current.metadata?.offer_tag || '') });
            else if (entityType === 'deal') setForm({ title: current.title, description: current.description || '', category: String(current.metadata?.category || ''), badge: String(current.metadata?.offer_tag || '') });
            else setForm({ title: current.name, description: current.description || '', category: '', badge: '' });
            return;
        }
        if (entityType === 'item') setForm({ title: currentTranslation?.name || '', description: currentTranslation?.description || '', category: '', badge: String(currentTranslation?.metadata?.offer_tag || '') });
        else if (entityType === 'deal') setForm({ title: currentTranslation?.title || '', description: currentTranslation?.description || '', category: String(currentTranslation?.metadata?.category || ''), badge: String(currentTranslation?.metadata?.offer_tag || '') });
        else setForm({ title: currentTranslation?.name || '', description: currentTranslation?.description || '', category: '', badge: '' });
    }, [current, currentTranslation, entityType, language]);

    const updateForm = (field: keyof EditorForm, value: string) => setForm(previous => ({ ...previous, [field]: value }));

    const save = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!current || !form.title.trim()) { setFeedback({ type: 'error', message: 'A translated name or title is required.' }); return; }
        setSaving(true); setFeedback(null);
        try {
            const metadata = entityType === 'category' ? {} : {
                ...(language === 'en' ? (current.metadata || {}) : {}),
                ...(form.category.trim() ? { category: form.category.trim() } : {}),
                ...(form.badge.trim() ? { offer_tag: form.badge.trim() } : {}),
            };
            if (language === 'en') {
                if (entityType === 'item') {
                    const result = await supabase.from('catalog_items').update({ name: form.title.trim(), description: form.description.trim() || null, short_description: form.description.trim() || null, metadata }).eq('id', current.id);
                    if (result.error) throw result.error;
                } else if (entityType === 'deal') {
                    const result = await supabase.from('deals').update({ title: form.title.trim(), description: form.description.trim() || null, metadata }).eq('id', current.id);
                    if (result.error) throw result.error;
                } else {
                    const result = await supabase.from('catalog_categories').update({ name: form.title.trim(), description: form.description.trim() || null }).eq('id', current.id);
                    if (result.error) throw result.error;
                }
            }
            const table = entityType === 'item' ? 'catalog_item_translations' : entityType === 'deal' ? 'deal_translations' : 'catalog_category_translations';
            const payload = entityType === 'item'
                ? { item_id: current.id, language_code: language, name: form.title.trim(), short_description: form.description.trim() || null, description: form.description.trim() || null, metadata, deleted_at: null }
                : entityType === 'deal'
                    ? { deal_id: current.id, language_code: language, title: form.title.trim(), description: form.description.trim() || null, metadata, deleted_at: null }
                    : { category_id: current.id, language_code: language, name: form.title.trim(), description: form.description.trim() || null, deleted_at: null };
            const result = await supabase.from(table).upsert(payload, { onConflict: entityType === 'item' ? 'item_id,language_code' : entityType === 'deal' ? 'deal_id,language_code' : 'category_id,language_code' });
            if (result.error) throw result.error;
            invalidateCatalogCache();
            await loadData();
            setFeedback({ type: 'success', message: `Saved ${language.toUpperCase()} translation successfully.` });
        } catch (error) {
            setFeedback({ type: 'error', message: error?.message || 'Could not save the translation.' });
        } finally { setSaving(false); }
    };

    return <div className="min-h-screen bg-slate-50 pb-16 text-slate-950" dir="ltr">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur-xl"><div className="mx-auto flex min-h-16 max-w-[1280px] items-center justify-between gap-4 px-4 py-3 md:px-6"><div className="flex items-center gap-3"><img src="/logo.png" alt="Purity logo" className="h-10 w-10 rounded-xl object-contain" /><div><p className="text-sm font-bold">Purity Admin</p><p className="text-[11px] font-medium text-slate-500">Multilingual catalog</p></div></div><div className="flex items-center gap-2"><span className="hidden max-w-48 truncate text-xs font-semibold text-slate-600 sm:block">{user?.email}</span><button type="button" onClick={() => { void logout().then(() => navigate('/admin')); }} className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-xs font-bold text-slate-600 hover:bg-red-50 hover:text-red-700"><LogOut size={14} /> Logout</button></div></div></header>
        <div className="mx-auto flex max-w-[1280px] flex-col gap-5 px-4 py-6 md:px-6 md:py-9 lg:flex-row lg:items-start lg:gap-6"><AdminNavigation /><main className="min-w-0 flex-1"><div className="mb-6 flex flex-wrap items-end justify-between gap-4"><div><Link to="/admin/overview" className="mb-3 inline-flex text-xs font-bold text-primary-700 hover:text-primary-900">Overview</Link><p className="text-xs font-black uppercase tracking-wide text-primary-700">Content localization</p><h1 className="mt-1 text-2xl font-black">Translations</h1><p className="mt-1 max-w-2xl text-sm font-medium text-slate-600">Translate services, packages, offers and categories. Prices, images and booking IDs remain shared across all languages.</p></div><button type="button" onClick={() => void loadData()} className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-black text-slate-700 hover:bg-slate-50"><RefreshCw size={15} /> Refresh</button></div>{feedback && <div className={`mb-5 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold ${feedback.type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800'}`}>{feedback.type === 'success' ? <Check size={16} /> : <Languages size={16} />}{feedback.message}</div>}<section className="rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-4"><div className="flex flex-wrap gap-2"><button type="button" onClick={() => setEntityType('item')} className={`rounded-lg px-3 py-2 text-xs font-bold ${entityType === 'item' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-700'}`}>Services &amp; packages</button><button type="button" onClick={() => setEntityType('deal')} className={`rounded-lg px-3 py-2 text-xs font-bold ${entityType === 'deal' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-700'}`}>Offers</button><button type="button" onClick={() => setEntityType('category')} className={`rounded-lg px-3 py-2 text-xs font-bold ${entityType === 'category' ? 'bg-primary-700 text-white' : 'bg-slate-100 text-slate-700'}`}>Categories</button></div><div className="mt-3 flex flex-wrap items-center gap-2"><span className="text-xs font-black text-slate-600">Target language:</span>{languageOptions.map(option => <button type="button" key={option.code} onClick={() => setLanguage(option.code)} className={`rounded-full border px-3 py-1.5 text-xs font-bold ${language === option.code ? 'border-primary-600 bg-primary-50 text-primary-800' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{option.nativeLabel}</button>)}</div></div>{loading ? <div className="flex min-h-56 items-center justify-center gap-2 text-sm font-semibold text-slate-500"><RefreshCw size={18} className="animate-spin" /> Loading translation data...</div> : !current ? <div className="p-10 text-center text-sm font-semibold text-slate-500">No content found.</div> : <form onSubmit={save} className="space-y-5 p-4 md:p-6"><div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]"><label className="block text-xs font-bold text-slate-700">Content<select value={selectedId} onChange={event => setSelectedId(event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold outline-none focus:border-primary-500">{entities.map(entity => <option key={entity.id} value={entity.id}>{entityType === 'deal' ? entity.title : entity.name} · {entity.status || 'active'}</option>)}</select></label><div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-600"><p className="font-black text-slate-800">Translation status</p><p className="mt-1">{currentTranslation ? 'A saved translation exists for this language.' : 'No translation saved yet; English fallback is currently used.'}</p></div></div><div className="grid gap-4 md:grid-cols-2"><label className="block text-xs font-bold text-slate-700">{entityType === 'deal' ? 'Offer title' : entityType === 'category' ? 'Category name' : 'Service or package name'}<input required value={form.title} onChange={event => updateForm('title', event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500" /></label>{entityType !== 'category' && <label className="block text-xs font-bold text-slate-700">{entityType === 'deal' ? 'Offer category' : 'Translated badge'}<input value={entityType === 'deal' ? form.category : form.badge} onChange={event => updateForm(entityType === 'deal' ? 'category' : 'badge', event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500" /></label>}</div><label className="block text-xs font-bold text-slate-700">Description<textarea value={form.description} onChange={event => updateForm('description', event.target.value)} rows={5} className="mt-1.5 w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium outline-none focus:border-primary-500" /></label>{entityType === 'deal' && <label className="block text-xs font-bold text-slate-700">Translated offer badge<input value={form.badge} onChange={event => updateForm('badge', event.target.value)} className="mt-1.5 h-11 w-full rounded-lg border border-slate-200 px-3 text-sm font-semibold outline-none focus:border-primary-500" /></label>}<div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4"><p className="text-xs font-medium text-slate-500">English remains the fallback when a translation is missing.</p><button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary-700 px-5 text-xs font-black text-white hover:bg-primary-800 disabled:opacity-60">{saving ? <RefreshCw size={15} className="animate-spin" /> : <Save size={15} />} Save translation</button></div></form>}</section></main></div>
    </div>;
};

export default AdminTranslationsPage;
