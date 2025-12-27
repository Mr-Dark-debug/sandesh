## 2024-05-24 - [N+1 Query in Folder List]
**Learning:** The frontend was fetching the folder list and then iterating through each folder to make a separate `getMail` API call just to count unread messages. This caused N+1 API requests (1 for folders + N for unread counts).
**Action:** Implemented a backend optimization in `FolderRepository` using a SQL `LEFT JOIN` and `GROUP BY` to calculate unread counts in a single query. The `unread_count` is now returned directly in the `getFolders` response, reducing the operation to a single API call.
