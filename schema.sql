-- Habilita a extensão pgcrypto para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Adiciona um valor padrão que gera UUIDs automaticamente
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255), -- Campo opcional se o jogador optar por OAuth
    oauth_provider VARCHAR(100), -- Indica o provedor de OAuth (Google, Facebook, etc.)
    oauth_id VARCHAR(255),
    username VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (oauth_provider, oauth_id)
);

-- Tabela de leaderboard
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Gera UUID automaticamente
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    total_score INTEGER DEFAULT 0,
    total_games_played INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
