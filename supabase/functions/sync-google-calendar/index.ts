import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { action, eventData } = await req.json();

    // Get Google Calendar access token (stored in user's profile or secrets)
    const GOOGLE_ACCESS_TOKEN = Deno.env.get('GOOGLE_CALENDAR_ACCESS_TOKEN');
    
    if (!GOOGLE_ACCESS_TOKEN) {
      throw new Error('Google Calendar not configured. Please add your access token in settings.');
    }

    switch (action) {
      case 'sync_task': {
        // Create event in Google Calendar
        const calendarEvent = {
          summary: eventData.title,
          description: eventData.description,
          start: {
            dateTime: eventData.start_time || eventData.due_date,
            timeZone: 'UTC',
          },
          end: {
            dateTime: eventData.end_time || eventData.due_date,
            timeZone: 'UTC',
          },
        };

        const response = await fetch(
          'https://www.googleapis.com/calendar/v3/calendars/primary/events',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(calendarEvent),
          }
        );

        if (!response.ok) {
          const error = await response.json();
          throw new Error(`Google Calendar API error: ${error.error?.message || 'Unknown error'}`);
        }

        const createdEvent = await response.json();

        // Update task/meeting with Google Calendar event ID
        const tableName = eventData.type === 'task' ? 'tasks' : 'meetings';
        await supabaseClient
          .from(tableName)
          .update({ google_calendar_event_id: createdEvent.id })
          .eq('id', eventData.id);

        return new Response(
          JSON.stringify({ success: true, eventId: createdEvent.id }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      case 'sync_all': {
        // Fetch all tasks and meetings
        const { data: tasks } = await supabaseClient
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .is('google_calendar_event_id', null);

        const { data: meetings } = await supabaseClient
          .from('meetings')
          .select('*')
          .eq('user_id', user.id)
          .is('google_calendar_event_id', null);

        const syncPromises = [];

        // Sync tasks
        if (tasks) {
          for (const task of tasks) {
            const calendarEvent = {
              summary: task.title,
              description: task.description,
              start: { dateTime: task.due_date, timeZone: 'UTC' },
              end: { dateTime: task.due_date, timeZone: 'UTC' },
            };

            syncPromises.push(
              fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(calendarEvent),
              }).then(async (res) => {
                const event = await res.json();
                await supabaseClient
                  .from('tasks')
                  .update({ google_calendar_event_id: event.id })
                  .eq('id', task.id);
              })
            );
          }
        }

        // Sync meetings
        if (meetings) {
          for (const meeting of meetings) {
            const calendarEvent = {
              summary: meeting.title,
              description: meeting.description,
              start: { dateTime: meeting.start_time, timeZone: 'UTC' },
              end: { dateTime: meeting.end_time, timeZone: 'UTC' },
              location: meeting.location,
            };

            syncPromises.push(
              fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${GOOGLE_ACCESS_TOKEN}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify(calendarEvent),
              }).then(async (res) => {
                const event = await res.json();
                await supabaseClient
                  .from('meetings')
                  .update({ google_calendar_event_id: event.id })
                  .eq('id', meeting.id);
              })
            );
          }
        }

        await Promise.all(syncPromises);

        return new Response(
          JSON.stringify({ success: true, synced: syncPromises.length }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
