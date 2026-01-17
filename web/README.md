# Name

## About

- Todo

## Outlook

- Text Catalog for better reusability of texts.
- Integrate Bonus-Upload-Tool
- Product Switch Matrix
- ...

## Environment Variables

```txt
AUTH_AZURE_AD_ID
AUTH_AZURE_AD_SECRET
AUTH_AZURE_AD_TENANT_ID

AUTH_SECRET
AUTH_URL

API_URL
API_KEY

UMBRACO_URL
UMBRACO_API_KEY

REDIS_CONNECTION_URL
REDIS_CONNECTION_PASSWORD
REDIS_CONNECTION_TLS
REDIS_CONNECTION_SECURE_PROTOCOL

APPLICATION_INSIGHTS_CONNECTION_STRING
APPLICATION_INSIGHTS_CLOUD_ROLE
```

## Development

### Tech Stack

- [`TypeScript`](https://www.typescriptlang.org/docs/)
- [`Next.js`](https://nextjs.org/docs)
- [`next-auth / auth.js`](https://authjs.dev)
- [`Zod`](https://zod.dev/?id=introduction)
- [`react-hook-form`](https://react-hook-form.com/get-started)
- [`TanStack Query`](https://tanstack.com/query/latest/docs/react/overview)
- [`Tailwind CSS`](https://tailwindcss.com/docs)
- [`flowbite-react`](https://flowbite-react.com/docs/getting-started/introduction/)

### Getting started

- Todo

### Contributing

1. Create feature branch from `develop`.
2. Commit your changes.
3. Push to the branch.
4. Create a Pull Request pointing to `develop`.
5. Have it reviewed.

### Creating a release

1. Create release branch from `develop` (e.g. `release/v1.0.0`).
2. Update version number in `package.json` and execute `npm install --package-lock-only`.
3. Push changes to the branch.
4. Create Pull Request pointing to `master`.
5. Have it reviewed.
6. Complete pull request. (using squash)
7. GIT Tag merge commit manually (e.g. `v1.0.0`).
8. Create pull request from `master` pointing to `develop`.
9. Complete pull request. (using squash)

### Creating a hotfix

1. Create hotfix branch from `master` (e.g. `hotfix/branch-name`).
2. Make your fix.
3. Update version number (e.g. `1.0.1`) in `package.json` and execute `npm install --package-lock-only`.
4. Push changes to the branch.
5. Create Pull Request pointing to `master`.
6. Have it reviewed.
7. Complete pull request. (using squash)
8. GIT Tag merge commit manually (e.g. `v1.0.1`).
9. Create pull request from `master` pointing to `develop`.
10. Complete pull request. (using squash)

### Deploy to QA

1. Remove the GIT tag `qa-deploy` from where it was set.
2. Set the GIT tag `qa-deploy` to any commit you like.
3. This commit will be deployed to QA.
