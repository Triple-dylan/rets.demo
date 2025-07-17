from http.server import BaseHTTPRequestHandler
import json
import os
import openai
from typing import List, Dict, Any

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        try:
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            request_data = json.loads(post_data.decode('utf-8'))
            
            # Initialize OpenAI client
            client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
            
            # Extract messages from request
            messages = request_data.get('messages', [])
            
            # Add system message for RETS AI context
            system_message = {
                "role": "system",
                "content": "You are RETS AI, a specialized assistant for real estate professionals. You help with property analysis, market insights, and real estate transactions. Provide helpful, accurate information about real estate matters."
            }
            
            full_messages = [system_message] + messages
            
            # Call OpenAI API
            response = client.chat.completions.create(
                model="gpt-4",
                messages=full_messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            assistant_message = response.choices[0].message.content
            
            # Send response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
            self.send_header('Access-Control-Allow-Headers', 'Content-Type')
            self.end_headers()
            
            response_data = {
                "message": assistant_message,
                "role": "assistant"
            }
            
            self.wfile.write(json.dumps(response_data).encode('utf-8'))
            
        except Exception as e:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_GET(self):
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        response_data = {"message": "RETS AI Chat API is running"}
        self.wfile.write(json.dumps(response_data).encode('utf-8'))