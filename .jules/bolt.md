## 2024-05-23 - [Shared State for Folders]
**Learning:** `FolderView` was fetching the full folder list again just to determine the current folder's name, even though `Layout` had already fetched it.
**Action:** Lifted folder state to `Layout` and passed it via `Outlet` context. Child components now consume `folders` from context, saving 1 API call per navigation.
