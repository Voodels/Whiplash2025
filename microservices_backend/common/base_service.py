from flask import Flask, request, jsonify
from functools import wraps
import logging
import os
import time
from datetime import datetime
import json
from typing import Dict, Any, Callable, Optional

class BaseService:
    def __init__(self, service_name: str, default_port: int):
        """
        Initialize a base microservice with common functionality.
        
        Args:
            service_name: Name of the service for logging and identification
            default_port: Default port to run the service on
        """
        self.app = Flask(service_name)
        self.service_name = service_name
        self.default_port = default_port
        self.logger = self._setup_logging()
        self._register_health_check()
        
        # Enable CORS for all routes
        from flask_cors import CORS
        CORS(self.app, resources={r"/*": {"origins": "*"}})
    
    def _setup_logging(self) -> logging.Logger:
        """Configure logging for the service."""
        logger = logging.getLogger(self.service_name)
        logger.setLevel(logging.INFO)
        
        # Create logs directory if it doesn't exist
        os.makedirs('logs', exist_ok=True)
        
        # File handler for persistent logs
        file_handler = logging.FileHandler(f'logs/{self.service_name}.log')
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        
        # Console handler
        console_handler = logging.StreamHandler()
        console_handler.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        ))
        
        logger.addHandler(file_handler)
        logger.addHandler(console_handler)
        
        return logger
    
    def _register_health_check(self):
        """Register a health check endpoint."""
        @self.app.route('/health', methods=['GET'])
        def health_check():
            return jsonify({
                'status': 'healthy',
                'service': self.service_name,
                'timestamp': datetime.utcnow().isoformat()
            }), 200
    
    def validate_required_fields(self, data: Dict, required_fields: list) -> tuple[bool, Optional[str]]:
        """
        Validate that all required fields are present in the request data.
        
        Args:
            data: The request data to validate
            required_fields: List of required field names
            
        Returns:
            tuple: (is_valid, error_message)
        """
        missing = [field for field in required_fields if field not in data or data[field] is None]
        if missing:
            return False, f"Missing required fields: {', '.join(missing)}"
        return True, ""
    
    def error_response(self, message: str, status_code: int = 400, **kwargs) -> tuple[Dict, int]:
        """Create a standardized error response."""
        response = {
            'success': False,
            'error': message,
            'service': self.service_name,
            'timestamp': datetime.utcnow().isoformat(),
            **kwargs
        }
        self.logger.error(f"Error: {message}")
        return jsonify(response), status_code
    
    def success_response(self, data: Any = None, **kwargs) -> tuple[Dict, int]:
        """Create a standardized success response."""
        response = {
            'success': True,
            'data': data,
            'service': self.service_name,
            'timestamp': datetime.utcnow().isoformat(),
            **kwargs
        }
        return jsonify(response), 200
    
    def route(self, rule: str, methods=None, **options):
        """Decorator to register a route with request logging and error handling."""
        if methods is None:
            methods = ['GET']
            
        def decorator(f):
            @wraps(f)
            def wrapped(*args, **kwargs):
                request_id = request.headers.get('X-Request-ID', 'N/A')
                start_time = time.time()
                
                self.logger.info(f"[{request_id}] {request.method} {request.path} - Started")
                
                try:
                    # Log request details (excluding sensitive data)
                    log_data = {
                        'method': request.method,
                        'path': request.path,
                        'ip': request.remote_addr,
                        'params': dict(request.args),
                        'headers': {k: v for k, v in request.headers if k.lower() not in ['authorization', 'api-key']}
                    }
                    self.logger.debug(f"[{request_id}] Request details: {json.dumps(log_data, default=str)}")
                    
                    # Process the request
                    response = f(*args, **kwargs)
                    
                    # Calculate response time
                    response_time = time.time() - start_time
                    self.logger.info(f"[{request_id}] {request.method} {request.path} - Completed in {response_time:.3f}s")
                    
                    return response
                    
                except Exception as e:
                    self.logger.exception(f"[{request_id}] Error processing request: {str(e)}")
                    return self.error_response("An unexpected error occurred", 500, error=str(e))
            
            # Register the route with Flask
            self.app.add_url_rule(rule, f.__name__, wrapped, methods=methods, **options)
            return wrapped
            
        return decorator
    
    def run(self, host: str = '0.0.0.0', port: int = None, **kwargs):
        """Run the Flask application."""
        if port is None:
            port = self.default_port
            
        self.logger.info(f"Starting {self.service_name} service on {host}:{port}")
        self.app.run(host=host, port=port, **kwargs)
