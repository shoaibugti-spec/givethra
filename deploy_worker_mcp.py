import json
import os
import base64

worker_path = "/home/ubuntu/givethra/src/frontend/worker.js"
with open(worker_path, "r", encoding="utf-8") as f:
    worker_code = f.read()

encoded_code = base64.b64encode(worker_code.encode("utf-8")).decode("utf-8")

js_code = (
    "async () => {\n"
    f"  const b64 = \"{encoded_code}\";\n"
    "  const binString = atob(b64);\n"
    "  const bytes = Uint8Array.from(binString, (m) => m.codePointAt(0));\n"
    "  const code = new TextDecoder().decode(bytes);\n"
    "  const metadata = {\n"
    '    main_module: "worker.js",\n'
    '    compatibility_date: "2024-11-01",\n'
    "    bindings: [\n"
    "      {\n"
    '        type: "d1",\n'
    '        name: "DB",\n'
    '        id: "5ad1094c-3288-4519-aeec-0446d82126f6"\n'
    "      },\n"
    "      {\n"
    '        type: "r2_bucket",\n'
    '        name: "UPLOADS",\n'
    '        bucket_name: "givethra-user-uploads"\n'
    "      }\n"
    "    ]\n"
    "  };\n"
    '  const b = "----Boundary" + Date.now();\n'
    "  const body = [\n"
    '    "--" + b,\n'
    '    \'Content-Disposition: form-data; name="metadata"\',\n'
    '    \'Content-Type: application/json\',\n'
    '    \'\',\n'
    '    JSON.stringify(metadata),\n'
    '    "--" + b,\n'
    '    \'Content-Disposition: form-data; name="worker.js"; filename="worker.js"\',\n'
    '    \'Content-Type: application/javascript+module\',\n'
    '    \'\',\n'
    '    code,\n'
    '    "--" + b + "--"\n'
    '  ].join("\\r\\n");\n'
    "  return cloudflare.request({\n"
    '    method: "PUT",\n'
    '    path: "/accounts/bf291a34326c6562f5f39f0762a7493b/workers/scripts/givethra",\n'
    '    body: body,\n'
    '    contentType: "multipart/form-data; boundary=" + b,\n'
    '    rawBody: true\n'
    "  });\n"
    "}"
)

input_payload = {
    "code": js_code
}

os.makedirs("/home/ubuntu/givethra-website/tmp", exist_ok=True)
input_file = "/home/ubuntu/givethra-website/tmp/deploy_input.json"
with open(input_file, "w", encoding="utf-8") as f:
    json.dump(input_payload, f)

print(f"Generated input payload at {input_file}")
