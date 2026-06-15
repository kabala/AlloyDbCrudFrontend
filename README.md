# AlloyDB CRUD Frontend

React + Vite frontend for the deployed AlloyDB CRUD API.

## Local Development

```powershell
npm install
npm run dev
```

The app reads the backend URL from `VITE_API_BASE_URL`. If it is not set, it uses:

```text
https://alloydb-crud-api-dmkxnmuy3q-ue.a.run.app
```

To override it locally:

```powershell
$env:VITE_API_BASE_URL="http://localhost:8080"
npm run dev
```

## Deploy

Infrastructure lives in `infra/opentofu` and creates the Cloud Run frontend service, Artifact Registry repository, deploy service account, Workload Identity provider, and GitHub Actions variables.

```powershell
cd infra/opentofu
Copy-Item terraform.tfvars.example terraform.tfvars
tofu init
tofu plan
tofu apply
```

Then push the repo to GitHub and run the `Deploy Production` workflow.

After the frontend URL exists, add that exact origin to the backend repo's `cors_allowed_origins` and apply the backend OpenTofu stack.

## Shared Config Sync

The backend owns the API URL and CORS allowlist. The frontend owns its Cloud Run origin. To sync those values locally:

```powershell
.\scripts\sync-shared-config.ps1 -BackendRepoPath ..\DEMO
```

This writes ignored local files:

- `infra/opentofu/api.auto.tfvars`
- `.env.local`
- `..\DEMO\infra\opentofu\frontend.auto.tfvars`

After frontend infrastructure exists, run it again with `-PlanBackend` or `-ApplyBackend` to apply backend CORS from the synced value.

## API Contract

The UI calls:

- `GET /api/items`
- `POST /api/items`
- `PUT /api/items/{id}`
- `DELETE /api/items/{id}`

Item shape:

```ts
type Item = {
  id: number;
  name: string;
  description: string | null;
  createdAt: string;
};
```
