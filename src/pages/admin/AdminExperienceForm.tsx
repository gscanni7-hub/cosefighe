import { useEffect, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router'
import { ArrowLeft, Save } from 'lucide-react'
import { AdminLayout, Button, Card, Input, PageHeader, Select, Textarea } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { fetchAllExperiences, saveExperience } from '../../lib/db'
import { CATEGORIES } from '../../data/categories'
import type { DbExperience, ExperienceColor } from '../../types'

const categoryOptions = Object.values(CATEGORIES).map((c) => ({ slug: c.slug, label: c.label }))

const colorOptions: { value: ExperienceColor; label: string; cls: string }[] = [
  { value: 'orange', label: 'Arancione', cls: 'bg-[#FF5500]' },
  { value: 'blue', label: 'Blu', cls: 'bg-[#0055FF]' },
  { value: 'white', label: 'Bianco', cls: 'bg-white border border-black' },
]

const emptyExperience: DbExperience = {
  title: '',
  category_slug: 'food',
  duration: '',
  group_size: '',
  rating: 4.8,
  reviews: 0,
  price: '',
  tag: '',
  color: 'white',
  image: '',
  location: '',
  included: '',
  published: true,
}

export default function AdminExperienceForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isNew = id === 'new'
  const [form, setForm] = useState<DbExperience>(emptyExperience)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = isNew ? 'Nuova Esperienza — Admin' : 'Modifica Esperienza — Admin'
    if (!isNew && isSupabaseConfigured) {
      fetchAllExperiences().then((rows) => {
        const found = rows.find((r) => r.id === id)
        if (found) setForm(found)
      })
    }
  }, [id, isNew])

  const set = <K extends keyof DbExperience>(key: K, value: DbExperience[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!form.title?.trim()) {
      setError('Il titolo è obbligatorio')
      return
    }
    if (!isSupabaseConfigured) {
      setError('Supabase non configurato')
      return
    }
    setSaving(true)
    setError('')
    const saved = await saveExperience(form)
    setSaving(false)
    if (!saved) {
      setError('Errore nel salvataggio. Controlla la console.')
      return
    }
    navigate('/admin/esperienze')
  }

  return (
    <AdminLayout>
      <PageHeader
        title={isNew ? 'Nuova Esperienza' : 'Modifica Esperienza'}
        action={
          <Button variant="ghost" onClick={() => navigate('/admin/esperienze')}>
            <ArrowLeft size={14} /> Indietro
          </Button>
        }
      />

      {!isSupabaseConfigured && (
        <Card className="mb-6 bg-yellow-50 border-yellow-400">
          <p className="text-sm font-bold">Configura Supabase nel .env per salvare i dati.</p>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <h2 className="font-display text-xl uppercase mb-5">Informazioni principali</h2>
              <div className="space-y-4">
                <Input
                  label="Titolo *"
                  value={form.title ?? ''}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="Nome dell'esperienza"
                  required
                />
                <Textarea
                  label="Cosa è incluso"
                  value={form.included ?? ''}
                  onChange={(e) => set('included', e.target.value)}
                  rows={2}
                  placeholder="Es. Guida esperta + trasporto + degustazioni"
                />
                <Input
                  label="Immagine (URL)"
                  value={form.image ?? ''}
                  onChange={(e) => set('image', e.target.value)}
                  placeholder="https://..."
                  type="url"
                />
                {form.image && (
                  <div className="rounded-xl overflow-hidden border-2 border-black h-40">
                    <img src={form.image} alt="preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-xl uppercase mb-5">Dettagli</h2>
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="Durata"
                  value={form.duration ?? ''}
                  onChange={(e) => set('duration', e.target.value)}
                  placeholder="Es. 3 ore"
                />
                <Input
                  label="Gruppo"
                  value={form.group_size ?? ''}
                  onChange={(e) => set('group_size', e.target.value)}
                  placeholder="Es. 2–12"
                />
                <Input
                  label="Prezzo"
                  value={form.price ?? ''}
                  onChange={(e) => set('price', e.target.value)}
                  placeholder="Es. €39"
                />
                <Input
                  label="Location"
                  value={form.location ?? ''}
                  onChange={(e) => set('location', e.target.value)}
                  placeholder="Es. Quartieri Spagnoli"
                />
                <Input
                  label="Rating (0–5)"
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={form.rating ?? 4.5}
                  onChange={(e) => set('rating', parseFloat(e.target.value))}
                />
                <Input
                  label="Numero recensioni"
                  type="number"
                  min="0"
                  value={form.reviews ?? 0}
                  onChange={(e) => set('reviews', parseInt(e.target.value))}
                />
                <Input
                  label="Tag badge"
                  value={form.tag ?? ''}
                  onChange={(e) => set('tag', e.target.value)}
                  placeholder="Es. Street Food"
                />
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <h2 className="font-display text-xl uppercase mb-5">Categoria</h2>
              <Select
                label="Categoria *"
                value={form.category_slug ?? 'food'}
                onChange={(e) => set('category_slug', e.target.value)}
              >
                {categoryOptions.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </Card>

            <Card>
              <h2 className="font-display text-xl uppercase mb-5">Colore card</h2>
              <div className="space-y-2">
                {colorOptions.map((c) => (
                  <button
                    key={c.value}
                    type="button"
                    onClick={() => set('color', c.value)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all ${
                      form.color === c.value ? 'border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]' : 'border-black/30'
                    }`}
                  >
                    <span className={`w-5 h-5 rounded-full ${c.cls} flex-shrink-0`} />
                    <span className="font-bold text-sm">{c.label}</span>
                    {form.color === c.value && <span className="ml-auto text-xs font-bold text-[#FF5500]">✓</span>}
                  </button>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="font-display text-xl uppercase mb-5">Pubblicazione</h2>
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => set('published', !form.published)}
                  className={`w-12 h-6 rounded-full border-2 border-black transition-colors relative cursor-pointer ${
                    form.published ? 'bg-[#FF5500]' : 'bg-[#f5f5f5]'
                  }`}
                >
                  <div
                    className={`absolute top-0.5 w-4 h-4 rounded-full bg-white border-2 border-black transition-all ${
                      form.published ? 'left-6' : 'left-0.5'
                    }`}
                  />
                </div>
                <span className="font-bold text-sm">{form.published ? 'Pubblicata' : 'Bozza'}</span>
              </label>
            </Card>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-500 rounded-xl px-4 py-3 text-sm text-red-600 font-bold">
            {error}
          </div>
        )}

        <div className="flex gap-4">
          <Button type="submit" variant="primary" disabled={saving}>
            <Save size={14} /> {saving ? 'Salvataggio...' : 'Salva esperienza'}
          </Button>
          <Button variant="ghost" onClick={() => navigate('/admin/esperienze')}>
            Annulla
          </Button>
        </div>
      </form>
    </AdminLayout>
  )
}
