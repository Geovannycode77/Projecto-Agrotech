import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

const DEFAULT_GESTATION_DAYS = 283; // valor padrão pra bovino (ajustável)

export default function Reproducao() {
  const [records, setRecords] = useState([]);
  const [form, setForm] = useState({
    femaleTag: "",
    maleTag: "",
    method: "natural",
    breedingDate: "",
  });
  const [eventos, setEventos] = useState([]);
  const [formEvento, setFormEvento] = useState({
    animal: "",
    tipo: "",
    data: "",
    observacao: "",
  });

  const tiposEvento = [
    "Inseminação",
    "Cobertura",
    "Parto",
    "Aborto",
    "Diagnóstico de gestação",
  ];

  function handleChange(e) {
    setFormEvento({ ...formEvento, [e.target.name]: e.target.value });
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!formEvento.animal || !formEvento.tipo || !formEvento.data) return;
    setEventos([
      ...eventos,
      { ...formEvento, id: Date.now() },
    ]);
    setFormEvento({ animal: "", tipo: "", data: "", observacao: "" });
  }

  // carrega registros do localStorage — útil para desenvolvimento sem backend
  useEffect(() => {
    const raw = localStorage.getItem("repro_records");
    if (raw) setRecords(JSON.parse(raw));
  }, []);

  useEffect(() => {
    localStorage.setItem("repro_records", JSON.stringify(records));
  }, [records]);

  const addRecord = () => {
    if (!form.femaleTag || !form.breedingDate) return;

    const breedingDate = new Date(form.breedingDate);
    // calcula data estimada de parto
    const estimated = new Date(breedingDate);
    estimated.setDate(breedingDate.getDate() + DEFAULT_GESTATION_DAYS);

    const newRec = {
      id: Date.now(),
      femaleTag: form.femaleTag.trim(),
      maleTag: form.maleTag.trim(),
      method: form.method,
      breedingDate: form.breedingDate,
      estimatedCalving: estimated.toISOString().slice(0, 10),
      status: "pendente", // pendente, gestante, nascido
    };

    setRecords([newRec, ...records]);
    setForm({ femaleTag: "", maleTag: "", method: "natural", breedingDate: "" });
  };

  const removeRecord = (id) => setRecords(records.filter((r) => r.id !== id));

  const updateStatus = (id, status) => {
    setRecords(records.map((r) => (r.id === id ? { ...r, status } : r)));
  };

  const stats = {
    total: records.length,
    gestantes: records.filter((r) => r.status === "gestante").length,
    nascidos: records.filter((r) => r.status === "nascido").length,
  };

   return (
     <div className="space-y-6">
       <h2 className="text-2xl font-semibold">🔁 Gestão de Reprodução</h2>

       {/* Cards de estatísticas */}
       <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
         {/* ...cards existentes... */}
       </section>

       {/* Formulário e tabela de eventos */}
       <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
         {/* Formulário de cadastro de eventos */}
         <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
           <div>
             <label className="block mb-1 font-medium">Animal</label>
             <input
               type="text"
               name="animal"
               value={formEvento.animal}
               onChange={handleChange}
               className="w-full border rounded p-2"
               placeholder="Identificação do animal"
               required
             />
           </div>
           <div>
             <label className="block mb-1 font-medium">Tipo de evento</label>
             <select
               name="tipo"
               value={formEvento.tipo}
               onChange={handleChange}
               className="w-full border rounded p-2"
               required
             >
               <option value="">Selecione</option>
               {tiposEvento.map((tipo) => (
                 <option key={tipo} value={tipo}>{tipo}</option>
               ))}
             </select>
           </div>
           <div>
             <label className="block mb-1 font-medium">Data</label>
             <input
               type="date"
               name="data"
               value={formEvento.data}
               onChange={handleChange}
               className="w-full border rounded p-2"
               required
             />
           </div>
           <div>
             <label className="block mb-1 font-medium">Observação</label>
             <input
               type="text"
               name="observacao"
               value={formEvento.observacao}
               onChange={handleChange}
               className="w-full border rounded p-2"
               placeholder="Observações (opcional)"
             />
           </div>
           <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-semibold">Adicionar evento</button>
         </form>

         {/* Tabela de eventos */}
         <div>
           <h3 className="text-lg font-bold mb-2">Eventos cadastrados</h3>
           {eventos.length === 0 ? (
             <p className="text-gray-500">Nenhum evento registrado.</p>
           ) : (
             <table className="w-full border rounded overflow-hidden">
               <thead className="bg-gray-100 dark:bg-gray-700">
                 <tr>
                   <th className="p-2 text-left">Animal</th>
                   <th className="p-2 text-left">Tipo</th>
                   <th className="p-2 text-left">Data</th>
                   <th className="p-2 text-left">Observação</th>
                 </tr>
               </thead>
               <tbody>
                 {eventos.map((ev) => (
                   <tr key={ev.id} className="border-t">
                     <td className="p-2">{ev.animal}</td>
                     <td className="p-2">{ev.tipo}</td>
                     <td className="p-2">{ev.data}</td>
                     <td className="p-2">{ev.observacao}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           )}
         </div>
       </div>
     </div>
   );
