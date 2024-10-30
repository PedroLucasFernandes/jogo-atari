
-- Habilita a extensão pgcrypto para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Cria a tabela de usuários com UUID
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL
);







