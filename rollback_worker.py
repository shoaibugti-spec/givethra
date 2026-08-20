import json
import os

# Script to rollback or redeploy the known-good version with assets binding
js_code = """async () => {
  return cloudflare.request({
    method: "POST",
    path: "/accounts/bf291a34326c6562f5f39f0762a7493b/workers/scripts/givethra/deployments",
    body: {
      "versions": [
        {
          "version_id": "c2c00aba-4646-4ff7-9a49-557864ad9de8",
          "percentage": 100
        }
      ],
      "annotations": {
        "workers/message": "Rollback to stable version with assets binding"
      }
    }
  });
}"""

input_payload = {
    "code": js_code
}

os.makedirs("/home/ubuntu/givethra-website/tmp", exist_ok=True)
input_file = "/home/ubuntu/givethra-website/tmp/rollback_input.json"
with open(input_file, "w", encoding="utf-8") as f:
    json.dump(input_payload, f)

print(f"Generated rollback payload at {input_file}")
