-- Script SEGURO para adicionar campo 'type' à tabela transactions
-- Este script preserva TODOS os dados existentes
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a coluna já existe antes de adicionar
DO $$ 
BEGIN
    -- Verificar se a coluna 'type' já existe
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'type' 
        AND table_schema = 'public'
    ) THEN
        -- Adicionar coluna type com valor padrão 'expense'
        ALTER TABLE public.transactions 
        ADD COLUMN type TEXT DEFAULT 'expense';
        
        -- Adicionar constraint de verificação
        ALTER TABLE public.transactions 
        ADD CONSTRAINT check_transaction_type 
        CHECK (type IN ('expense', 'income'));
        
        RAISE NOTICE 'Coluna type adicionada com sucesso!';
    ELSE
        RAISE NOTICE 'Coluna type já existe na tabela transactions.';
    END IF;
END $$;

-- 2. Garantir que todas as transações existentes tenham o tipo 'expense'
-- (Só atualiza registros onde type é NULL)
UPDATE public.transactions 
SET type = 'expense' 
WHERE type IS NULL OR type = '';

-- 3. Criar índice para o campo type (se não existir)
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions USING btree (type);

-- 4. Verificar o resultado final
SELECT 
    COUNT(*) as total_transactions,
    COUNT(CASE WHEN type = 'expense' THEN 1 END) as expenses,
    COUNT(CASE WHEN type = 'income' THEN 1 END) as income,
    COUNT(CASE WHEN type IS NULL THEN 1 END) as null_types
FROM public.transactions;

-- 5. Mostrar estrutura da tabela atualizada
SELECT 
    column_name, 
    data_type, 
    column_default, 
    is_nullable,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'transactions' 
AND table_schema = 'public'
ORDER BY ordinal_position;