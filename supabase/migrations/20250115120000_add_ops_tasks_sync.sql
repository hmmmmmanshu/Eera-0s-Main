-- Add sync_to_dashboard field to ops_tasks table
ALTER TABLE public.ops_tasks 
ADD COLUMN IF NOT EXISTS sync_to_dashboard BOOLEAN NOT NULL DEFAULT false;

-- Add ops_task_id to tasks table to track which ops task it came from
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS ops_task_id UUID REFERENCES public.ops_tasks(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_tasks_ops_task_id ON public.tasks(ops_task_id);
CREATE INDEX IF NOT EXISTS idx_ops_tasks_sync_to_dashboard ON public.ops_tasks(sync_to_dashboard);

-- Add comment for clarity
COMMENT ON COLUMN public.ops_tasks.sync_to_dashboard IS 'If true, this ops task will be synced to the dashboard tasks table';
COMMENT ON COLUMN public.tasks.ops_task_id IS 'Reference to the ops_tasks record if this task was synced from Ops Hub';

