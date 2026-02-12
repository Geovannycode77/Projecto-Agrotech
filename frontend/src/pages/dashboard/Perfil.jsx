import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useConfirm } from "@/components/ui/useConfirm";

export default function Perfil() {
  const [active, setActive] = useState("account");
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    farm: "",
    phone: "",
  });
  const confirm = useConfirm();

  useEffect(() => {
    const stored = localStorage.getItem("perfil_data");
    if (stored) setProfile(JSON.parse(stored));
  }, []);

  const save = () => {
    localStorage.setItem("perfil_data", JSON.stringify(profile));
    alert("Dados salvos com sucesso!");
  };

  const resetProfile = async () => {
    const ok = await confirm(
      "Remover perfil",
      "Deseja remover os dados do perfil?"
    );
    if (ok) {
      localStorage.removeItem("perfil_data");
      setProfile({ name: "", email: "", farm: "", phone: "" });
    }
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto grid grid-cols-12 gap-6">
        {/* Left: Farmer card + settings menu */}
        <aside className="col-span-3">
          <Card className="p-4 bg-white/95 border border-primary/20 shadow">
            <div className="flex flex-col items-center text-center">
              <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                {profile.name ? profile.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div className="mt-3">
                <div className="font-semibold text-lg">
                  {profile.name || "Usuário"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {profile.farm || "Fazenda"}
                </div>
                <div className="text-xs text-muted-foreground">
                  {profile.email || "email@example.com"}
                </div>
              </div>
            </div>
            <div className="mt-6">
              <nav className="flex flex-col gap-2">
                <button
                  onClick={() => setActive("account")}
                  className={`text-left px-3 py-2 rounded ${
                    active === "account"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  Conta
                </button>
                <button
                  onClick={() => setActive("farm")}
                  className={`text-left px-3 py-2 rounded ${
                    active === "farm"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  Fazenda
                </button>
                <button
                  onClick={() => setActive("notifications")}
                  className={`text-left px-3 py-2 rounded ${
                    active === "notifications"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  Notificações
                </button>
                <button
                  onClick={() => setActive("security")}
                  className={`text-left px-3 py-2 rounded ${
                    active === "security"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-primary/10"
                  }`}
                >
                  Segurança
                </button>
                <Button
                  variant="destructive"
                  size="sm"
                  className="mt-2"
                  onClick={resetProfile}
                >
                  Remover dados
                </Button>
              </nav>
            </div>
          </Card>
        </aside>

        {/* Right: Content */}
        <section className="col-span-9">
          <Card className="p-6 bg-white/95 border border-primary/20 shadow">
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Perfil</CardTitle>
            </CardHeader>
            <CardContent>
              {active === "account" && (
                <div className="space-y-4">
                  <Input
                    placeholder="Nome"
                    value={profile.name}
                    onChange={(e) =>
                      setProfile({ ...profile, name: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Email"
                    value={profile.email}
                    onChange={(e) =>
                      setProfile({ ...profile, email: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Telefone"
                    value={profile.phone}
                    onChange={(e) =>
                      setProfile({ ...profile, phone: e.target.value })
                    }
                  />
                  <div className="flex gap-2 justify-end">
                    <Button onClick={save}>Salvar</Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setProfile({ name: "", email: "", farm: "", phone: "" })
                      }
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {active === "farm" && (
                <div className="space-y-4">
                  <Input
                    placeholder="Nome da fazenda"
                    value={profile.farm}
                    onChange={(e) =>
                      setProfile({ ...profile, farm: e.target.value })
                    }
                  />
                  <Input
                    placeholder="Localização"
                    value={profile.location}
                    onChange={(e) =>
                      setProfile({ ...profile, location: e.target.value })
                    }
                  />
                  <div className="flex gap-2 justify-end">
                    <Button onClick={save}>Salvar</Button>
                  </div>
                </div>
              )}

              {active === "notifications" && (
                <div className="space-y-3">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="form-checkbox h-4 w-4"
                    />
                    <span>Ativar notificações por email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="form-checkbox h-4 w-4"
                    />
                    <span>SMS</span>
                  </label>
                  <div className="flex gap-2 justify-end">
                    <Button>Salvar</Button>
                  </div>
                </div>
              )}

              {active === "security" && (
                <div className="space-y-3">
                  <Input placeholder="Senha atual" type="password" />
                  <Input placeholder="Nova senha" type="password" />
                  <Input placeholder="Confirmar nova senha" type="password" />
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary">Alterar senha</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
