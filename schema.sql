-- Client Management System Schema
-- This SQL script defines the tables for the MVP.

-- For simplicity, we use text-based enums initially.
-- In a production Supabase environment, you might want to create custom ENUM types.
-- e.g., CREATE TYPE client_status AS ENUM ('Lead', 'Active', ...);

-- Table to store client information
CREATE TABLE clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL, -- Link to the user account
    name TEXT NOT NULL,
    business_name TEXT,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    industry TEXT,
    status TEXT NOT NULL DEFAULT 'Lead', -- Lead, Discovery, Proposal, Active, Completed, Archived
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    -- In a multi-tenant setup, you would also add:
    -- designer_id UUID REFERENCES auth.users(id)
);
COMMENT ON COLUMN clients.status IS 'Status of the client relationship: Lead, Discovery, Proposal, Active, Completed, Archived';

-- Table to store project information, linked to a client
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    package TEXT, -- Essential, Professional, Premium
    status TEXT NOT NULL DEFAULT 'Discovery', -- Discovery, Design, Revision, Delivery
    deadline TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN projects.status IS 'Current stage of the project: Discovery, Design, Revision, Delivery';
COMMENT ON COLUMN projects.package IS 'The package or tier of service for this project';

-- Table for project deliverables checklist
CREATE TABLE project_deliverables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    completed BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for files associated with a project, stored in Supabase Storage
CREATE TABLE project_files (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL, -- The path to the file in Supabase Storage bucket
    version TEXT,
    uploaded_by_user_id UUID REFERENCES auth.users(id),
    uploaded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN project_files.storage_path IS 'The full path to the file in the Supabase Storage bucket.';

-- Table for brand discovery questionnaires
CREATE TABLE questionnaires (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE, -- Each project has only one questionnaire
    responses JSONB,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON TABLE questionnaires IS 'Stores client responses to brand discovery or other forms.';

-- Table for comments/communication within a project
CREATE TABLE project_comments (
    id BIGSERIAL PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id),
    comment TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Table for tracking payments
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending', -- Pending, Paid
    invoice_link TEXT,
    due_date DATE,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
COMMENT ON COLUMN payments.status IS 'Payment status: Pending, Paid';

-- Enable Row Level Security (RLS) for all tables
-- This is a crucial step in Supabase to secure your data.
-- Policies will be defined in the application logic or another SQL script.
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_deliverables ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaires ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Note on Policies:
-- RLS policies need to be created to control access. For example:
-- - Designers can see all clients and projects.
-- - Clients can only see their own projects and client details.
-- - Anonymous users should not be able to see anything.
--
-- Example Policy (for reference):
-- CREATE POLICY "Allow designers to see all clients"
-- ON clients FOR SELECT
-- USING (auth.uid() IN (SELECT user_id FROM designer_profiles));
--
-- CREATE POLICY "Allow clients to see their own details"
-- ON clients FOR SELECT
-- USING (id = (SELECT client_id FROM user_profiles WHERE user_id = auth.uid()));
