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

-- Tabela de jogos
CREATE TABLE games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Gera UUID automaticamente
    code VARCHAR(20) UNIQUE NOT NULL, -- Código para que outros jogadores entrem na sala
    status VARCHAR(20) CHECK (status IN ('waiting', 'in_progress', 'completed')) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de jogadores em um jogo
CREATE TABLE game_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Gera UUID automaticamente
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER DEFAULT 0,
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_host BOOLEAN DEFAULT FALSE
);

-- Tabela de rodadas de um jogo
CREATE TABLE game_rounds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Gera UUID automaticamente
    game_id UUID REFERENCES games(id) ON DELETE CASCADE,
    round_number INTEGER NOT NULL,
    status VARCHAR(20) CHECK (status IN ('in_progress', 'completed')) NOT NULL,
    started_at TIMESTAMP,
    ended_at TIMESTAMP
);

-- Tabela de leaderboard
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Gera UUID automaticamente
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    daily_score INTEGER DEFAULT 0,
    weekly_score INTEGER DEFAULT 0,
    monthly_score INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
