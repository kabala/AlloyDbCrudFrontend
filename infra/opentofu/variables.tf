variable "project_id" {
  description = "Google Cloud project ID."
  type        = string
  default     = "personal-434212"
}

variable "region" {
  description = "Google Cloud region for Cloud Run and Artifact Registry."
  type        = string
  default     = "us-east1"
}

variable "github_owner" {
  description = "GitHub repository owner."
  type        = string
  default     = "kabala"
}

variable "github_repository_name" {
  description = "GitHub repository name, without owner."
  type        = string
  default     = "AlloyDbCrudFrontend"
}

variable "github_repository_full_name" {
  description = "GitHub repository in owner/name form for Workload Identity Federation conditions."
  type        = string
  default     = "kabala/AlloyDbCrudFrontend"
}

variable "create_github_repository" {
  description = "Create the private GitHub repository if it does not already exist."
  type        = bool
  default     = false
}

variable "api_base_url" {
  description = "Backend API base URL used by the Vite build."
  type        = string
  default     = "https://alloydb-crud-api-dmkxnmuy3q-ue.a.run.app"
}

variable "artifact_registry_repository" {
  description = "Artifact Registry Docker repository name for frontend images."
  type        = string
  default     = "frontend-containers"
}

variable "cloud_run_service" {
  description = "Cloud Run service name for the frontend."
  type        = string
  default     = "alloydb-crud-frontend"
}

variable "cloud_run_image_name" {
  description = "Artifact Registry image name for the frontend container."
  type        = string
  default     = "alloydb-crud-frontend"
}

variable "bootstrap_image" {
  description = "Initial image used when OpenTofu creates Cloud Run. GitHub Actions replaces it with the app image."
  type        = string
  default     = "us-docker.pkg.dev/cloudrun/container/hello"
}

variable "cloud_run_cpu" {
  description = "CPU limit for the frontend Cloud Run container."
  type        = string
  default     = "1000m"
}

variable "cloud_run_memory" {
  description = "Memory limit for the frontend Cloud Run container."
  type        = string
  default     = "256Mi"
}

variable "cloud_run_min_instances" {
  description = "Minimum frontend Cloud Run instances."
  type        = number
  default     = 0
}

variable "cloud_run_max_instances" {
  description = "Maximum frontend Cloud Run instances."
  type        = number
  default     = 10
}

variable "cloud_run_container_concurrency" {
  description = "Maximum concurrent requests per frontend Cloud Run instance."
  type        = number
  default     = 80
}

variable "workload_identity_pool_id" {
  description = "Existing Workload Identity Pool ID. The backend OpenTofu stack creates github by default."
  type        = string
  default     = "github"
}

variable "workload_identity_provider_id" {
  description = "Workload Identity Provider ID for this frontend repository."
  type        = string
  default     = "github-frontend-provider"
}
