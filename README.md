# dora-server

nest.js API for serving data used to generate DORA metrics

## Deployment Frequency API

This API provides endpoints to retrieve deployment frequency metrics from GitHub and Azure DevOps. It is part of a larger initiative to track and measure DevOps performance metrics.

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
GET /deployment-frequency/github?owner=mckesson&repo=providerpay-web&env=prod
```

**Example Response:**

```
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
GET /deployment-frequency/azure?org=HealthMartAtlas&project=HealthMart%20Atlas&pipeline=PPReportsDB&env=prod
```

**Example Response:**

```
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

## Services

- **GitHubService:** Handles communication with the GitHub API to fetch deployment data.
- **AzureDevOpsService:** Manages interactions with Azure DevOps API to gather deployment metrics.
