locals {
  deploy_service_account_id    = "github-deploy-frontend"
  runtime_service_account_id   = "alloydb-crud-frontend"
  deploy_service_account_email = "${local.deploy_service_account_id}@${var.project_id}.iam.gserviceaccount.com"
}

data "google_project" "current" {
  project_id = var.project_id
}

resource "google_project_service" "required" {
  for_each = toset([
    "artifactregistry.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "iam.googleapis.com",
    "iamcredentials.googleapis.com",
    "run.googleapis.com",
    "serviceusage.googleapis.com",
  ])

  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

resource "github_repository" "frontend" {
  count = var.create_github_repository ? 1 : 0

  name        = var.github_repository_name
  description = "React frontend for the AlloyDB CRUD API demo."
  visibility  = "private"

  has_issues      = true
  has_projects    = false
  has_wiki        = false
  auto_init       = false
  vulnerability_alerts = true
}

resource "google_artifact_registry_repository" "frontend" {
  project       = var.project_id
  location      = var.region
  repository_id = var.artifact_registry_repository
  format        = "DOCKER"
  description   = "Frontend container images"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "deploy" {
  project      = var.project_id
  account_id   = local.deploy_service_account_id
  display_name = "GitHub Actions frontend deploy service account"

  depends_on = [google_project_service.required]
}

resource "google_service_account" "runtime" {
  project      = var.project_id
  account_id   = local.runtime_service_account_id
  display_name = "Cloud Run frontend runtime service account"

  depends_on = [google_project_service.required]
}

resource "google_project_iam_member" "deploy_project_roles" {
  for_each = toset([
    "roles/artifactregistry.writer",
    "roles/run.admin",
  ])

  project = var.project_id
  role    = each.value
  member  = "serviceAccount:${google_service_account.deploy.email}"
}

resource "google_service_account_iam_member" "deploy_can_act_as_runtime" {
  service_account_id = google_service_account.runtime.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${google_service_account.deploy.email}"
}

resource "google_cloud_run_v2_service" "frontend" {
  project             = var.project_id
  location            = var.region
  name                = var.cloud_run_service
  deletion_protection = true
  ingress             = "INGRESS_TRAFFIC_ALL"

  template {
    service_account                  = google_service_account.runtime.email
    timeout                          = "60s"
    max_instance_request_concurrency = var.cloud_run_container_concurrency

    scaling {
      min_instance_count = var.cloud_run_min_instances
      max_instance_count = var.cloud_run_max_instances
    }

    containers {
      image = var.bootstrap_image

      ports {
        name           = "http1"
        container_port = 8080
      }

      resources {
        limits = {
          cpu    = var.cloud_run_cpu
          memory = var.cloud_run_memory
        }

        cpu_idle          = true
        startup_cpu_boost = true
      }
    }
  }

  lifecycle {
    ignore_changes = [
      client,
      client_version,
      template[0].containers[0].image,
      template[0].labels,
      template[0].revision,
      traffic,
    ]
  }

  depends_on = [google_project_service.required]
}

resource "google_cloud_run_v2_service_iam_member" "public_invoker" {
  project  = var.project_id
  location = google_cloud_run_v2_service.frontend.location
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_iam_workload_identity_pool_provider" "github" {
  project                            = var.project_id
  workload_identity_pool_id          = var.workload_identity_pool_id
  workload_identity_pool_provider_id = var.workload_identity_provider_id
  display_name                       = "GitHub Actions frontend provider"

  attribute_mapping = {
    "google.subject"             = "assertion.sub"
    "attribute.actor"            = "assertion.actor"
    "attribute.repository"       = "assertion.repository"
    "attribute.repository_owner" = "assertion.repository_owner"
  }

  attribute_condition = "attribute.repository=='${var.github_repository_full_name}'"

  oidc {
    issuer_uri = "https://token.actions.githubusercontent.com"
  }

  depends_on = [google_project_service.required]
}

resource "google_service_account_iam_member" "github_workload_identity" {
  service_account_id = google_service_account.deploy.name
  role               = "roles/iam.workloadIdentityUser"
  member             = "principalSet://iam.googleapis.com/projects/${data.google_project.current.number}/locations/global/workloadIdentityPools/${var.workload_identity_pool_id}/attribute.repository/${var.github_repository_full_name}"
}

resource "github_actions_variable" "production" {
  for_each = {
    GCP_PROJECT_ID                 = var.project_id
    GCP_REGION                     = var.region
    GCP_WORKLOAD_IDENTITY_PROVIDER = google_iam_workload_identity_pool_provider.github.name
    GCP_DEPLOY_SERVICE_ACCOUNT     = google_service_account.deploy.email
    ARTIFACT_REGISTRY_REPOSITORY   = google_artifact_registry_repository.frontend.repository_id
    FRONTEND_IMAGE_NAME            = var.cloud_run_image_name
    CLOUD_RUN_SERVICE              = google_cloud_run_v2_service.frontend.name
    CLOUD_RUN_SERVICE_ACCOUNT      = google_service_account.runtime.email
    VITE_API_BASE_URL              = var.api_base_url
  }

  repository    = var.github_repository_name
  variable_name = each.key
  value         = each.value

  depends_on = [github_repository.frontend]
}
