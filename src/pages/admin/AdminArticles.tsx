import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminLayout, Button, Card, PageHeader } from './ui'
import { isSupabaseConfigured } from '../../lib/supabase'
import { deleteArticle, fetchAllArticles, saveArticle } from '../../lib/db'
import type { DbArticle } from '../../types'

export default function AdminArticles() {
  const [items, setItems] = useState<DbArticle[]>([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    fetchAllArticles().then((rows) => {
      setItems(rows)
      setLoading(false)
    })
  }

  useEffect(() => {
    document.title = 'Articoli — Admin'
    load()
  }, [])

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Eliminare "${title}"?`)) {
      await deleteArticle(id)
      load()
    }
  }

  const togglePublished = async (article: DbArticle) => {
    await saveArticle({ ...article, published: !article.published })
    load()
  }

  return (
    <AdminLayout>
      <PageHeader
        title="Articoli"
        subtitle={`${items.length} articoli nel database`}
        action={
          <Link to="/admin/articoli/new">
            <Button variant="primary">
              <Plus size={14} /> Nuovo
            </Button>
          </Link>
        }
      />

      {!isSupabaseConfigured && (
        <Card className="mb-6 bg-yellow-50 border-yellow-400">
          <p className="text-sm font-bold">Configura Supabase nel .env per gestire gli articoli.</p>
        </Card>
      )}

      {loading ? (
        <Card>
          <p className="text-black/40 text-sm">Caricamento...</p>
        </Card>
      ) : items.length === 0 ? (
        <Card className="text-center py-16">
          <p className="font-display text-3xl uppercase text-black/20 mb-4">Nessun articolo</p>
          <Link to="/admin/articoli/new">
            <Button variant="primary">
              <Plus size={14} /> Crea il primo
            </Button>
          </Link>
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#111111] text-white">
              <tr>
                <th className="text-left px-6 py-4 font-sans text-xs uppercase tracking-widest">Articolo</th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest hidden md:table-cell">
                  Categoria
                </th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest hidden lg:table-cell">
                  Data
                </th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest hidden lg:table-cell">
                  Autore
                </th>
                <th className="text-left px-4 py-4 font-sans text-xs uppercase tracking-widest">Stato</th>
                <th className="px-4 py-4" />
              </tr>
            </thead>
            <tbody className="divide-y-2 divide-black/10">
              {items.map((a) => (
                <tr key={a.id} className="hover:bg-[#f5f5f5] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {a.cover_image && (
                        <img
                          src={a.cover_image}
                          alt=""
                          className="w-12 h-12 rounded-xl object-cover border-2 border-black flex-shrink-0"
                        />
                      )}
                      <div>
                        <p className="font-bold text-sm leading-tight max-w-xs">{a.title}</p>
                        <p className="text-xs text-black/40 mt-0.5 font-mono">/blog/{a.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 hidden md:table-cell">
                    <span className="px-3 py-1 rounded-full border-2 border-black text-xs font-bold uppercase">
                      {a.category || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-sm text-black/60">
                    {a.date ? new Date(a.date).toLocaleDateString('it-IT') : '—'}
                  </td>
                  <td className="px-4 py-4 hidden lg:table-cell text-sm text-black/60">{a.author || '—'}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => togglePublished(a)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-black text-xs font-bold uppercase transition-all ${
                        a.published ? 'bg-green-500 text-white' : 'bg-[#f5f5f5] text-black/50'
                      }`}
                    >
                      {a.published ? <Eye size={11} /> : <EyeOff size={11} />}
                      {a.published ? 'Pub' : 'Bozza'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/articoli/${a.id}`}>
                        <Button variant="secondary" className="py-1.5 px-3">
                          <Pencil size={12} />
                        </Button>
                      </Link>
                      <Button variant="danger" className="py-1.5 px-3" onClick={() => handleDelete(a.id as string, a.title)}>
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
