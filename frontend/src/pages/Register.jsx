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
    provincia: "",
    municipio: "",
    tipo_gado: "",
    palavra_passe: "",
    senha: "",
  });

  const [municipios, setMunicipios] = useState([]);

  const dados = {
    Luanda: ["Belas", "Cacuaco", "Cazenga", "Ícolo e Bengo", "Luanda", "Quissama", "Talatona", "Viana"],
    Bengo: ["Ambriz", "Bula Atumba", "Dande", "Dembos", "Nambuangongo", "Pango Aluquém"],
    Benguela: ["Baía Farta", "Balombo", "Benguela", "Bocoio", "Caimbambo", "Catumbela", "Chongoroi", "Cubal", "Ganda", "Lobito"],
    Bié: ["Andulo", "Camacupa", "Catabola", "Chinguar", "Chitembo", "Cuemba", "Cunhinga", "Kuito"],
    Cabinda: ["Belize", "Buco-Zau", "Cabinda", "Cacongo"],
    "Cuando Cubango": ["Calai", "Cuangar", "Cuchi", "Cuito Cuanavale", "Dirico", "Mavinga", "Menongue", "Rivungo"],
    "Cuanza Norte": ["Ambaca", "Banga", "Bolongongo", "Cambambe", "Cazengo", "Golungo Alto", "Lucala", "Quiculungo", "Samba Cajú"],
    "Cuanza Sul": ["Amboim", "Cassongue", "Conda", "Ebo", "Libolo", "Mussende", "Porto Amboim", "Quibala", "Quilenda", "Seles", "Sumbe"],
    Cunene: ["Cahama", "Cuanhama", "Curoca", "Cuvelai", "Namacunde", "Ombadja"],
    Huambo: ["Bailundo", "Caála", "Ecunha", "Huambo", "Londuimbali", "Longonjo", "Mungo", "Tchicala Tcholohanga", "Tchindjenje", "Ukuma"],
    Huíla: ["Caconda", "Cacula", "Caluquembe", "Chiange", "Chibia", "Chicomba", "Chipindo", "Humpata", "Jamba", "Lubango", "Matala", "Quilengues", "Quipungo"],
    "Lunda Norte": ["Cambulo", "Capenda-Camulemba", "Caungula", "Chitato", "Cuango", "Cuilo", "Lubalo", "Lucapa", "Xá-Muteba"],
    "Lunda Sul": ["Cacolo", "Dala", "Muconda", "Saurimo"],
    Malanje: ["Cacuso", "Calandula", "Cambundi-Catembo", "Cangandala", "Caombo", "Cunda-Dia-Baze", "Luquembo", "Malanje", "Marimba", "Massango", "Quela", "Quirima"],
    Moxico: ["Alto Zambeze", "Bundas", "Camanongue", "Cameia", "Léua", "Luau", "Luacano", "Luchazes", "Moxico"],
    Namibe: ["Bibala", "Camucuio", "Moçâmedes", "Tômbwa", "Virei"],
    Uíge: ["Alto Cauale", "Ambuíla", "Bembe", "Buengas", "Bungo", "Damba", "Maquela do Zombo", "Mucaba", "Negage", "Puri", "Quimbele", "Quitexe", "Sanza Pombo", "Songo", "Uíge", "Zombo"],
    Zaire: ["Cuimba", "Mabanza Kongo", "Nóqui", "Nzeto", "Soyo", "Tomboco"],
  };

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });

    if (key === "provincia") {
      setMunicipios(dados[value] || []);
      setForm({ ...form, provincia: value, municipio: "" });
    }
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

            <label className="text-sm font-medium text-gray-700">Data de fundação da fazenda</label>
            <Input type="date" value={form.data_nascimento} onChange={(e) => handleChange("data_nascimento", e.target.value)} required />

            <Input placeholder="Contato (opcional)" value={form.contacto} onChange={(e) => handleChange("contacto", e.target.value)} />

            <Input placeholder="Nome da Fazenda (opcional)" value={form.fazenda} onChange={(e) => handleChange("fazenda", e.target.value)} />

            <Select onValueChange={(v) => handleChange("provincia", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma província" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(dados).map((prov) => (
                  <SelectItem key={prov} value={prov}>
                    {prov}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={(v) => handleChange("municipio", v)} disabled={!form.provincia}>
              <SelectTrigger>
                <SelectValue placeholder={form.provincia ? "Selecione o município" : "Selecione uma província primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {municipios.map((mun) => (
                  <SelectItem key={mun} value={mun}>
                    {mun}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            <Input type="password" placeholder="Senha" value={form.palavra_passe} onChange={(e) => handleChange("palavra_passe", e.target.value)} required />

            <Input type="password" placeholder="Confirme a senha" value={form.senha} onChange={(e) => handleChange("senha", e.target.value)} required />

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
