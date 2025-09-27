# EntreNós - Configuração do Supabase

## 📋 Pré-requisitos

1. Conta no [Supabase](https://supabase.com)
2. Projeto criado no Supabase

## 🔧 Configuração do Supabase

### 1. Configurar OAuth com Google

1. No painel do Supabase, vá para **Authentication > Providers**
2. Ative o provider **Google**
3. Configure as credenciais OAuth:
   - **Client ID**: Seu Google Client ID
   - **Client Secret**: Seu Google Client Secret

### 2. Configurar URLs de Redirect

Adicione estas URLs no seu projeto Google OAuth:
- **Development**: `http://localhost:5173/`
- **Production**: `https://seu-dominio.com/`

### 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-chave-anonima
```

**Como encontrar essas informações:**
1. Vá para **Settings > API** no painel do Supabase
2. Copie a **URL** e **anon public key**

### 4. Configurar Banco de Dados (Opcional)

Caso queira armazenar perfis de usuários, execute este SQL:

```sql
-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  avatar_url TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Política para usuários verem apenas seus próprios dados
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Política para usuários atualizarem apenas seus próprios dados  
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Política para inserir perfil
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 🚀 Comandos para Executar

```bash
# Instalar dependências
yarn install

# Configurar variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais

# Executar em desenvolvimento
yarn dev

# Build para produção
yarn build
```

## 📝 Funcionalidades Implementadas

- ✅ **Login com Google** via Supabase Auth
- ✅ **Proteção de rotas** autenticadas
- ✅ **Persistência de sessão** automática
- ✅ **Logout** com limpeza de estado
- ✅ **Interface responsiva** com informações do usuário
- ✅ **Avatar e nome** do usuário na navegação

## 🔐 Segurança

- As rotas protegidas redirecionam para login se não autenticado
- Tokens de autenticação são gerenciados automaticamente
- Sessões são persistentes e seguras
- Logout limpa completamente o estado de autenticação

## 🎨 UI/UX

- **Login moderno** com botão Google estilizado
- **Loading states** durante autenticação
- **Feedback visual** de erros
- **Avatar do usuário** na navegação
- **Botão de logout** com confirmação visual