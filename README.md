# dora-server

nest.js API for serving data used to generate DORA metrics

## Endpoints

### 1. Get GitHub Deployments

**Endpoint:** `GET /deployment-frequency/github`

**Description:** Retrieves deployment information from a specified GitHub repository for a given environment.

**Query Parameters:**

- `owner` (string): The GitHub owner or organization name.
- `repo` (string): The repository name.
- `env` (string): The deployment environment name.

**Example Request:**

```http
GET /deployment-frequency/github?owner=TestOwner&repo=TestRepo&env=prod
```

**Example Response:**

```json
[
  {
    "deploymentDate": "2024-11-12T21:27:40.137Z"
  },
  {
    "deploymentDate": "2024-10-19T04:26:30.187Z"
  },
  {
    "deploymentDate": "2024-10-10T07:28:49.607Z"
  }
]
```

### 2. Get Azure DevOps Deployments

**Endpoint:** `GET /deployment-frequency/azure`

**Description:** Fetches deployment data from Azure DevOps for a specified organization, project, pipeline, and environment.

**Query Parameters:**

- `org` (string): The Azure DevOps organization name.
- `project` (string): The project name within the organization.
- `pipeline` (string): The pipeline name associated with the deployments.
- `env` (string): The target environment for the deployments.

**Example Request:**

```http
GET /deployment-frequency/azure?org=TestOrg&project=TestProject&pipeline=TestPipeline&env=prod
```

**Example Response:**

```json
[
  {
    "deploymentDate": "2024-11-12T21:27:40.137Z"
  },
  {
    "deploymentDate": "2024-10-19T04:26:30.187Z"
  },
  {
    "deploymentDate": "2024-10-10T07:28:49.607Z"
  }
]
```

### 3. Calculate MTTR (Mean Time to Recovery) Using Dynatrace Problems

**Endpoint:** `GET /mttr/dynatrace`

**Description:** Calculates the Mean Time to Recovery (MTTR) for closed problems within a specified management zone over the last 10 weeks using data from Dynatrace.

**Query Parameters:**

- `managementZone` (string): The management zone identifier for which MTTR is to be calculated.

**Example Request:**

```http
GET /mttr/dynatrace?managementZone=test-mz
```

**Example Response:**

```json
[
  {
    "week": "11/01",
    "mttr": 120
  },
  {
    "week": "10/25",
    "mttr": 90
  },
  {
    "week": "10/18",
    "mttr": 75
  }
]
```

### 4. Get Kubernetes Service Blue-Green Status

**Endpoint:** `GET /kubernetes/blue-green`

**Description:** Retrieves the blue-green deployment status of a specified Kubernetes service.

**Query Parameters:**

- `namespace` (string): The Kubernetes namespace.
- `service` (string): The Kubernetes service name.
- `blueLabel` (string): The label indicating the blue deployment.
- `greenLabel` (string): The label indicating the green deployment.

**Example Request:**

```http
GET /kubernetes/blue-green?namespace=default&service=my-service&blueLabel=blue&greenLabel=green
```

**Example Response:**

```json
{
  "service": "my-service",
  "blue": true,
  "green": false
}
```

### 5. Get Kubernetes Deployment Info

**Endpoint:** `GET /kubernetes/deployment-info`

**Description:** Retrieves information about a specified Kubernetes deployment, including image tag and related pods.

**Query Parameters:**

- `namespace` (string): The Kubernetes namespace.
- `deployment` (string): The Kubernetes deployment name.

**Example Request:**

```http
GET /kubernetes/deployment-info?namespace=default&deployment=my-deployment
```

**Example Response:**

```json
{
  "imageTag": "v1.0.0",
  "pods": [
    {
      "name": "my-deployment-abc123",
      "status": "Running",
      "age": "2d"
    },
    {
      "name": "my-deployment-def456",
      "status": "Running",
      "age": "2d"
    }
  ]
}
```

## Environment Variables

The application uses the following environment variables:

- `DORA_GITHUB_TOKEN`: The GitHub API token used for authentication.
- `DORA_AZURE_TOKEN`: The Azure DevOps API token used for authentication.
- `DORA_DYNATRACE_URL`: The base URL for the Dynatrace API.
- `DORA_DYNATRACE_TOKEN`: The Dynatrace API token used for authentication.
- `DORA_K8S_URL`: The base URL for the Kubernetes API.
- `DORA_K8S_TOKEN`: The Kubernetes API token used for authentication.

## Services

- **GitHubService:** Handles communication with the GitHub API to fetch deployment data.
- **AzureDevOpsService:** Manages interactions with Azure DevOps API to gather deployment metrics.
- **DynatraceService:** Responsible for interacting with Dynatrace API to retrieve closed problems data for MTTR calculations.
- **KubernetesService:** Responsible for interacting with Kubernetes API to fetch service, deployment, and pod info.
