# Design: Refresh Usage with Progress Bars

## Overview
Add refresh functionality to fetch usage data from `http://localhost:3000/ollama/usage` and display usage as colored progress bars in the table.

## API Contract

### Endpoint
```
GET http://localhost:3000/ollama/usage
```

### Request
```typescript
{
  auth: string;  // account.authToken
}
```

### Response
```typescript
{
  sessionUsage: number;      // percentage 0-100
  sessionResetIn: string;    // e.g., "2h 30m"
  weeklySessionUsage: number; // percentage 0-100
  weeklySessionResetIn: string; // e.g., "3d 12h"
}
```

## Changes

### 1. Hook: useOllamaAccounts.ts
Add `refreshAccountUsage(accountId: string, authToken: string)` function:
- POST to `/ollama/usage` with `{ auth: authToken }`
- On success: update Firestore document with returned usage data
- On error: throw for UI to handle
- Firestore real-time listener automatically updates UI

### 2. Component: OllamaAccountsTable.tsx
**Progress Bar Component:**
```typescript
interface UsageProgressBarProps {
  value: number;        // 0-100 percentage
  label: string;        // e.g., "45/100"
}
```

**Color Logic:**
- 0% → Green (`progress-success`)
- 1-30% → Green (`progress-success`)
- 31-70% → Blue (`progress-info`)
- 71-100% → Red (`progress-error`)

**Table Column Changes:**
Replace text display with progress bars:
- Session Usage: progress bar + "X%" text
- Weekly Usage: progress bar + "X%" text
- Keep Reset In columns as text

**Refresh Handler:**
- Call new `refreshAccountUsage` from props
- Show loading state on refresh button while fetching
- Handle errors (toast/alert - use existing pattern if any)

### 3. Type: ollamaAccount.ts
No changes needed - fields already exist.

## UI/UX

### Progress Bar Design
- DaisyUI `progress` component
- Height: `h-4` or `h-3`
- Width: 100px max in table cell
- Color classes applied dynamically based on value

### Loading State
- Refresh button shows spinner while fetching
- Disable button during fetch
- Re-enable on success/error

## Error Handling
- Network errors: show alert/toast
- API errors (4xx/5xx): show specific message
- Firestore update failures: propagate error to UI

## Testing

### Manual Test Steps
1. Add an Ollama account
2. Click Refresh button
3. Verify:
   - API call made with correct auth token
   - Progress bars appear with correct colors
   - Session reset time displays
   - Weekly reset time displays
4. Test color thresholds:
   - 0% → green
   - 35% → blue
   - 75% → red

## File Changes Summary

| File | Change |
|------|--------|
| `src/hooks/useOllamaAccounts.ts` | Add `refreshAccountUsage` function |
| `src/components/OllamaAccountsTable.tsx` | Add ProgressBar component, update columns, wire refresh handler |
| `src/types/ollamaAccount.ts` | No changes |

## Dependencies
- Existing: `fetch` API, DaisyUI progress component, Firestore SDK
- No new dependencies required
