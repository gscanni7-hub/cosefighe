import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { Eye, EyeOff, Pencil, Plus, Trash2 } from 'lucide-react'
import { AdminEmpty, AdminLayout, Badge, Button, Card, Notice, PageHeader, td, th } from './ui'
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
            <Button>
              <Plus size={14} /> Nuovo
            </Button>
          </Link>
        }
      />

      {!isSupabaseConfigured && (
        <Notice title="Database non collegato">Configura Supabase nel .env per gestire gli articoli.</Notice>
      )}

      {loading ? (
        <p className="text-sm text-ink/45">Caricamento...</p>
      ) : items.length === 0 ? (
        <AdminEmpty title="Nessun articolo" action={<Link to="/admin/articoli/new"><Button><Plus size={14} /> Crea il primo</Button></Link>} />
      ) : (
        <Card className="p-0 overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line">
              <tr>
                <th className={`${th}`}>Articolo</th>
                <th className={`${th} hidden md:table-cell`}>
                  Categoria
                </th>
                <th className={`${th} hidden lg:table-cell`}>
                  Data
                </th>
                <th className={`${th} hidden lg:table-cell`}>
                  Autore
                </th>
                <th className={`${th}`}>Stato</th>
                <th className={th} />
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {items.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-paper/60">
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      {a.cover_image && (
                        <img
                          src={a.cover_image}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-xl border border-line object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium leading-tight max-w-xs">{a.title}</p>
                        <p className="mt-0.5 text-xs text-ink/45 font-mono">/blog/{a.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`${td} hidden md:table-cell`}>
                    <Badge>
                      {a.category || '—'}
                    </Badge>
                  </td>
                  <td className={`${td} hidden lg:table-cell text-ink/60`}>
                    {a.date ? new Date(a.date).toLocaleDateString('it-IT') : '—'}
                  </td>
                  <td className={`${td} hidden lg:table-cell text-ink/60`}>{a.author || '—'}</td>
                  <td className={`${td}`}>
                    <button type="button" onClick={() => togglePublished(a)} className="inline-flex" title="Cambia stato">{a.published ? <Badge tone="success"><Eye size={11} /> Online</Badge> : <Badge><EyeOff size={11} /> Bozza</Badge>}</button>
                  </td>
                  <td className={`${td}`}>
                    <div className="flex items-center gap-2 justify-end">
                      <Link to={`/admin/articoli/${a.id}`}>
                        <Button variant="secondary" className="h-9 w-9 px-0" title="Modifica"><Pencil size={14} /></Button>
                      </Link>
                      <Button variant="danger" className="h-9 w-9 px-0" title="Elimina" onClick={() => handleDelete(a.id as string, a.title)}><Trash2 size={14} /></Button>
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
