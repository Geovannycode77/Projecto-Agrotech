import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    data_nascimento: "",
    contacto: "",
    fazenda: "",
    tipo_gado: "",
    palavra_passe: "",
    senha: "",
  });

  
  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });

  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Dados enviados:", form);
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 px-4">
      <Card className="w-full max-w-lg p-6">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">Registro - AgroTech</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input placeholder="Nome completo" value={form.nome_completo} onChange={(e) => handleChange("nome_completo", e.target.value)} required />

            <Input type="email" placeholder="Email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required />
            <Input type="password" placeholder="Senha" value={form.palavra_passe} onChange={(e) => handleChange("palavra_passe", e.target.value)} required />

            <Input type="password" placeholder="Confirme a senha" value={form.senha} onChange={(e) => handleChange("senha", e.target.value)} required />

            
            <label className="text-sm font-medium text-white">Data de fundação da fazenda</label>
            <Input type="date" value={form.data_nascimento} onChange={(e) => handleChange("data_nascimento", e.target.value)} required />

            <Input placeholder="Contato (opcional)" value={form.contacto} onChange={(e) => handleChange("contacto", e.target.value)} />

            <Input placeholder="Nome da Fazenda (opcional)" value={form.fazenda} onChange={(e) => handleChange("fazenda", e.target.value)} />


            <Select onValueChange={(v) => handleChange("tipo_gado", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de gado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corte">Corte</SelectItem>
                <SelectItem value="leiteiro">Leiteiro</SelectItem>
                <SelectItem value="ambos">Corte e Leiteiro</SelectItem>
              </SelectContent>
            </Select>

            <Button type="submit" className="w-full">
              Registrar
            </Button>

            <p className="text-center text-sm mt-2">
              Já tem uma conta?{" "}
              <Link to="/login" className="text-blue-600 hover:underline">
                Entrar
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
