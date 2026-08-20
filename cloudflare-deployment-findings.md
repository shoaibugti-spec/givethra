# Cloudflare Deployment Findings

Source: Cloudflare OpenAPI spec queried through the configured Cloudflare integration on 2026-08-18.

The relevant endpoints are:

| Endpoint | Method | Purpose |
|---|---|---|
| `/accounts/{account_id}/workers/scripts/{script_name}/assets-upload-session` | POST | Creates an asset upload session from a manifest map of asset paths to `{hash, size}`. Returns upload buckets and a JWT. |
| `/accounts/{account_id}/workers/assets/upload?base64=true` | POST | Uploads asset content as multipart form fields containing base64-encoded file contents. |
| `/accounts/{account_id}/workers/scripts/{script_name}/content` | PUT | Uploads Worker script content as multipart form data. Metadata identifies `body_part` or `main_module`; this endpoint alone does not attach the static asset manifest. |
| `/accounts/{account_id}/workers/scripts/{script_name}/deployments` | GET/POST | Lists or creates Worker deployments. |
| `/accounts/{account_id}/workers/scripts/{script_name}/versions` | GET/POST | Lists or creates Worker versions. |
| `/accounts/{account_id}/workers/scripts/{script_name}` | GET/PUT/DELETE | Gets, uploads, or deletes the Worker script. |

The current live observation remains `https://givethra.org` -> HTTP 404 with `content-type: text/plain`, confirming the frontend is not being served. The next deployment must attach the uploaded asset manifest to the Worker version; a raw script upload is insufficient.

Relevant Cloudflare documentation referenced by the API description: https://developers.cloudflare.com/workers/static-assets/direct-upload/

The focused versions endpoint confirms `GET /accounts/{account_id}/workers/scripts/{script_name}/versions` supports `deployable=true`, pagination, and returns the newest Worker versions first. The upload flow should therefore be: upload/complete assets, create a deployable Worker version that references the asset completion JWT, then create a 100% deployment pointing at that version.
