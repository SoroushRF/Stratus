# Stratus System Architecture

## Overview

Stratus follows a **Serverless, Edge-First Architecture**. It is designed to minimize cold starts, ensure global low latency, and maintain strict type safety from the database to the client.

## High-Level Data Flow

```mermaid
graph TD
    Client[Client (Next.js / React 19)]
    
    subgraph Edge Layer [Vercel Edge Network]
        Auth[Auth0 Middleware]
        Router[App Router]
        Actions[Server Actions]
    end
    
    subgraph Data Layer [Supabase / PostgreSQL]
        DB[(Primary DB)]
        RLS[Row Level Security]
        Realtime[Realtime Engine]
    end
    
    subgraph AI Layer [External Services]
        Gemini[Google Gemini 2.5]
        Weather[Tomorrow.io API]
    end
    
    Client -->|HTTPS| Auth
    Auth -->|Valid Header| Router
    Router -->|RSC Payload| Client
    Client -->|Server Action| Actions
    
    Actions -->|Query| DB
    DB -->|Policy Check| RLS
    RLS -->|Result| Actions
    
    Actions -->|Prompt| Gemini
    Actions -->|Forecast Req| Weather
    
    Gemini -->|JSON| Actions
    Weather -->|Hourly Data| Actions
```

## Core Components

### 1. The Frontend (Client)
- **Framework**: Next.js 15
- **Rendering Strategy**: Mixed. Marketing pages are Static (SSG). Dashboard is Dynamic (SSR/RSC). Interactive islands (forms, toggles) are Client Components (`use client`).
- **State Management**: React Server Components handle initial data fetching. Client state uses URL Search Params (for shareability) and local React State (for ephemeral UI).

### 2. The Intelligence Layer (Server Actions)
We do not explicit `pages/api` routes for most features. Instead, we use **Server Actions**.
- **Location**: `src/app/actions.ts`
- **Benefit**: End-to-end type safety without generating Swagger docs.
- **Security**: All actions validate the Auth0 Session Cookie before execution.

### 3. The Database (Supabase)
- **Role**: Primary Source of Truth.
- **Tables**:
  - `users`: Extends Auth0 profile.
  - `schedules`: Stores the parsed JSON extraction of classes.
  - `universities`: Geo-spatial reference data.
- **Security**: Heavily relies on **Row Level Security (RLS)**. See [Security Policies](../SECURITY_RLS_POLICIES.sql).

### 4. Admin Nexus
- **Route**: `/admin/*`
- **Protection**: Double-Lock Mechanism.
  1.  **Middleware**: Checks Auth0 Token for `admin` role claim.
  2.  **Database**: Checks `public.users.is_admin` boolean column.
  - *Why both?* Token claims can be stale (up to 1h). The DB check is instant.

## Integration Patterns

### Weather Matching Algorithm
1.  **Input**: Class Time (e.g., "Mon 14:00"), Campus Lat/Long.
2.  **Fetch**: Get 24h hourly forecast for Campus.
3.  **Slice**: Extract the window `[ClassTime - 30m]` to `[ClassTime + 30m]`.
4.  **Analyze**:
    - If `PrecipitationProbability > 30%` -> Flag "Rain".
    - If `WindGust > 15mph` -> Flag "Windy".
    - Calculate `FeelsLike` delta from `BaseTemp`.

### AI Context Engine
1.  **Prompt Construction**:
    - Inject `UserPreferences` (run cold, run hot).
    - Inject `WeatherSlice`.
    - Inject `ClassActivity` (Lecture vs Gym).
2.  **Generative Step**: Gemini 2.5 produces a structured JSON recommendation.
3.  **Validation**: Zod schema validation ensures the AI didn't hallucinate invalid specific fields.

## Deployment Strategy
- **Production**: Vercel (Edge Network).
- **Database**: Supabase (AWS us-east-1).
- **CI/CD**: GitHub Actions runs the Test Suite on every PR.
