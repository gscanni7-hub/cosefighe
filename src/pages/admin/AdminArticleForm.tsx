import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, ChevronDown, ChevronUp, GripVertical, Plus, Save, Trash2 } from 'lucide-react'
import { AdminLayout, Button, Card, Input, Notice, PageHeader, Select, Textarea, Toggle } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchAllArticles, saveArticle } from '../../lib/db'
import { CATEGORIES } from '../../data/categories'
import type { ArticleSection, ArticleSectionType, DbArticle } from '../../types'

const categoryOptions = Object.values(CATEGORIES).map((c) => ({ slug: c.slug, label: c.label }))

const sectionTypes: { value: ArticleSectionType; label: string; icon: string }[] = [
  { value: 'paragraph', label: 'Paragrafo', icon: '¶' },
  { value: 'heading', label: 'Titolo H2', icon: 'H2' },
  { value: 'subheading', label: 'Sottotitolo', icon: 'H3' },
  { value: 'tip', label: 'Consiglio', icon: '💡' },
  { value: 'quote', label: 'Citazione', icon: '"' },
  { value: 'list', label: 'Lista', icon: '•' },
]

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/[ñ]/g, 'n')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

interface SectionEditorProps {
  section: ArticleSection
  idx: number
  total: number
  onUpdate: (patch: Partial<ArticleSection>) => void
  onDelete: () => void
  onMove: (dir: number) => void
}

function SectionEditor({ section, idx, total, onUpdate, onDelete, onMove }: SectionEditorProps) {
  const current = sectionTypes.find((t) => t.value === section.type)
  const items = section.items ?? ['']

  return (
    <div className="rounded-xl border border-line  bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 bg-paper border-b-2 border-black">
        <GripVertical size={14} className="text-ink/30" />
        <div className="flex gap-1 flex-wrap flex-1">
          {sectionTypes.map((t) => (
            <button
              key={t.value}
              type="button"
              onClick={() => onUpdate({ type: t.value, items: t.value === 'list' ? (section.items ?? ['']) : undefined })}
              className={`px-2 py-0.5 rounded-full text-xs font-bold border transition-all ${
                section.type === t.value ? 'bg-orange text-white border-orange' : 'border-line hover:border-black'
              }`}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 ml-auto flex-shrink-0">
          <button
            type="button"
            onClick={() => onMove(-1)}
            disabled={idx === 0}
            className="w-6 h-6 flex items-center justify-center rounded border border-line hover:border-black disabled:opacity-30"
          >
            <ChevronUp size={12} />
          </button>
          <button
            type="button"
            onClick={() => onMove(1)}
            disabled={idx === total - 1}
            className="w-6 h-6 flex items-center justify-center rounded border border-line hover:border-black disabled:opacity-30"
          >
            <ChevronDown size={12} />
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="w-6 h-6 flex items-center justify-center rounded border border-error/40 hover:border-error/40 hover:text-error text-error"
          >
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {section.type === 'list' ? (
          <>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/40 mb-1">
                Titolo lista (opzionale)
              </label>
              <input
                type="text"
                value={section.content}
                onChange={(e) => onUpdate({ content: e.target.value })}
                placeholder="Es. Cosa portare nello zaino:"
                className="w-full border-2 border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-ink/40 mb-2">Elementi lista</label>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      value={item}
                      onChange={(e) => {
                        const next = [...items]
                        next[i] = e.target.value
                        onUpdate({ items: next })
                      }}
                      placeholder={`Elemento ${i + 1}`}
                      className="flex-1 border-2 border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const next = items.filter((_, j) => j !== i)
                        onUpdate({ items: next.length ? next : [''] })
                      }}
                      className="w-8 h-9 flex items-center justify-center rounded-lg border-2 border-line hover:border-error/40 hover:text-error text-ink/30"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => onUpdate({ items: [...items, ''] })}
                  className="flex items-center gap-1.5 text-xs font-bold text-orange hover:underline"
                >
                  <Plus size={11} /> Aggiungi elemento
                </button>
              </div>
            </div>
          </>
        ) : (
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-ink/40 mb-1">{current?.label}</label>
            <textarea
              value={section.content}
              onChange={(e) => onUpdate({ content: e.target.value })}
              rows={section.type === 'paragraph' ? 4 : 2}
              placeholder={
                section.type === 'heading'
                  ? 'Titolo della sezione...'
                  : section.type === 'tip'
                    ? 'Consiglio utile per il lettore...'
                    : section.type === 'quote'
                      ? '"La citazione da evidenziare..."'
                      : 'Scrivi il testo qui...'
              }
              className="w-full border-2 border-line rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange resize-none"
            />
          </div>
        )}
      </div>
    </div>
  )
}

const emptyArticle: DbArticle = {
  slug: '',
  title: '',
  excerpt: '',
  category: 'Food',
  category_slug: 'food',
  author: '',
  author_role: '',
  author_image: '',
  date: new Date().toISOString().split('T')[0],
  reading_time: 5,
  cover_image: '',
  tags: [],
  body: [],
  published: false,
}

export default function AdminArticleForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [form, setForm] = useState<DbArticle>(emptyArticle)
  const [sections, setSections] = useState<ArticleSection[]>([])
  const [tagsInput, setTagsInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [autoSlug, setAutoSlug] = useState(true)

  useEffect(() => {
    document.title = isNew ? 'Nuovo Articolo — Admin' : 'Modifica Articolo — Admin'
    if (!isNew && isSupabaseConfigured) {
      fetchAllArticles().then((rows) => {
        const found = rows.find((r) => r.id === id)
        if (found) {
          setForm(found)
          setSections(found.body ?? [])
          setTagsInput((found.tags ?? []).join(', '))
          setAutoSlug(false)
        }
      })
    }
  }, [id, isNew])

  const set = <K extends keyof DbArticle>(key: K, value: DbArticle[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const setTitle = (title: string) => {
    set('title', title)
    if (autoSlug) set('slug', slugify(title))
  }

  const setCategory = (slug: string) => {
    const cat = categoryOptions.find((c) => c.slug === slug)
    set('category_slug', slug)
    set('category', cat?.label ?? slug)
  }

  const addSection = (type: ArticleSectionType) => {
    setSections((prev) => [...prev, { type, content: '', items: type === 'list' ? [''] : undefined }])
  }

  const updateSection = (idx: number, patch: Partial<ArticleSection>) => {
    setSections((prev) => prev.map((s, i) => (i === idx ? { ...s, ...patch } : s)))
  }

  const deleteSection = (idx: number) => {
    setSections((prev) => prev.filter((_, i) => i !== idx))
  }

  const moveSection = (idx: number, dir: number) => {
    setSections((prev) => {
      const next = [...prev]
      const [item] = next.splice(idx, 1)
      next.splice(idx + dir, 0, item)
      return next
    })
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) {
      setError('Il titolo è obbligatorio')
      return
    }
    if (!form.slug?.trim()) {
      setError('Lo slug è obbligatorio')
      return
    }
    if (!isSupabaseConfigured) {
      setError('Supabase non configurato')
      return
    }
    setSaving(true)
    setError('')
    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    const saved = await saveArticle({ ...form, tags, body: sections })
    setSaving(false)
    if (!saved) {
      setError('Errore nel salvataggio. Controlla la console.')
      return
    }
    navigate('/admin/articoli')
  }

  return (
    <AdminLayout>
      <PageHeader
        title={isNew ? 'Nuovo Articolo' : 'Modifica Articolo'}
        action={
          <Button variant="ghost" onClick={() => navigate('/admin/articoli')}>
            <ArrowLeft size={14} /> Indietro
          </Button>
        }
      />

      {!isSupabaseConfigured && (
        <Notice title="Database non collegato">Configura Supabase nel .env per salvare i dati.</Notice>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h2 className="text-sm font-semibold mb-5">Intestazione</h2>
              <div className="space-y-4">
                <Input
                  label="Titolo *"
                  value={form.title ?? ''}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titolo dell'articolo"
                />
                <div>
                  <Input
                    label="Slug URL *"
                    value={form.slug ?? ''}
                    onChange={(e) => {
                      setAutoSlug(false)
                      set('slug', e.target.value)
                    }}
                    placeholder="slug-url-articolo"
                  />
                  <p className="text-xs text-ink/40 mt-1">URL: /blog/{form.slug || 'slug-articolo'}</p>
                </div>
                <Textarea
                  label="Estratto / Descrizione"
                  value={form.excerpt ?? ''}
                  onChange={(e) => set('excerpt', e.target.value)}
                  rows={3}
                  placeholder="Breve descrizione dell'articolo (usata per SEO e anteprima)"
                />
                <Input
                  label="Immagine di copertina (URL)"
                  value={form.cover_image ?? ''}
                  onChange={(e) => set('cover_image', e.target.value)}
                  type="url"
                  placeholder="https://..."
                />
                {form.cover_image && (
                  <div className="rounded-xl overflow-hidden border border-line h-40">
                    <img src={form.cover_image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold mb-2">Corpo dell'articolo</h2>
              <p className="text-xs text-ink/40 mb-5">
                Aggiungi sezioni nell'ordine che preferisci. Usa i tasti freccia per riordinarle.
              </p>
              <div className="space-y-3">
                {sections.map((section, idx) => (
                  <SectionEditor
                    key={idx}
                    section={section}
                    idx={idx}
                    total={sections.length}
                    onUpdate={(patch) => updateSection(idx, patch)}
                    onDelete={() => deleteSection(idx)}
                    onMove={(dir) => moveSection(idx, dir)}
                  />
                ))}
              </div>
              <div className="mt-4 pt-4 border-t-2 border-dashed border-line">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/40 mb-3">Aggiungi sezione</p>
                <div className="flex flex-wrap gap-2">
                  {sectionTypes.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => addSection(t.value)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-line text-xs font-bold uppercase tracking-wider hover:bg-orange hover:text-white hover:border-orange transition-all "
                    >
                      <Plus size={11} /> {t.icon} {t.label}
                    </button>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="text-sm font-semibold mb-5">Autore</h2>
              <div className="space-y-3">
                <Input
                  label="Nome autore"
                  value={form.author ?? ''}
                  onChange={(e) => set('author', e.target.value)}
                  placeholder="Nome Cognome"
                />
                <Input
                  label="Ruolo"
                  value={form.author_role ?? ''}
                  onChange={(e) => set('author_role', e.target.value)}
                  placeholder="Es. Head of Experiences"
                />
                <Input
                  label="Foto autore (URL)"
                  value={form.author_image ?? ''}
                  onChange={(e) => set('author_image', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold mb-5">Metadati</h2>
              <div className="space-y-3">
                <Select label="Categoria" value={form.category_slug ?? 'food'} onChange={(e) => setCategory(e.target.value)}>
                  {categoryOptions.map((c) => (
                    <option key={c.slug} value={c.slug}>
                      {c.label}
                    </option>
                  ))}
                </Select>
                <Input
                  label="Data pubblicazione"
                  type="date"
                  value={form.date ?? ''}
                  onChange={(e) => set('date', e.target.value)}
                />
                <Input
                  label="Tempo di lettura (min)"
                  type="number"
                  min="1"
                  value={form.reading_time ?? 5}
                  onChange={(e) => set('reading_time', parseInt(e.target.value))}
                />
                <div>
                  <label className="block font-sans text-xs font-bold uppercase tracking-widest mb-2 text-ink/50">
                    Tag (separati da virgola)
                  </label>
                  <input
                    type="text"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    placeholder="napoli, food, local"
                    className="w-full border border-line rounded-xl px-4 py-3 font-sans text-sm focus:outline-none focus:border-orange transition-colors"
                  />
                </div>
              </div>
            </Card>

            <Card>
              <h2 className="text-sm font-semibold mb-5">Pubblicazione</h2>
              <label className="flex items-center gap-3 cursor-pointer mb-3">
                <div
                  onClick={() => set('published', !form.published)}
                  className={`w-12 h-6 rounded-full border border-line transition-colors relative cursor-pointer ${
                    form.published ? 'bg-orange' : 'bg-paper'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border border-line transition-all ${
                      form.published ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </div>
                <span className="font-bold text-sm">{form.published ? 'Pubblicato' : 'Bozza'}</span>
              </label>
              <p className="text-xs text-ink/40">
                {form.published ? 'Visibile sul sito a /blog/' + (form.slug || '...') : 'Non visibile sul sito pubblico'}
              </p>
            </Card>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl bg-error/5 px-4 py-3 text-sm font-medium text-error">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" disabled={saving}>
            <Save size={14} /> {saving ? 'Salvataggio...' : 'Salva articolo'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/articoli')}>
            Annulla
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
