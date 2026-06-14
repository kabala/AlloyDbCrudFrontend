output "artifact_registry_repository" {
  description = "Artifact Registry repository ID."
  value       = google_artifact_registry_repository.frontend.repository_id
}

output "cloud_run_service_url" {
  description = "Cloud Run frontend service URL. Add this exact origin to the backend CORS allowlist."
  value       = google_cloud_run_v2_service.frontend.uri
}

output "workload_identity_provider" {
  description = "Workload Identity Provider name used by GitHub Actions."
  value       = google_iam_workload_identity_pool_provider.github.name
}

output "deploy_service_account" {
  description = "GitHub Actions deploy service account email."
  value       = google_service_account.deploy.email
}

output "github_repository_full_name" {
  description = "Frontend GitHub repository full name."
  value       = var.github_repository_full_name
}
