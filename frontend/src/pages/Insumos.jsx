import { useMemo, useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/useConfirm";
import { Badge } from "@/components/ui/badge";

const sampleItems = [
  {
    id: 1,
    name: "Ração Padrão",
    category: "Ração",
    quantity: 150,
    unit: "kg",
    reorderLevel: 50,
    location: "Silo A",
    lastUpdated: "2025-11-20",
  },
  {
    id: 2,
    name: "Vacina Febre Aftosa",
    category: "Vacinas",
    quantity: 20,
    unit: "doses",
    reorderLevel: 10,
    location: "Sala Fria",
    lastUpdated: "2025-11-18",
  },
  {
    id: 3,
    name: "Suplemento Mineral",
    category: "Suplementos",
    quantity: 40,
    unit: "kg",
    reorderLevel: 30,
    location: "Deposito B",
    lastUpdated: "2025-11-19",
  },
];

export default function Insumos() {
  const [items, setItems] = useState(() => {
    try {
      const raw = localStorage.getItem("insumos_items");
      return raw ? JSON.parse(raw) : sampleItems;
    } catch {
      return sampleItems;
    }
  });

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unit: "kg",
    reorderLevel: "",
    location: "",
  });

  useEffect(() => {
    // TODO: replace with API persistence when backend is available
    localStorage.setItem("insumos_items", JSON.stringify(items));
  }, [items]);

  const lowStock = useMemo(
    () => items.filter((i) => i.quantity <= i.reorderLevel),
    [items]
  );
  const totalItems = items.length;

  function addItem(e) {
    e.preventDefault();
    if (!form.name || !form.category) return;
    const newItem = {
      id: Date.now(),
      name: form.name,
      category: form.category,
      quantity: Number(form.quantity) || 0,
      unit: form.unit || "kg",
      reorderLevel: Number(form.reorderLevel) || 0,
      location: form.location || "",
      lastUpdated: new Date().toISOString().slice(0, 10),
    };
    setItems([newItem, ...items]);
    setForm({
      name: "",
      category: "",
      quantity: "",
      unit: "kg",
      reorderLevel: "",
      location: "",
    });
  }

  function updateQuantity(id, delta) {
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              quantity: Math.max(0, it.quantity + delta),
              lastUpdated: new Date().toISOString().slice(0, 10),
            }
          : it
      )
    );
  }

  const confirm = useConfirm();
  async function removeItem(id) {
    const ok = await confirm(
      "Remover insumo",
      "Tem certeza que deseja remover este insumo?"
    );
    if (!ok) return;
    setItems((prev) => prev.filter((it) => it.id !== id));
  }

  const categories = useMemo(() => {
    const set = new Set(items.map((i) => i.category));
    return ["", ...Array.from(set)];
  }, [items]);

  const filtered = useMemo(
    () =>
      items
        .filter((it) => (category ? it.category === category : true))
        .filter((it) =>
          query ? it.name.toLowerCase().includes(query.toLowerCase()) : true
        ),
    [items, category, query]
  );

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">📦 Gestão de Insumos</h2>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total de produtos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Itens com baixo estoque</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              {lowStock.length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Ações rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <Button
                onClick={() =>
                  setForm({
                    name: "Ração Padrão",
                    category: "Ração",
                    quantity: 100,
                    unit: "kg",
                    reorderLevel: 20,
                    location: "Silo A",
                  })
                }
              >
                Exemplo: adicionar item
              </Button>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="flex gap-2 items-center">
        <Input
          placeholder="Buscar por nome..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="border rounded p-2"
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c || "Todas categorias"}
            </option>
          ))}
        </select>
        <Button
          variant="outline"
          onClick={() => {
            setQuery("");
            setCategory("");
          }}
        >
          Limpar
        </Button>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Adicionar/Editar insumo</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addItem} className="space-y-3">
              <Input
                placeholder="Nome do insumo"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                placeholder="Categoria"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Quantidade"
                  type="number"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm({ ...form, quantity: e.target.value })
                  }
                />
                <Input
                  placeholder="Unidade"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                />
                <Input
                  placeholder="Nível de reposição"
                  type="number"
                  value={form.reorderLevel}
                  onChange={(e) =>
                    setForm({ ...form, reorderLevel: e.target.value })
                  }
                />
              </div>
              <Input
                placeholder="Localização"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
              />
              <div className="flex gap-2">
                <Button type="submit">Adicionar</Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    setForm({
                      name: "",
                      category: "",
                      quantity: "",
                      unit: "kg",
                      reorderLevel: "",
                      location: "",
                    })
                  }
                >
                  Limpar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Itens em estoque</CardTitle>
          </CardHeader>
          <CardContent>
            {filtered.length === 0 ? (
              <p className="text-gray-500">Nenhum produto encontrado.</p>
            ) : (
              <div className="space-y-2">
                {filtered.map((it) => (
                  <div
                    key={it.id}
                    className="p-2 rounded border flex justify-between items-center"
                  >
                    <div>
                      <div className="font-semibold">
                        {it.name}{" "}
                        <span className="text-xs text-muted-foreground">
                          ({it.category})
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Qtd: {it.quantity} {it.unit} • Loc: {it.location}
                      </div>
                    </div>
                    <div className="flex gap-2 items-center">
                      <Button
                        size="sm"
                        onClick={() => updateQuantity(it.id, -1)}
                      >
                        -1
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => updateQuantity(it.id, 1)}
                      >
                        +1
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removeItem(it.id)}
                      >
                        Remover
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
