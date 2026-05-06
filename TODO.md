# TODO.md - Plano de Conexão Backend-Frontend ✅ APROVADO

## ✅ **1. Criar ficheiros .env (COMPLETO)** 
- [x] `frontend/.env` criado com `VITE_API_URL=http://localhost:8000`
- [x] `backend/.env` criado com configurações Django/CORS

## 🔄 **2. Preparar Backend (EXECUTAR AGORA)**
```
cd backend
python manage.py makemigrations
python manage.py migrate  
python manage.py createsuperuser
python manage.py runserver
```

## ⏳ **3. Testar Frontend**
```
cd frontend
npm install
npm run dev
```

## ⏳ **4. Verificação Final**
- [ ] Acessar `http://localhost:5173/login`
- [ ] Fazer login como produtor
- [ ] Dashboard carrega dados do backend

---
**ESTADO:** Configuração pronta! Executa os comandos do backend no terminal e partilha o output.

