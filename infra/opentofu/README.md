# Frontend OpenTofu Infrastructure

This stack deploys the React SPA to Cloud Run as a public container service.

## What It Creates

- Required Google APIs.
- Optional private GitHub repository creation when `create_github_repository = true`.
- Artifact Registry Docker repository for frontend images.
- Cloud Run frontend service.
- Runtime and GitHub deploy service accounts.
- Workload Identity Federation provider for this frontend repo, using the existing `github` pool created by the backend stack.
- GitHub Actions repository variables consumed by `.github/workflows/deploy-prod.yml`.

## Usage

```powershell
cd infra/opentofu
Copy-Item terraform.tfvars.example terraform.tfvars
tofu init
tofu plan
tofu apply
```

This workspace already has a private GitHub remote at `kabala/AlloyDbCrudFrontend`, so the example uses `create_github_repository = false`.

After `tofu apply`, run the `Deploy Production` workflow.

The output `cloud_run_service_url` must be added to the backend API CORS allowlist:

```hcl
cloud_run_allow_unauthenticated = true
cors_allowed_origins = [
  "https://your-frontend-url.run.app"
]
```

Then apply the backend OpenTofu stack again.

## Notes

The first Cloud Run revision uses Google's hello image. The deploy workflow replaces it with the built React/Nginx image and passes `VITE_API_BASE_URL` at build time.
