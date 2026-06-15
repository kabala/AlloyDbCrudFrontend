# AlloyDB CRUD Frontend

React + Vite frontend for the deployed AlloyDB CRUD API.

## Deployed URLs

- Frontend: `https://alloydb-crud-frontend-dmkxnmuy3q-ue.a.run.app`
- API: `https://alloydb-crud-api-dmkxnmuy3q-ue.a.run.app`

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

## Shared Config

The deployed frontend URL is stable because Cloud Run keeps the service URL for `alloydb-crud-frontend` in project `personal-434212` and region `us-east1`.

The backend repo stores that URL directly in its OpenTofu defaults as the CORS allowlist:

```hcl
cloud_run_allow_unauthenticated = true
cors_allowed_origins = [
  "https://alloydb-crud-frontend-dmkxnmuy3q-ue.a.run.app",
]
```

The frontend stores the API URL as the Vite build variable `VITE_API_BASE_URL`, populated by frontend OpenTofu into GitHub Actions variables.

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
