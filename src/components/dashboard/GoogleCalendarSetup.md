# Google Calendar Sync Setup

To enable Google Calendar synchronization, follow these steps:

## 1. Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Calendar API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Calendar API"
   - Click "Enable"

## 2. Create OAuth 2.0 Credentials

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "OAuth 2.0 Client ID"
3. Configure the OAuth consent screen if needed
4. For Application type, select "Web application"
5. Add authorized redirect URIs:
   - `https://your-domain.com/auth/callback`
   - `http://localhost:3000/auth/callback` (for development)
6. Save the Client ID and Client Secret

## 3. Add Credentials to Your App

You need to add your Google Calendar API credentials as environment variables:

1. In your application's environment configuration, add the following:
   - `VITE_GOOGLE_CLIENT_ID`: Your OAuth 2.0 Client ID
   - `VITE_GOOGLE_CLIENT_SECRET`: Your OAuth 2.0 Client Secret
   - `GOOGLE_CALENDAR_ACCESS_TOKEN`: User's access token (obtained after OAuth flow)

## 4. Implement OAuth Flow

The OAuth flow needs to be implemented in your application:

```typescript
// Example OAuth flow (to be implemented in your app)
const getGoogleAuthUrl = () => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  const redirectUri = `${window.location.origin}/auth/callback`;
  const scope = 'https://www.googleapis.com/auth/calendar';
  
  return `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}&` +
    `redirect_uri=${redirectUri}&` +
    `response_type=code&` +
    `scope=${scope}&` +
    `access_type=offline`;
};
```

## 5. Using the Sync Function

Once configured, tasks and meetings can be synced to Google Calendar:

```typescript
// Sync a single task/meeting
await supabase.functions.invoke('sync-google-calendar', {
  body: {
    action: 'sync_task',
    eventData: {
      id: taskId,
      title: 'Task title',
      description: 'Task description',
      due_date: '2025-01-20T10:00:00Z',
      type: 'task'
    }
  }
});

// Sync all unsynced tasks and meetings
await supabase.functions.invoke('sync-google-calendar', {
  body: { action: 'sync_all' }
});
```

## Required Google Calendar API Scopes

- `https://www.googleapis.com/auth/calendar` - Full calendar access
- `https://www.googleapis.com/auth/calendar.events` - Events only

## Notes

- Access tokens expire after 1 hour. You'll need to implement token refresh
- Use the refresh token to get new access tokens without user interaction
- Store tokens securely using environment variables or a secure secret management system
- Consider implementing webhook listeners for two-way sync
