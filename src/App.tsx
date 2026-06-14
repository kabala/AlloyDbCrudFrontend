import { FormEvent, useEffect, useMemo, useState } from "react";
import { Check, Loader2, Pencil, Plus, RefreshCw, Trash2, X } from "lucide-react";
import { Item, ItemInput, api } from "./api";

type FormState = {
  id: number | null;
  name: string;
  description: string;
};

const emptyForm: FormState = {
  id: null,
  name: "",
  description: "",
};

function toInput(form: FormState): ItemInput {
  return {
    name: form.name.trim(),
    description: form.description.trim() || null,
  };
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function App() {
  const [items, setItems] = useState<Item[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isEditing = form.id !== null;
  const canSave = form.name.trim().length > 0 && !isSaving;

  const itemCountLabel = useMemo(() => {
    if (items.length === 1) return "1 item";
    return `${items.length} items`;
  }, [items.length]);

  async function loadItems() {
    setIsLoading(true);
    setError(null);
    try {
      setItems(await api.listItems());
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo cargar el listado.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function loadInitialItems() {
      try {
        const initialItems = await api.listItems();
        if (isMounted) setItems(initialItems);
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "No se pudo cargar el listado.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void loadInitialItems();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSave) return;

    setIsSaving(true);
    setError(null);

    try {
      const payload = toInput(form);
      if (form.id === null) {
        const created = await api.createItem(payload);
        setItems((current) => [created, ...current]);
      } else {
        await api.updateItem(form.id, payload);
        await loadItems();
      }

      setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo guardar el item.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(item: Item) {
    const confirmed = window.confirm(`Eliminar "${item.name}"?`);
    if (!confirmed) return;

    setDeletingId(item.id);
    setError(null);
    try {
      await api.deleteItem(item.id);
      setItems((current) => current.filter((candidate) => candidate.id !== item.id));
      if (form.id === item.id) setForm(emptyForm);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo eliminar el item.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="app-shell">
      <section className="workspace">
        <header className="topbar">
          <div>
            <p className="eyebrow">AlloyDB CRUD</p>
            <h1>Items</h1>
          </div>
          <button className="icon-button" type="button" onClick={loadItems} disabled={isLoading} title="Recargar">
            {isLoading ? <Loader2 className="spin" size={18} /> : <RefreshCw size={18} />}
          </button>
        </header>

        <div className="content-grid">
          <form className="editor-panel" onSubmit={handleSubmit}>
            <div className="panel-heading">
              <h2>{isEditing ? "Editar item" : "Nuevo item"}</h2>
              {isEditing && (
                <button className="ghost-button" type="button" onClick={() => setForm(emptyForm)}>
                  <X size={16} />
                  Cancelar
                </button>
              )}
            </div>

            <label>
              Nombre
              <input
                value={form.name}
                maxLength={120}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Nombre del item"
              />
            </label>

            <label>
              Descripcion
              <textarea
                value={form.description}
                rows={5}
                maxLength={1000}
                onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
                placeholder="Detalle opcional"
              />
            </label>

            <button className="primary-button" type="submit" disabled={!canSave}>
              {isSaving ? <Loader2 className="spin" size={18} /> : isEditing ? <Check size={18} /> : <Plus size={18} />}
              {isEditing ? "Guardar cambios" : "Crear item"}
            </button>

            {error && <p className="error-message">{error}</p>}
          </form>

          <section className="list-panel" aria-live="polite">
            <div className="panel-heading">
              <h2>Listado</h2>
              <span className="count-pill">{itemCountLabel}</span>
            </div>

            {isLoading ? (
              <div className="empty-state">Cargando items...</div>
            ) : items.length === 0 ? (
              <div className="empty-state">No hay items creados.</div>
            ) : (
              <div className="item-list">
                {items.map((item) => (
                  <article className="item-card" key={item.id}>
                    <div className="item-copy">
                      <div className="item-title-row">
                        <h3>{item.name}</h3>
                        <span>#{item.id}</span>
                      </div>
                      <p>{item.description || "Sin descripcion"}</p>
                      <time dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
                    </div>
                    <div className="item-actions">
                      <button
                        className="icon-button"
                        type="button"
                        onClick={() => setForm({ id: item.id, name: item.name, description: item.description || "" })}
                        title="Editar"
                      >
                        <Pencil size={17} />
                      </button>
                      <button
                        className="icon-button danger"
                        type="button"
                        onClick={() => void handleDelete(item)}
                        disabled={deletingId === item.id}
                        title="Eliminar"
                      >
                        {deletingId === item.id ? <Loader2 className="spin" size={17} /> : <Trash2 size={17} />}
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer>
          <span>API</span>
          <code>{api.baseUrl}</code>
        </footer>
      </section>
    </main>
  );
}
