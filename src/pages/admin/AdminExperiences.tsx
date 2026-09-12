import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminEmpty, AdminLayout, Badge, Button, Card, Notice, PageHeader, td, th } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { deleteExperience, fetchAllExperiences, saveExperience } from '../../lib/db'
import { CATEGORIES } from '../../data/categories'
import type { DbExperience, ExperienceColor } from '../../types'

const categoryOptions = Object.values(CATEGORIES).map((c) => ({ slug: c.slug, label: c.label }))

const colorBadge: Record<ExperienceColor, string> = {
  orange: 'bg-orange text-white',
  blue: 'bg-blue text-white',
  white: 'bg-white border border-line',
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
            <Button>
              <Plus size={14} /> Nuova
            </Button>
          </Link>
        }
      />

      {!isSupabaseConfigured && (
        <Notice title="Database non collegato">Configura Supabase nel file .env per gestire le esperienze.</Notice>
      )}

      {loading ? (
        <p className="text-sm text-ink/45">Caricamento...</p>
      ) : items.length === 0 ? (
        <AdminEmpty title="Nessuna esperienza" action={<Link to="/admin/esperienze/new"><Button><Plus size={14} /> Crea la prima</Button></Link>} />
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line">
              <tr>
                <th className={`${th}`}>Esperienza</th>
                <th className={`${th} hidden md:table-cell`}>
                  Categoria
                </th>
                <th className={`${th} hidden lg:table-cell`}>
                  Prezzo
                </th>
                <th className={`${th} hidden lg:table-cell`}>
                  Colore
                </th>
                <th className={`${th}`}>Stato</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((exp) => (
                <tr key={exp.id} className="transition-colors hover:bg-paper/60">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      {exp.image && (
                        <img
                          src={exp.image}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-xl border border-line object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium leading-tight">{exp.title}</p>
                        <p className="mt-0.5 text-xs text-ink/45">{exp.location}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} hidden md:table-cell`}>
                    <Badge>
                      {categoryOptions.find((c) => c.slug === exp.category_slug)?.label ?? exp.category_slug}
                    </Badge>
                  </td>
                  <td className={`${td} hidden lg:table-cell`}>
                    <span className="text-sm font-medium tabular-nums">{exp.price || '—'}</span>
                  </td>
                  <td className={`${td} hidden lg:table-cell`}>
                    <span className={`inline-block h-4 w-4 rounded-full ${(exp.color && colorBadge[exp.color]) ?? ''}`} title={exp.color} />
                  </td>
                  <td className={`${td}`}>
                    <button type="button" onClick={() => togglePublished(exp)} className="inline-flex" title="Cambia stato">{exp.published ? <Badge tone="success"><Eye size={11} /> Online</Badge> : <Badge><EyeOff size={11} /> Bozza</Badge>}</button>
                  </td>
                  <td className={`${td}`}>
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/esperienze/${exp.id}`}>
                        <Button variant="secondary" className="h-9 w-9 px-0" title="Modifica"><Pencil size={14} /></Button>
                      </Link>
                      <Button variant="danger" className="h-9 w-9 px-0" title="Elimina" onClick={() => handleDelete(exp.id as string, exp.title)}><Trash2 size={14} /></Button>
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
