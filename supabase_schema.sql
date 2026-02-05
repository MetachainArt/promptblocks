-- PromptBlocks 데이터베이스 스키마
-- Supabase SQL Editor에서 실행하세요

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE user_plan AS ENUM ('free', 'pro');
CREATE TYPE block_type AS ENUM (
    'subject_type', 'style', 'appearance', 'outfit',
    'pose_expression', 'props_objects', 'background_environment',
    'lighting', 'camera_lens', 'color_mood', 'text_in_image',
    'composition', 'tech_params'
);
CREATE TYPE ai_provider AS ENUM ('gpt', 'gemini');

-- Users table (extends Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    plan user_plan DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User settings table
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    preferred_ai ai_provider DEFAULT 'gpt',
    monthly_decompose_count INT DEFAULT 0,
    monthly_reset_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Prompts table
CREATE TABLE prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    original_text TEXT NOT NULL,
    ai_used ai_provider,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Blocks table
CREATE TABLE blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    prompt_id UUID REFERENCES prompts(id) ON DELETE SET NULL,
    block_type block_type NOT NULL,
    content TEXT NOT NULL,
    tags VARCHAR(50)[] DEFAULT '{}',
    is_favorite BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Presets table
CREATE TABLE presets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Preset blocks junction table
CREATE TABLE preset_blocks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    preset_id UUID REFERENCES presets(id) ON DELETE CASCADE,
    block_id UUID REFERENCES blocks(id) ON DELETE CASCADE,
    order_index INT NOT NULL
);

-- Collections table
CREATE TABLE collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    emoji VARCHAR(10),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add collection_id to blocks (nullable, null = 미분류)
ALTER TABLE blocks ADD COLUMN collection_id UUID REFERENCES collections(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX idx_collections_user ON collections(user_id);
CREATE INDEX idx_blocks_collection ON blocks(collection_id);
CREATE INDEX idx_blocks_user_collection ON blocks(user_id, collection_id);
CREATE INDEX idx_blocks_user_type ON blocks(user_id, block_type);
CREATE INDEX idx_blocks_user_created ON blocks(user_id, created_at DESC);
CREATE INDEX idx_blocks_user_favorite ON blocks(user_id, is_favorite);
CREATE INDEX idx_prompts_user_created ON prompts(user_id, created_at DESC);
CREATE INDEX idx_presets_user ON presets(user_id);
CREATE INDEX idx_preset_blocks_preset ON preset_blocks(preset_id, order_index);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE presets ENABLE ROW LEVEL SECURITY;
ALTER TABLE preset_blocks ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- USERS
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON users FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);

-- USER_SETTINGS
CREATE POLICY "Users can CRUD own settings"
ON user_settings FOR ALL
USING (auth.uid() = user_id);

-- PROMPTS
CREATE POLICY "Users can CRUD own prompts"
ON prompts FOR ALL
USING (auth.uid() = user_id);

-- BLOCKS
CREATE POLICY "Users can CRUD own blocks"
ON blocks FOR ALL
USING (auth.uid() = user_id);

-- PRESETS
CREATE POLICY "Users can CRUD own presets"
ON presets FOR ALL
USING (auth.uid() = user_id);

-- COLLECTIONS
CREATE POLICY "Users can CRUD own collections"
ON collections FOR ALL
USING (auth.uid() = user_id);

-- PRESET_BLOCKS
CREATE POLICY "Users can CRUD own preset_blocks"
ON preset_blocks FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM presets
        WHERE presets.id = preset_blocks.preset_id
        AND presets.user_id = auth.uid()
    )
);

-- Function to create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email)
    VALUES (NEW.id, NEW.email);

    INSERT INTO public.user_settings (user_id)
    VALUES (NEW.id);

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
