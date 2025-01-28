# GHDB: A Simple Data Management Tool Based on GitHub Issues

GHDB is a simple class for managing data using GitHub issues. It allows you to create, read, update, and delete posts easily.

## Installation

```bash
npm install @ga-ut/gh-db
```

```bash
yarn add @ga-ut/gh-db
```

```bash
pnpm add @ga-ut/gh-db
```

```bash
bun add @ga-ut/gh-db
```

## Usage

This section demonstrates how to store and manage blog post information using GHDB.

### Initialization

To use GHDB, you need a GitHub API token, repository owner, and repository name. If you only need to read data, you can set the `token` to `null`:

```typescript
import { GHDB } from "@ga-ut/gh-db";

const db = new GHDB({
  // Set to null for public read-only access
  token: "YOUR_GITHUB_TOKEN",
  owner: "YOUR_GITHUB_USERNAME",
  repo: "YOUR_REPOSITORY_NAME",
});
```

### Create a Post

To create a new blog post:

```typescript
const newPost = await db.create({
  subject: "Blog",
  data: {
    title: "Blog Post Title",
    content: "This is the content of the blog post.",
  },
});
```

### Read Posts

To read all blog posts:

```typescript
const posts = await db.readAll({ subject: "Blog" });
```

### Update a Post

To update an existing post:

```typescript
await db.update(id, {
  title: "Blog Post Title",
  content: "Updated content.",
});
```

### Delete a Post

To delete a post:

```typescript
await db.delete(id);
```

## License

This project is licensed under the MIT License.
