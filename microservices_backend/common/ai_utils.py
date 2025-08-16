import requests
import os
from tenacity import retry, stop_after_attempt, wait_exponential

# Provider-specific API endpoints
PROVIDER_ENDPOINTS = {
    'gemini': {
        'url_template': 'https://generativelanguage.googleapis.com/v1beta/models/{}:generateContent',
        'headers': {'Content-Type': 'application/json'},
        'params_key': 'key',
        'request_format': lambda prompt, model: {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        },
        'extract_response': lambda response: response.json()['candidates'][0]['content']['parts'][0]['text']
    },
    'openai': {
        'url_template': 'https://api.openai.com/v1/chat/completions',
        'headers': {'Content-Type': 'application/json', 'Authorization': 'Bearer {}'},
        'request_format': lambda prompt, model: {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "response_format": {"type": "json_object"}
        },
        'extract_response': lambda response: response.json()['choices'][0]['message']['content']
    },
    # Add more providers as needed
}

# Retry logic with exponential backoff
@retry(stop=stop_after_attempt(3), wait=wait_exponential(multiplier=1, min=4, max=10))
def call_ai(prompt, model="gpt-4", provider="openai", api_key=None, **kwargs):
    """
    Calls the specified AI provider's API to generate content based on the provided prompt.

    Args:
        prompt (str): The input prompt for the AI.
        model (str): The model to use (default: "gpt-4").
        provider (str): The AI provider to use (default: "openai").
        api_key (str, optional): The API key to use. If not provided, falls back to environment variable.
        **kwargs: Additional provider-specific parameters.

    Returns:
        str: The generated content from the AI API.

    Raises:
        ValueError: If the provider is not supported or API key is missing.
        Exception: If the API call fails or returns an error.
    """
    provider = provider.lower()
    if provider not in PROVIDER_ENDPOINTS:
        raise ValueError(f"Unsupported AI provider: {provider}")
    
    # Get provider configuration
    config = PROVIDER_ENDPOINTS[provider]
    
    # Get API key from kwargs or environment variable
    api_key = api_key or os.getenv(f'{provider.upper()}_API_KEY')
    if not api_key:
        raise ValueError(f"No API key provided for {provider} and {provider.upper()}_API_KEY environment variable is not set")
    
    # Prepare request
    url = config['url_template'].format(model) if '{}' in config['url_template'] else config['url_template']
    headers = {k: v.format(api_key) if isinstance(v, str) and '{}' in v else v 
              for k, v in config.get('headers', {}).items()}
    
    # Format request payload
    payload = config['request_format'](prompt, model, **kwargs)
    
    # Add API key to params if needed (e.g., for Gemini)
    params = {config['params_key']: api_key} if 'params_key' in config else {}
    
    # Make the API request
    try:
        response = requests.post(
            url,
            headers=headers,
            json=payload,
            params=params,
            timeout=60
        )
        response.raise_for_status()
        return config['extract_response'](response)
    except requests.exceptions.RequestException as e:
        error_msg = f"Error calling {provider} API: {str(e)}"
        if hasattr(e, 'response') and e.response is not None:
            error_msg += f"\nResponse: {e.response.text}"
        raise Exception(error_msg) from e

# Backward compatibility
def call_gemini(prompt, model="gemini-1.5-pro-latest", api_key=None):
    """Legacy function for backward compatibility"""
    return call_ai(prompt, model=model, provider='gemini', api_key=api_key)

# Example usage
if __name__ == "__main__":
    # Test with OpenAI
    try:
        result = call_ai(
            "Respond with a JSON object containing a greeting message",
            model="gpt-4",
            provider="openai",
            api_key=os.getenv('OPENAI_API_KEY')
        )
        print("OpenAI Response:", result)
    except Exception as e:
        print(f"OpenAI Error: {str(e)}")
    
    # Test with Gemini
    try:
        result = call_ai(
            "Respond with a JSON object containing a greeting message",
            model="gemini-1.5-pro-latest",
            provider="gemini",
            api_key=os.getenv('GEMINI_API_KEY')
        )
        print("Gemini Response:", result)
    except Exception as e:
        print(f"Gemini Error: {str(e)}")
