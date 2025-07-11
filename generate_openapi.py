import os
import json
import re

API_DIR = 'src/app/api'
OUTPUT_FILE = 'public/openapi.json'

openapi_template = {
    "openapi": "3.0.0",
    "info": {
        "title": "Açaí do Vale API",
        "version": "1.0.0"
    },
    "paths": {}
}

def route_to_path(route_path):
    parts = route_path.split(os.sep)
    if 'api' in parts:
        idx = parts.index('api')
        clean_path = '/' + '/'.join(parts[idx+1:])
        clean_path = clean_path.replace('/route.ts', '').replace('/route.js', '').replace('/route.py', '')
        clean_path = re.sub(r'\[([^\]]+)\]', r'{\1}', clean_path)  # [id] → {id}
        return clean_path
    return None

def extract_methods_and_sql(content):
    methods = []
    sql = None

    # Detect HTTP methods
    if re.search(r'\b(GET|get)\b', content):
        methods.append('get')
    if re.search(r'\b(POST|post)\b', content):
        methods.append('post')
    if re.search(r'\b(PUT|put)\b', content):
        methods.append('put')
    if re.search(r'\b(DELETE|delete)\b', content):
        methods.append('delete')

    # Detect SQL query
    match = re.search(r'["\'](SELECT|INSERT|UPDATE|DELETE)[^"\']+["\']', content, re.IGNORECASE)
    if match:
        sql = match.group(0)

    return methods, sql

def scan_routes(api_dir):
    for root, _, files in os.walk(api_dir):
        for file in files:
            if file.startswith('route.') and file.endswith(('.ts', '.js', '.py')):
                full_path = os.path.join(root, file)
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                api_path = route_to_path(full_path)
                if not api_path:
                    continue

                methods, sql = extract_methods_and_sql(content)
                if not methods:
                    methods = ['get']  # fallback

                path_obj = {}

                for method in methods:
                    method_obj = {
                        "summary": f"{method.upper()} {api_path}",
                        "responses": {
                            "200": {
                                "description": "Sucesso"
                            }
                        }
                    }

                    if method in ['post', 'put']:
                        method_obj["requestBody"] = {
                            "required": True,
                            "content": {
                                "application/json": {
                                    "schema": {
                                        "type": "object",
                                        "example": {
                                            "exemploCampo": "valor"
                                        }
                                    }
                                }
                            }
                        }

                    if "{" in api_path:
                        param_name = re.search(r'{(.*?)}', api_path).group(1)
                        method_obj["parameters"] = [{
                            "name": param_name,
                            "in": "path",
                            "required": True,
                            "schema": {
                                "type": "string"
                            }
                        }]

                    if sql:
                        method_obj["description"] = f"Executa: `{sql}`"

                    path_obj[method] = method_obj

                openapi_template["paths"][api_path] = path_obj

def main():
    os.makedirs(os.path.dirname(OUTPUT_FILE), exist_ok=True)
    scan_routes(API_DIR)

    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(openapi_template, f, indent=2, ensure_ascii=False)

    print(f"✅ Arquivo OpenAPI gerado em: {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
