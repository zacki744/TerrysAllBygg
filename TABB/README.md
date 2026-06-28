# Terrys AllBygg — Backend Documentation

**Version:** 1.0  
**Stack:** .NET 8 · ASP.NET Core · Dapper · MySQL  
**Skapad:** 2026  

---

## Innehåll

1. [Systemöversikt](#1-systemöversikt)
2. [Funktionella krav](#2-funktionella-krav)
3. [Tekniska krav](#3-tekniska-krav)
4. [Arkitektur](#4-arkitektur)
5. [Lagerstruktur och ansvarsfördelning](#5-lagerstruktur-och-ansvarsfördelning)
6. [Databasschema](#6-databasschema)
7. [Autentisering och auktorisering](#7-autentisering-och-auktorisering)
8. [API-specifikation](#8-api-specifikation)
9. [Bildhantering](#9-bildhantering)
10. [E-posttjänst](#10-e-posttjänst)
11. [Rate limiting](#11-rate-limiting)
12. [Felhantering och loggning](#12-felhantering-och-loggning)
13. [Arkitekturbeslut (ADRs)](#13-arkitekturbeslut-adrs)
14. [Säkerhetsöverväganden](#14-säkerhetsöverväganden)
15. [Konfiguration och hemligheter](#15-konfiguration-och-hemligheter)

---

## 1. Systemöversikt

Terrys AllBygg-backend är en **ASP.NET Core 8 Web API** som tjänar två syften:

1. Exponera ett REST API för frontend-applikationen (React SPA)
2. Serva själva React-bygget som statiska filer från `wwwroot/app/`

Systemet är en **single-binary monolith** där API och frontend distribueras tillsammans som en enhet till en Simply.com-server via FTP. Det finns ingen container-miljö, ingen reverse proxy och ingen separation mellan frontend- och backend-host — .NET-processen hanterar allt.

```
Internet
   │
   ▼
Simply.com (port 443)
   │
   ├── /api/*         → ASP.NET Core Controllers
   ├── /uploads/*     → Statiska filer (uppladdade bilder)
   └── /*             → React SPA (wwwroot/app/index.html fallback)
```

---

## 2. Funktionella krav

### 2.1 Publika funktioner

| ID | Krav |
|---|---|
| FR-01 | Systemet ska exponera en lista av byggprojekt med titel, beskrivning och huvudbild |
| FR-02 | Systemet ska exponera detaljvy för ett projekt med samtliga bilder |
| FR-03 | Systemet ska exponera en lista av snickerier med titel, beskrivning, pris och bild |
| FR-04 | Systemet ska exponera detaljvy för ett snickeri med samtliga bilder |
| FR-05 | Besökare ska kunna skicka en konsultationsförfrågan via formulär |
| FR-06 | Besökare ska kunna skicka en förfrågan om ett specifikt snickeri |
| FR-07 | Förfrågningar ska generera e-post till Terry samt bekräftelsemail till kunden |

### 2.2 Admin-funktioner

| ID | Krav |
|---|---|
| FR-08 | Administratör ska kunna logga in med e-post och lösenord |
| FR-09 | Inloggad admin ska kunna skapa, läsa, uppdatera och radera projekt |
| FR-10 | Inloggad admin ska kunna skapa, läsa, uppdatera och radera snickerier |
| FR-11 | Inloggad admin ska kunna ladda upp bilder kopplade till projekt och snickerier |
| FR-12 | Systemet ska automatiskt komprimera och ändra storlek på uppladdade bilder |
| FR-13 | Admin ska kunna bjuda in nya administratörer via e-post |
| FR-14 | Admin ska kunna skicka lösenordsåterställningslänk till ett befintligt konto |
| FR-15 | Admin ska kunna radera andra admin-konton, men inte det sista |
| FR-16 | Bjudna användare ska sätta sitt eget lösenord via tidsbegränsad länk (1 h) |
| FR-17 | Lösenordsåterställning ska ske via tidsbegränsad länk (24 h) |

---

## 3. Tekniska krav

### 3.1 Prestanda

| ID | Krav |
|---|---|
| TR-01 | Uppladdade bilder ska konverteras till JPEG med max 1 600 px bredd och kvalitet 82 |
| TR-02 | Statiska filer (JS/CSS med hash) ska cachas i 1 år (`immutable`) |
| TR-03 | `index.html` ska inte cachas (`no-cache, no-store`) |
| TR-04 | Uppladdade bilder ska cachas i 1 år (UUID-filnamn är immutable) |

### 3.2 Säkerhet

| ID | Krav |
|---|---|
| TR-05 | JWT-token ska lagras i httpOnly Secure SameSite=Strict cookie, aldrig i localStorage |
| TR-06 | Lösenord ska hashas med BCrypt |
| TR-07 | Bilduppladdning ska validera MIME-typ via magic bytes, inte bara filändelse |
| TR-08 | Filsökvägar ska valideras mot uploads-roten för att förhindra path traversal |
| TR-09 | Admin-endpoints ska kräva `[Authorize(Roles = "Admin")]` |
| TR-10 | Rate limiting ska tillämpas på publika formulär och admin-inloggning |
| TR-11 | CORS ska begränsas till kända origins i produktion |

### 3.3 Tillförlitlighet

| ID | Krav |
|---|---|
| TR-12 | Alla ohanterade undantag ska fångas av global middleware och returnera strukturerad JSON |
| TR-13 | E-postfel ska loggas men inte krascha API-anropet |
| TR-14 | Temporär fil ska användas vid bilduppladdning; flytt sker atomärt efter lyckad kodning |
| TR-15 | Systemet ska exponera `/health`-endpoint |

### 3.4 Underhållbarhet

| ID | Krav |
|---|---|
| TR-16 | Loggning ska ske med Serilog till konsol och rullande dagsfiler (14 dagars retention) |
| TR-17 | Dependency Injection ska användas genomgående via `IServiceCollection` |
| TR-18 | Konfiguration ska separeras från kod via `appsettings.json` och User Secrets |

---

## 4. Arkitektur

### 4.1 Lagerdiagram

```
┌─────────────────────────────────────────────────────────────┐
│                        API-lager                            │
│  Controllers · Middleware · Extensions · Helpers            │
├─────────────────────────────────────────────────────────────┤
│                      Tjänstlager                            │
│  AuthService · ProjectsService · SnickeriService            │
│  EmailService · UserManagementService                       │
├─────────────────────────────────────────────────────────────┤
│                    Dataåtkomstlager                         │
│  MySqlDatabase (IDatabase) · MySqlConnectionFactory         │
├─────────────────────────────────────────────────────────────┤
│                       Modellager                            │
│  DTOs · Request-modeller · Domänentiteter                   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
    MySQL (Simply.com)
```

### 4.2 Solution-struktur

```
TABB/
├── API/                    # Presentationslager (ASP.NET Core)
│   ├── Controllers/
│   │   ├── Admin/          # Skyddade admin-endpoints
│   │   │   ├── AdminProjectsController.cs
│   │   │   ├── AdminSnickeriController.cs
│   │   │   ├── AuthController.cs
│   │   │   ├── ImageController.cs
│   │   │   └── UserManagementController.cs
│   │   ├── BookingController.cs
│   │   ├── ProjectsController.cs
│   │   └── SnickeriController.cs
│   ├── Extensions/
│   │   └── RateLimitingExtensions.cs
│   ├── Helpers/
│   │   └── ImageUploadHelper.cs
│   ├── Middleware/
│   │   └── GlobalExceptionHandler.cs
│   └── Program.cs
│
├── Model/                  # Delade datakontrakt
│   ├── Admin/
│   ├── Booking/
│   ├── Mail/
│   ├── Project/
│   └── Snickeri/
│
└── Servises/               # Affärslogik och infrastruktur
    └── Src/
        ├── Auth/
        ├── DB/
        ├── Mail/
        ├── Projects/
        └── Snickerier/
```

### 4.3 Dependency graph

```
API.csproj
  ├── → Models.csproj
  └── → Services.csproj
          └── → Models.csproj
```

Modell-projektet har inga beroenden på de övriga — det är ett rent datakontrakt-bibliotek. Tjänstlagret beror på modeller men inte på API-lagret. API-lagret beror på båda.

---

## 5. Lagerstruktur och ansvarsfördelning

### 5.1 API-lager (`TABB/API`)

**Ansvar:** HTTP-hantering, routing, autentisering, rate limiting, statisk filservering.

Controllerna är tunna — de validerar ModelState, delegerar till tjänster och formaterar HTTP-svar. Ingen affärslogik lever i controllerna.

**`Program.cs`** konfigurerar hela middleware-pipeline i ordning:

```
GlobalExceptionHandler
→ HttpsRedirection
→ CORS
→ StaticFiles (wwwroot/app — frontend)
→ StaticFiles (/uploads — bilder)
→ Authentication
→ Authorization
→ RateLimiter
→ Controllers
→ SPA Fallback (index.html för icke-API-routes)
```

**`GlobalExceptionHandler`** fångar alla ohanterade undantag och returnerar strukturerad JSON med `error`, `status`, `path` och `traceId`. Undantag av typen `ArgumentException` ger 400, `UnauthorizedAccessException` ger 401, `KeyNotFoundException` ger 404, övriga ger 500.

**`ImageUploadHelper`** är en statisk hjälpklass som hanterar validering (magic bytes, filstorlek, tillåtna filändelser) och path-säkerhet — den lever i API-lagret eftersom den är tätt kopplad till `IFormFile`.

### 5.2 Tjänstlager (`TABB/Servises`)

**Ansvar:** Affärslogik, databasoperationer, e-postutskick, autentiseringslogik.

Alla tjänster registreras som `Scoped` (en instans per HTTP-request) via `DependencyInjection.cs`.

| Tjänst | Interface | Ansvar |
|---|---|---|
| `AuthService` | `IAuthService` | Login, JWT-generering, BCrypt |
| `UserManagementService` | `IUserManagementService` | Admin-konton, inbjudningar, lösenordsåterställning |
| `ProjectsService` | `IProjectsService` | CRUD för projekt, bild-JSON-hantering |
| `SnickeriService` | `ISnickeriService` | CRUD för snickerier, bild-JSON-hantering |
| `EmailService` | `IEmailService` | Koordinerar e-postutskick, hanterar fel |
| `SmtpEmailSender` | `IEmailSender` | Lågnivå SMTP-kommunikation |
| `MySqlDatabase` | `IDatabase` | Generisk CRUD mot MySQL via Dapper |
| `MySqlConnectionFactory` | `IDbConnectionFactory` | Skapar och öppnar databasanslutningar |

### 5.3 Dataåtkomstlager (`IDatabase`)

`MySqlDatabase` implementerar ett generiskt CRUD-interface som bygger SQL dynamiskt med reflection:

```csharp
Task<IReadOnlyList<TDto>> ReadAsync<TDto>(string table, object? where, CancellationToken ct)
Task<TDto?> ReadSingleAsync<TDto>(string table, object where, CancellationToken ct)
Task<int> InsertAsync<TDto>(string table, TDto dto, CancellationToken ct)
Task<int> UpdateAsync<TDto>(string table, object where, TDto dto, CancellationToken ct)
Task<int> DeleteAsync(string table, object where, CancellationToken ct)
```

Tabellnamn skyddas med backtick-quotes i SQL. Where-parametrar namnges med prefix `w_` för att undvika kollision med UPDATE-kolumner. Alla parametrar skickas via Dapper-parameterisering — ingen strängkonkatenering.

**OBS:** Tabellnamnet skickas som en sträng från anropande kod. Se ADR-005 för diskussion om denna risk.

### 5.4 Modellager (`TABB/Model`)

Innehåller enbart databärande klasser, inga beroenden på ramverk. Separerat i ett eget projekt för att möjliggöra delning mellan API och tjänstlager utan cirkulära beroenden.

**Namnkonventioner:**
- `*Request` — inkommande HTTP-body från klient
- `*Response` / `*Overview` / `*Detailed*` — utgående DTO till klient  
- `*DbDto` — internt DTO för Dapper-mappning (matchar databaskolumner)

---

## 6. Databasschema

Dapper med `DefaultTypeMap.MatchNamesWithUnderscores = true` är aktiverat, vilket mappar `snake_case`-kolumner till `PascalCase`-properties.

### `projects`

```sql
CREATE TABLE projects (
    id          VARCHAR(36)  PRIMARY KEY,
    title       VARCHAR(255) NOT NULL,
    description TEXT         NOT NULL,
    main_image  VARCHAR(500),
    images      JSON,                    -- JSON-array med sökvägar till extra bilder
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `snickerier`

```sql
CREATE TABLE snickerier (
    id          VARCHAR(36)    PRIMARY KEY,
    title       VARCHAR(255)   NOT NULL,
    description TEXT           NOT NULL,
    price       DECIMAL(10, 2) NOT NULL,
    main_image  VARCHAR(500),
    images      JSON,                    -- JSON-array med sökvägar till extra bilder
    created_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### `admin_users`

```sql
CREATE TABLE admin_users (
    id            VARCHAR(36)  PRIMARY KEY,
    username      VARCHAR(255) NOT NULL,   -- används som display name, sätts = email
    email         VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `admin_invitations`

```sql
CREATE TABLE admin_invitations (
    id         VARCHAR(36)  PRIMARY KEY,
    email      VARCHAR(255) NOT NULL,
    token      VARCHAR(255) NOT NULL UNIQUE,
    expires_at DATETIME     NOT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
    id            VARCHAR(36)  PRIMARY KEY,
    admin_user_id VARCHAR(36)  NOT NULL,
    token         VARCHAR(255) NOT NULL UNIQUE,
    expires_at    DATETIME     NOT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

### Bildlagring

Bilder lagras som sökvägar i databasen — **inte som binärdata**. Filer sparas i `uploads/projects/` på servern och serveras statiskt av .NET via `/uploads/*`. Huvud-bild (`main_image`) och extra bilder (`images`) hålls separata i schemat men slås ihop till en ordnad lista i tjänstlagret (`ProjectsService.GetProjectByIdAsync`).

---

## 7. Autentisering och auktorisering

### 7.1 Flöde

```
1. POST /api/admin/auth/login
   → Validera email + BCrypt-lösenord mot admin_users
   → Generera JWT (24 h livstid)
   → Sätt httpOnly Secure SameSite=Strict cookie "auth_token"
   → Returnera { email } (ej token) till klient

2. Efterföljande requests
   → JwtBearerEvents.OnMessageReceived läser token ur cookie
   → ASP.NET Core validerar token och populerar ClaimsPrincipal
   → [Authorize(Roles = "Admin")] kontrollerar roll-claim

3. POST /api/admin/auth/logout
   → Radera cookie via Response.Cookies.Delete
```

### 7.2 JWT-claims

| Claim | Värde |
|---|---|
| `ClaimTypes.NameIdentifier` | `admin_users.id` |
| `ClaimTypes.Name` | `admin_users.email` |
| `ClaimTypes.Email` | `admin_users.email` |
| `ClaimTypes.Role` | `"Admin"` |

### 7.3 Inbjudningsflöde

```
Admin → POST /api/admin/users/invite { email }
  → Generera URL-säker base64-token (48 bytes)
  → Spara i admin_invitations med ExpiresAt = UtcNow + 1h
  → Skicka e-post med länk: {baseUrl}/admin/accept-invite?token=...

Ny användare → GET /admin/accept-invite?token=...
  → Frontend validerar token: GET /api/admin/auth/validate-token?token=...&type=invite
  → Användare sätter lösenord
  → POST /api/admin/auth/accept-invite { token, password }
    → Skapa admin_users-rad med BCrypt-hash
    → Radera inbjudningsraden
```

### 7.4 Lösenordsåterställning

```
Admin → POST /api/admin/users/{id}/reset-password
  → Hämta email för userId
  → Generera token, spara i password_reset_tokens (ExpiresAt = UtcNow + 24h)
  → Skicka e-post med länk

Användare → POST /api/admin/auth/reset-password { token, newPassword }
  → Validera token mot password_reset_tokens (ej utgången)
  → Uppdatera password_hash i admin_users
  → Radera token-rad
```

---

## 8. API-specifikation

### 8.1 Publika endpoints

#### `GET /api/projects`
Returnerar lista med projektöversikter.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "title": "Utomhusbastu",
    "description": "En friggebodsbastu...",
    "image": "/uploads/projects/abc123.jpg"
  }
]
```

#### `GET /api/projects/details/{id}`
Returnerar fullständigt projekt med alla bilder.

**Response 200:**
```json
{
  "id": "uuid",
  "title": "Utomhusbastu",
  "description": "...",
  "images": ["/uploads/projects/main.jpg", "/uploads/projects/extra1.jpg"]
}
```
**Response 404:** `{ "error": "Project not found" }`

#### `GET /api/snickerier`
Returnerar lista med snickeri-översikter.

**Response 200:**
```json
[
  {
    "id": "uuid",
    "title": "Ek-bänk",
    "description": "Handgjord bänk...",
    "price": 4500.00,
    "image": "/uploads/projects/bench.jpg"
  }
]
```

#### `GET /api/snickerier/details/{id}`
**Response 200:**
```json
{
  "id": "uuid",
  "title": "Ek-bänk",
  "description": "...",
  "price": 4500.00,
  "images": ["/uploads/projects/bench.jpg"]
}
```

#### `POST /api/snickerier/inquire`
**Rate limit:** 5 req / 10 min per IP

**Body:**
```json
{
  "snickeriId": "uuid",
  "snickeriTitle": "Ek-bänk",
  "snickeriPrice": 4500.00,
  "name": "Anna Svensson",
  "email": "anna@example.se",
  "phoneNumber": "070-123 45 67",
  "notes": "Önskar i mörkare trä"
}
```
**Response 200:** `{ "message": "Förfrågan skickad!" }`

#### `POST /api/Booking/create`
**Rate limit:** 5 req / 10 min per IP

**Body:**
```json
{
  "name": "Anna Svensson",
  "email": "anna@example.se",
  "phoneNumber": "070-123 45 67",
  "placement": "utomhus",
  "other1": null,
  "project": "bastu",
  "other2": null,
  "address": "Storgatan 1, Simrishamn",
  "description": "Vill ha en utomhusbastu på ca 6 kvm"
}
```
**Response 200:** `{ "message": "Booking request sent successfully" }`

### 8.2 Admin-endpoints

Alla kräver giltig `auth_token`-cookie med Admin-roll.

#### `POST /api/admin/auth/login`
**Rate limit:** 10 req / 15 min per IP

**Body:** `{ "email": "...", "password": "..." }`  
**Response 200:** `{ "email": "admin@example.se" }` (sätter cookie)  
**Response 401:** `{ "error": "Fel e-post eller lösenord" }`

#### `POST /api/admin/image/upload`
**Content-Type:** `multipart/form-data`  
**Max storlek:** 50 MB

**Response 200:**
```json
{
  "success": true,
  "path": "/uploads/projects/uuid.jpg",
  "fileName": "uuid.jpg"
}
```
**Response 400:** `{ "error": "File content does not match its extension." }`

#### `POST /api/admin/projects`
**Body:** `CreateProjectRequest`
```json
{
  "title": "Altan Österlen",
  "description": "...",
  "mainImage": "/uploads/projects/uuid.jpg",
  "additionalImages": ["/uploads/projects/uuid2.jpg"]
}
```
**Response 201:** `{ "id": "uuid", "message": "Project created successfully" }`

---

## 9. Bildhantering

### 9.1 Pipeline

```
IFormFile (klient)
   │
   ├── 1. Validering (ImageUploadHelper.ValidateAsync)
   │       ├── Filstorlek ≤ 50 MB
   │       ├── Tillåten filändelse (.jpg .jpeg .png .gif .webp .heic .heif .hif)
   │       └── Magic bytes matchar filändelse
   │
   ├── 2. HEIC-konvertering (om .heic/.heif/.hif)
   │       └── Magick.NET → JPEG 95% + AutoOrient + Strip metadata
   │
   ├── 3. Avkodning (SkiaSharp SKCodec)
   │
   ├── 4. EXIF-orientering (ApplyExifOrientation)
   │       └── Roterar/speglar bitmap baserat på SKEncodedOrigin
   │
   ├── 5. Resize (om bredd > 1 600 px)
   │       └── Mitchell-Netravali filter (Linear + Linear mipmap)
   │
   ├── 6. JPEG-kodning (kvalitet 82)
   │
   └── 7. Atomär filskrivning
           ├── Skriv till {uuid}.jpg.tmp
           └── File.Move(temp → final, overwrite: true)
```

### 9.2 Säkerhet

**Magic byte-validering** för varje tillåten typ:

| Typ | Bytes |
|---|---|
| JPEG | `FF D8 FF` (offset 0) |
| PNG | `89 50 4E 47` (offset 0) |
| GIF | `47 49 46 38` (offset 0) |
| WebP | `52 49 46 46` (offset 0) + `WEBP` (offset 8) |
| HEIC/HEIF | `ftyp` (offset 4) + känd brand (offset 8) |

**Path traversal-skydd** via `ImageUploadHelper.ResolveSafePath`:

```csharp
var fullPath = Path.GetFullPath(Path.Combine(uploadsRoot, relative));
if (!fullPath.StartsWith(Path.GetFullPath(uploadsRoot)))
    return null; // blockera
```

### 9.3 Radering

`DELETE /api/admin/image/delete` tar emot `{ "path": "/uploads/projects/uuid.jpg" }` och validerar att sökvägen är inom uploads-roten innan filen tas bort. Radering sker "best effort" från frontend — om backend-anropet misslyckas ignoreras det (filen kan rensas manuellt).

---

## 10. E-posttjänst

### 10.1 Arkitektur

```
Controller
   └── IEmailService (EmailService)
           └── IEmailSender (SmtpEmailSender)
                   └── System.Net.Mail.SmtpClient
```

`EmailService` exponerar högnivå-metoder (`SendBookingEmailsAsync`, `SendSnickeriInquiryAsync` etc.) och anropar `SmtpEmailSender` via den privata `TrySendAsync`-wrappern som fångar undantag och loggar dem utan att propagera vidare.

`SmtpEmailSender` är en tunn wrapper runt `System.Net.Mail.SmtpClient` med SSL aktiverat.

### 10.2 E-postmallar

Alla mallar finns i `EmailTemplate.cs` som statiska metoder som returnerar plaintext-strängar. Mallarna är enkla stränginterpoleringar — inga externa template-motorer används.

| Metod | Mottagare | Trigger |
|---|---|---|
| `BookingAdmin` | Terry (AdminTo) | Konsultationsförfrågan |
| `BookingConfirmation` | Kund | Konsultationsförfrågan |
| `SnickeriInquiryAdmin` | Terry | Snickeri-förfrågan |
| `SnickeriInquiryConfirmation` | Kund | Snickeri-förfrågan |
| `AdminInvite` | Ny admin | Inbjudan |
| `PasswordReset` | Admin | Lösenordsåterställning |

### 10.3 SMTP-konfiguration

- **Host:** `websmtp.simply.com`
- **Port:** 587
- **SSL:** Aktiverat (`EnableSsl = true`)
- **Auth:** NetworkCredential med användarnamn/lösenord

---

## 11. Rate limiting

ASP.NET Core:s inbyggda rate limiting används med tre policyer, alla baserade på klient-IP.

IP-extraktion föredrar `X-Forwarded-For`-headern (för reverse proxies) över `RemoteIpAddress`, med fallback till `"unknown"`.

| Policy | Gräns | Fönster | Tillämpas på |
|---|---|---|---|
| `public-form` | 5 req | 10 min | `/api/Booking/create`, `/api/snickerier/inquire` |
| `admin-login` | 10 req | 15 min | Login, accept-invite, reset-password |
| `general-api` | 120 req | 1 min | Övriga admin-endpoints |

Avvisade requests returnerar HTTP 429 med strukturerad JSON:

```json
{
  "error": "För många förfrågningar. Försök igen om en stund.",
  "retryAfter": 60,
  "status": 429
}
```

`Retry-After`-header sätts på svaret.

---

## 12. Felhantering och loggning

### 12.1 GlobalExceptionHandler

Middleware som registreras **först** i pipeline och omsluter alla efterföljande steg. Mappar undantagstyper till HTTP-statuskoder:

```
ArgumentException          → 400 Bad Request
UnauthorizedAccessException → 401 Unauthorized
KeyNotFoundException        → 404 Not Found
OperationCanceledException  → 503 Service Unavailable
Exception (övrigt)         → 500 Internal Server Error
```

Returnerar alltid:
```json
{
  "error": "Läsbar felmeddelande",
  "status": 500,
  "path": "/api/...",
  "traceId": "..."
}
```

Stacktrace loggas aldrig till HTTP-svaret — bara `traceId` exponeras.

### 12.2 Serilog

Konfigurerat med två sinks:

**Konsol** — development-vänligt format med timestamp, nivå och source context.

**Rullande dagsfiler** — sparas i `../../logs/api-.log` relativt `ContentRootPath`, rollas dagligen, 14 dagars retention.

Miniminivåer:
- `Microsoft.*` → Warning (dämpar ASP.NET Core-brus)
- `Microsoft.Hosting.Lifetime` → Information (visar startup/shutdown)
- `System.*` → Warning
- Övrigt → Information

Serilog request logging ersätter ASP.NET Core:s standardloggning av requests. Requests till `/uploads/` och `/_next/` loggas på `Verbose`-nivå (syns ej normalt). 5xx-svar loggas som `Error`, 4xx som `Warning`, övrigt som `Information`.

---

## 13. Arkitekturbeslut (ADRs)

### ADR-001: Single-binary monolith istället för separata tjänster

**Kontext:** Projektet är en liten företagshemsida med en enda administratör. Hosting sker på ett delat Simply.com-konto utan Docker-stöd.

**Beslut:** .NET-processen serverar både API och React SPA som statiska filer.

**Konsekvenser:**
- ✅ Enkel deployment via FTP — en katalog, en process
- ✅ Ingen CORS-konfiguration behövs i produktion (samma origin)
- ✅ Inga extra infrastrukturkostnader
- ❌ Frontend och backend måste deployas tillsammans
- ❌ Skalas inte horisontellt utan extra arbete

---

### ADR-002: Dapper istället för Entity Framework Core

**Kontext:** Val av ORM för databasåtkomst.

**Beslut:** Dapper med ett generiskt `IDatabase`-interface som bygger SQL via reflection.

**Motivering:** Schemat är enkelt (5 tabeller, inga komplexa joins). Dapper ger full kontroll över SQL, minimal overhead och enkel felsökning. EF Core:s migrations-system och change tracking är överkurs för detta projekt.

**Konsekvenser:**
- ✅ Tunn och förutsägbar databaslagring
- ✅ Lätt att debugga — SQL syns direkt
- ❌ Ingen automatisk schema-migration
- ❌ Mer boilerplate vid komplexa queries

---

### ADR-003: JWT i httpOnly cookie istället för Authorization-header

**Kontext:** Val av mekanism för att bära autentiseringstoken mellan frontend och backend.

**Beslut:** JWT lagras i en `httpOnly Secure SameSite=Strict`-cookie som sätts av backend vid login.

**Motivering:** `httpOnly` gör token oåtkomlig för JavaScript och eliminerar XSS-attack på token. `SameSite=Strict` ger CSRF-skydd. Alternativet (token i localStorage + Authorization-header) är vanligare i SPA men exponerar token för XSS.

**Konsekvenser:**
- ✅ Token kan inte stjälas via XSS
- ✅ CSRF-skydd via SameSite=Strict
- ✅ Inga förändringar i frontend-kod vid varje request (webbläsaren skickar automatiskt)
- ❌ Fungerar inte för native mobile-klienter utan extra hantering
- ❌ `sessionStorage.setItem("admin_email")` används för att avgöra om användaren är inloggad — detta är UI-state, inte säkerhetskritiskt (servern validerar alltid token)

---

### ADR-004: SkiaSharp + Magick.NET för bildbehandling

**Kontext:** Val av bildbehandlingsbibliotek.

**Beslut:** SkiaSharp för JPEG-resize och kodning; Magick.NET enbart för HEIC-konvertering.

**Motivering:** SkiaSharp är snabbt, cross-platform och har inget beroende på systembibliotek (använder bundlade natives). Magick.NET hanterar HEIC bättre än SkiaSharp eftersom HEIC-stöd i SkiaSharp är begränsat. Tvåbiblioteks-arkitekturen är mer komplex men ger bästa resultat för alla bildformat.

**Konsekvenser:**
- ✅ Stabil HEIC-hantering (vanligt från iPhone-bilder)
- ✅ Snabb resize med Mitchell-Netravali-filter
- ✅ Automatisk EXIF-orientering
- ❌ Två bibliotek med olika API:er ökar komplexitet
- ❌ Magick.NET är ett tungt beroende (~50 MB natives)

---

### ADR-005: Generisk IDatabase med dynamisk SQL

**Kontext:** Val av databasabstraktionsnivå.

**Beslut:** `MySqlDatabase` bygger SQL dynamiskt från tabellnamn (sträng) och property-reflection på DTO-objekt.

**Motivering:** Eliminerar repetitiv CRUD-kod per entitet. Med 5 tabeller och enkla operationer är värdet högt.

**Känd risk:** Tabellnamnet skickas som en okontrollerad sträng från tjänstlagret (`_db.ReadAsync<T>("projects")`). Om ett tabellnamn någonsin hämtas från en extern källa (t.ex. en HTTP-request) finns SQL injection-risk. I nuläget är alla tabellnamn hårdkodade i tjänsterna — risken är låg men måste bevakas vid framtida ändringar.

**Skydd:** Tabellnamnet backtick-quotas i SQL: `` SELECT * FROM `{table}` ``. MySQL-backtick-quoting förhindrar att tabellnamnet tolkas som SQL-nyckelord, men skyddar inte mot alla injektionsvektorer om ett tabellnamn innehåller backtick.

**Rekommendation:** Om codebasen växer, inför en whitelist av tillåtna tabellnamn i `MySqlDatabase`.

---

### ADR-006: Bildsökvägar som strängar i databasen

**Kontext:** Val av bildlagringsstrategi.

**Beslut:** Bilderna sparas som filer på disk; databasen lagrar relativa sökvägar som strängar. Extra bilder serialiseras som JSON-array i en TEXT/JSON-kolumn.

**Motivering:** Enkelt att implementera och förstå. Inga externa storage-tjänster (S3 etc.) behövs. Simply.com-hosting ger tillgång till filsystemet.

**Konsekvenser:**
- ✅ Inga externa beroenden
- ✅ Bilder serveras direkt av .NET med immutable cache-headers
- ❌ Bilder lever utanför databasens transaktionsgränser — en raderad databas-post lämnar föräldralösa filer
- ❌ JSON-kolumn för extra bilder kräver serialisering/deserialisering i tjänstlagret
- ❌ Skalning till CDN kräver migrationsarbete

---

### ADR-007: E-postmallar som C#-stränginterpolering

**Kontext:** Val av e-postmall-strategi.

**Beslut:** Alla e-postmallar är statiska C#-metoder med stränginterpolering i `EmailTemplate.cs`.

**Motivering:** Projektet har 6 e-postmallar med statiskt innehåll. Razor-templates eller externa template-motorer (Handlebars etc.) är överkurs och tillför onödig komplexitet.

**Konsekvenser:**
- ✅ Inga extra beroenden
- ✅ Enkelt att ändra malltext direkt i koden
- ❌ Ingen HTML-formatering (plaintext-mail)
- ❌ Mallarna kräver kompilering vid förändring

---

## 14. Säkerhetsöverväganden

### Autentisering
- BCrypt med standardkostnadsfaktor (12) för lösenordshashning
- JWT signeras med HMAC-SHA256
- Token i httpOnly cookie — ej tillgänglig för JavaScript
- Token-livstid: 24 h (konfigurerbar via `Jwt:ExpiryHours`)

### Indata-validering
- `[ApiController]` aktiverar automatisk ModelState-validering
- `[EmailAddress]` och `[Phone]`-attribut på `BookingRequest`
- Magic byte-validering på bilduppladdning

### Path traversal
- `ImageUploadHelper.ResolveSafePath` validerar alla filsökvägar mot uploads-roten
- Relativa sökvägar normaliseras med `Path.GetFullPath` innan jämförelse

### CORS
- Development: `localhost` (alla portar)
- Produktion: Explicit whitelist från `appsettings.json` (`AllowedOrigins`)

### Rate limiting
- Publika formulär: 5 req / 10 min (anti-spam)
- Admin-login: 10 req / 15 min (brute force-skydd)
- Svarar med strukturerad JSON och `Retry-After`-header

### Secrets
- Inga hemligheter i `appsettings.json` i VCS — `.gitignore` exkluderar `appsettings.*.json`
- Lokalt: .NET User Secrets
- Produktion: Miljövariabler eller produktions-`appsettings.json` utanför VCS

### Kända begränsningar
- Ingen CSRF-token (förlitar sig på `SameSite=Strict`)
- Ingen account lockout (rate limiting minskar risken)
- `uploads/`-mappen har ingen åtkomstkontroll — alla filer med känd sökväg är publikt åtkomliga
- E-post skickas via `System.Net.Mail` utan SPF/DKIM-verifiering (hanteras av Simply.com)

---

## 15. Konfiguration och hemligheter

Konfigurationsordning (senare override tidigare):

```
appsettings.json
→ appsettings.{Environment}.json   (exkluderas från VCS)
→ User Secrets                     (development only)
→ Miljövariabler
```

### Alla konfigurationsnycklar

```json
{
  "Jwt": {
    "Key":         "min 32 tecken lång hemlig nyckel",
    "Issuer":      "TerrysAllBygg",
    "Audience":    "TerrysAllByggUsers",
    "ExpiryHours": "24"
  },
  "Database": {
    "Host":     "mysql.simply.com",
    "Port":     3306,
    "Username": "db_user",
    "Password": "...",
    "Database": "terrysallbygg"
  },
  "Smtp": {
    "Host":    "websmtp.simply.com",
    "Port":    587,
    "UserName": "noreply@terrysallbygg.se",
    "Password": "...",
    "From":    "noreply@terrysallbygg.se",
    "AdminTo": "terrysallbygg@gmail.com"
  },
  "App": {
    "BaseUrl": "https://terrysallbygg.se"
  },
  "AllowedOrigins": [
    "https://terrysallbygg.se",
    "https://www.terrysallbygg.se"
  ]
}
```

---

*Terrys AllBygg Backend Documentation · .NET 8 · Dapper · MySQL*