import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "@/services/api"; // <-- import da API

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nome_completo: "",
    email: "",
    palavra_passe: "",
    senha: "",
    data_nascimento: "",
    contacto: "",
    fazenda: "",
    tipo_gado: "",
    tamanho_gado: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.palavra_passe !== form.senha) {
      alert("Senhas não coincidem!");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        nome_completo: form.nome_completo,
        email: form.email,
        password: form.senha,
        data_nascimento: form.data_nascimento,
        contacto: form.contacto,
        fazenda: form.fazenda,
        tipo_gado: form.tipo_gado,
        tamanho_gado: form.tamanho_gado,
      });

      // ✅ Alteração: redireciona direto para confirmação de email
      alert("Conta criada! Por favor, confirme seu email.");
      navigate("/verificacao-email");
    } catch (error) {
      console.error(error);
      alert("Erro ao criar conta. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 grid md:grid-cols-2">
      {/* LADO ESQUERDO - IMAGEM */}
      <div className="hidden md:flex items-center justify-center rounded-r-3xl overflow-hidden">
        <img src="/fundo.jpeg" alt="AgroTech" className="h-full w-full object-cover" />
      </div>

      {/* LADO DIREITO - FORMULÁRIO */}
      <div className="flex items-center justify-center bg-gray-100 px-4">
        <Card className="w-full max-w-xl p-6">
          <CardHeader>
            <CardTitle className="text-center text-2xl font-bold">Criar conta</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  placeholder="Nome completo"
                  value={form.nome_completo}
                  onChange={(e) => handleChange("nome_completo", e.target.value)}
                  required
                />
                <Input
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  type="password"
                  placeholder="Senha"
                  value={form.palavra_passe}
                  onChange={(e) => handleChange("palavra_passe", e.target.value)}
                  required
                />
                <Input
                  type="password"
                  placeholder="Confirmar senha"
                  value={form.senha}
                  onChange={(e) => handleChange("senha", e.target.value)}
                  required
                />
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                <Input
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => handleChange("data_nascimento", e.target.value)}
                  required
                />
                <Input
                  placeholder="Contacto"
                  value={form.contacto}
                  onChange={(e) => handleChange("contacto", e.target.value)}
                />
              </div>

              <Input
                placeholder="Nome da Fazenda"
                value={form.fazenda}
                onChange={(e) => handleChange("fazenda", e.target.value)}
              />

              <div className="grid md:grid-cols-2 gap-3">
                <Select onValueChange={(v) => handleChange("tipo_gado", v)}>
                  <SelectTrigger><SelectValue placeholder="Tipo de gado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="corte">Corte</SelectItem>
                    <SelectItem value="leiteiro">Leiteiro</SelectItem>
                    <SelectItem value="ambos">Misto</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(v) => handleChange("tamanho_gado", v)}>
                  <SelectTrigger><SelectValue placeholder="Tamanho do gado" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pequeno">Até 30 cabeças</SelectItem>
                    <SelectItem value="medio">31–100 cabeças</SelectItem>
                    <SelectItem value="grande">Mais de 100 cabeças</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full mt-2" disabled={loading}>
                {loading ? "Criando..." : "Registrar"}
              </Button>

              <p className="text-center text-sm text-gray-600">
                Já tem uma conta?{" "}
                <Link to="/login" className="text-primary hover:underline">Entrar</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
