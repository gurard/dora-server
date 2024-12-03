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

## Services

- **GitHubService:** Handles communication with the GitHub API to fetch deployment data.
- **AzureDevOpsService:** Manages interactions with Azure DevOps API to gather deployment metrics.
- **DynatraceService:** Responsible for interacting with Dynatrace API to retrieve closed problems data for MTTR calculations.
