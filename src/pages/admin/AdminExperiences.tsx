import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminLayout, Button, Card, PageHeader } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { deleteExperience, fetchAllExperiences, saveExperience } from '../../lib/db'
import { CATEGORIES } from '../../data/categories'
import type { DbExperience, ExperienceColor } from '../../types'

const categoryOptions = Object.values(CATEGORIES).map((c) => ({ slug: c.slug, label: c.label }))

const colorBadge: Record<ExperienceColor, string> = {
  orange: 'bg-[#FF5500] text-white',
  blue: 'bg-[#0055FF] text-white',
  white: 'bg-white text-black border border-black',
}

export default function AdminExperiences() {
  const [items, setItems] = useState<DbExperience[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    fetchAllExperiences().then((rows) => {
      setItems(rows)
      setLoading(false)
    })
  }

  useEffect(() => {
    document.title = 'Esperienze — Admin'
    load()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Eliminare "${title}"?`)) {
      await deleteExperience(id)
      load()
    }
  }

  const togglePublished = async (exp: DbExperience) => {
    await saveExperience({ ...exp, published: !exp.published })
    load()
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Esperienze"
        subtitle={`${items.length} esperienze nel database`}
        action={
          <Link to="/admin/esperienze/new">
            <Button variant="primary">
              <Plus size={14} /> Nuova
            </Button>
          </Link>
        }
      />

      {!isSupabaseConfigured && (
        <Card className="mb-6 bg-yellow-50 border-yellow-400">
          <p className="text-sm font-bold">Configura Supabase nel file .env per gestire le esperienze.</p>
        </Card>
      )}

      {loading ? (
        <Card>
          <p className="text-black/40 text-sm">Caricamento...</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="text-center py-16">
          <p className="font-display text-3xl uppercase text-black/20 mb-4">Nessuna esperienza</p>
          <Link to="/admin/esperienze/new">
            <Button variant="primary">
              <Plus size={14} /> Crea la prima
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#111111] text-white">
              <tr>
                <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-widest">Esperienza</th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest hidden md:table-cell">
                  Categoria
                </th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest hidden lg:table-cell">
                  Prezzo
                </th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest hidden lg:table-cell">
                  Colore
                </th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest">Stato</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {items.map((exp) => (
                <tr key={exp.id} className="hover:bg-[#f5f5f5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {exp.image && (
                        <img
                          src={exp.image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border-2 border-black flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-sm leading-tight">{exp.title}</p>
                        <p className="text-xs text-black/40 mt-0.5">{exp.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="px-3 py-1 rounded-full border-2 border-black text-xs font-bold uppercase">
                      {categoryOptions.find((c) => c.slug === exp.category_slug)?.label ?? exp.category_slug}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span className="font-bold text-sm">{exp.price || '—'}</span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                        (exp.color && colorBadge[exp.color]) ?? ''
                      }`}
                    >
                      {exp.color}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => togglePublished(exp)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-black text-xs font-bold uppercase transition-all ${
                        exp.published ? 'bg-green-500 text-white' : 'bg-[#f5f5f5] text-black/50'
                      }`}
                    >
                      {exp.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {exp.published ? 'Pub' : 'Bozza'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/esperienze/${exp.id}`}>
                        <Button variant="secondary" className="py-1.5 px-3">
                          <Pencil size={12} />
                        </Button>
                      </Link>
                      <Button
                        variant="danger"
                        className="py-1.5 px-3"
                        onClick={() => handleDelete(exp.id as string, exp.title)}
                      >
                        <Trash2 size={12} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </AdminLayout>
  )
}
