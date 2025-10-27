-- Create HR roles table for job descriptions
CREATE TABLE public.hr_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  department TEXT,
  jd_text TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  requirements JSONB DEFAULT '[]'::jsonb,
  responsibilities JSONB DEFAULT '[]'::jsonb,
  salary_range TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HR candidates table
CREATE TABLE public.hr_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES public.hr_roles(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  resume_url TEXT,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  status TEXT NOT NULL DEFAULT 'applied',
  applied_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  interview_notes TEXT,
  screening_results JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HR employees table
CREATE TABLE public.hr_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  candidate_id UUID REFERENCES public.hr_candidates(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  designation TEXT NOT NULL,
  department TEXT,
  salary DECIMAL(12, 2) NOT NULL,
  employment_type TEXT DEFAULT 'full-time',
  start_date DATE NOT NULL,
  end_date DATE,
  performance_score DECIMAL(3, 2) CHECK (performance_score >= 0 AND performance_score <= 5),
  contract_id UUID,
  manager_id UUID REFERENCES public.hr_employees(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HR payroll table
CREATE TABLE public.hr_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  payment_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  tax_deduction DECIMAL(12, 2) DEFAULT 0,
  bonuses DECIMAL(12, 2) DEFAULT 0,
  deductions DECIMAL(12, 2) DEFAULT 0,
  net_amount DECIMAL(12, 2),
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HR appraisals table
CREATE TABLE public.hr_appraisals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  review_period TEXT NOT NULL,
  rating DECIMAL(3, 2) NOT NULL CHECK (rating >= 0 AND rating <= 5),
  comments TEXT,
  strengths TEXT,
  areas_for_improvement TEXT,
  goals JSONB DEFAULT '[]'::jsonb,
  reviewed_by TEXT,
  review_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HR documents table
CREATE TABLE public.hr_docs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES public.hr_employees(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  version TEXT DEFAULT '1.0',
  url TEXT,
  content TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  category TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create HR events table for activity tracking
CREATE TABLE public.hr_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  source_hub TEXT NOT NULL,
  event_type TEXT NOT NULL,
  action TEXT NOT NULL,
  result TEXT,
  entity_type TEXT,
  entity_id UUID,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.hr_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_candidates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_docs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.hr_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for hr_roles
CREATE POLICY "Users can view their own roles"
  ON public.hr_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own roles"
  ON public.hr_roles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own roles"
  ON public.hr_roles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own roles"
  ON public.hr_roles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hr_candidates
CREATE POLICY "Users can view their own candidates"
  ON public.hr_candidates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own candidates"
  ON public.hr_candidates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own candidates"
  ON public.hr_candidates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own candidates"
  ON public.hr_candidates FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hr_employees
CREATE POLICY "Users can view their own employees"
  ON public.hr_employees FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own employees"
  ON public.hr_employees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own employees"
  ON public.hr_employees FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own employees"
  ON public.hr_employees FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hr_payroll
CREATE POLICY "Users can view their own payroll"
  ON public.hr_payroll FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payroll"
  ON public.hr_payroll FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payroll"
  ON public.hr_payroll FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payroll"
  ON public.hr_payroll FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hr_appraisals
CREATE POLICY "Users can view their own appraisals"
  ON public.hr_appraisals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own appraisals"
  ON public.hr_appraisals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own appraisals"
  ON public.hr_appraisals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own appraisals"
  ON public.hr_appraisals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hr_docs
CREATE POLICY "Users can view their own docs"
  ON public.hr_docs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own docs"
  ON public.hr_docs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own docs"
  ON public.hr_docs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own docs"
  ON public.hr_docs FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for hr_events
CREATE POLICY "Users can view their own events"
  ON public.hr_events FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own events"
  ON public.hr_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_hr_roles_user_id ON public.hr_roles(user_id);
CREATE INDEX idx_hr_roles_status ON public.hr_roles(status);
CREATE INDEX idx_hr_candidates_user_id ON public.hr_candidates(user_id);
CREATE INDEX idx_hr_candidates_role_id ON public.hr_candidates(role_id);
CREATE INDEX idx_hr_candidates_status ON public.hr_candidates(status);
CREATE INDEX idx_hr_employees_user_id ON public.hr_employees(user_id);
CREATE INDEX idx_hr_employees_status ON public.hr_employees(status);
CREATE INDEX idx_hr_payroll_user_id ON public.hr_payroll(user_id);
CREATE INDEX idx_hr_payroll_employee_id ON public.hr_payroll(employee_id);
CREATE INDEX idx_hr_appraisals_user_id ON public.hr_appraisals(user_id);
CREATE INDEX idx_hr_appraisals_employee_id ON public.hr_appraisals(employee_id);
CREATE INDEX idx_hr_docs_user_id ON public.hr_docs(user_id);
CREATE INDEX idx_hr_events_user_id ON public.hr_events(user_id);

-- Create trigger for updated_at columns
CREATE TRIGGER update_hr_roles_updated_at
  BEFORE UPDATE ON public.hr_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_candidates_updated_at
  BEFORE UPDATE ON public.hr_candidates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_employees_updated_at
  BEFORE UPDATE ON public.hr_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_payroll_updated_at
  BEFORE UPDATE ON public.hr_payroll
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_appraisals_updated_at
  BEFORE UPDATE ON public.hr_appraisals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_hr_docs_updated_at
  BEFORE UPDATE ON public.hr_docs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();