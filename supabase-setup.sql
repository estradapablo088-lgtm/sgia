-- ============================================
-- SGIA — Tablas para Supabase
-- Ejecuta esto en: Supabase > SQL Editor > New Query
-- ============================================

-- 1. Tabla de perfiles de usuario (se crea auto al registrarse)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre TEXT,
  credits INTEGER DEFAULT 1, -- 1 crédito gratis al registrarse
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger para crear perfil automáticamente al registrarse
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre, credits)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'nombre', 1);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Tabla de anuncios generados
CREATE TABLE IF NOT EXISTS public.anuncios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  negocio TEXT,
  tipo TEXT,
  descripcion TEXT,
  oferta TEXT,
  tono TEXT,
  formato TEXT,
  variaciones JSONB, -- Las 3 variaciones de copy
  imagen_url TEXT,   -- URL de la imagen generada por DALL-E
  pagado BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Tabla de pagos/transacciones
CREATE TABLE IF NOT EXISTS public.pagos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  anuncio_id UUID REFERENCES public.anuncios(id) ON DELETE SET NULL,
  amount DECIMAL(10,2),
  currency TEXT DEFAULT 'USD',
  status TEXT DEFAULT 'pending', -- pending, completed
  paypal_ref TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Habilitar Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anuncios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pagos ENABLE ROW LEVEL SECURITY;

-- 5. Políticas de seguridad — cada usuario solo ve sus datos
CREATE POLICY "Users read own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users read own anuncios" ON public.anuncios
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own anuncios" ON public.anuncios
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own anuncios" ON public.anuncios
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users read own pagos" ON public.pagos
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own pagos" ON public.pagos
  FOR INSERT WITH CHECK (auth.uid() = user_id);
