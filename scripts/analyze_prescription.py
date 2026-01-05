import google.generativeai as genai
import PIL.Image
import json
import os
import sys

def analyze_prescription(api_key, image_path):
    """
    Analyzes a medical prescription image using Google Gemini API.
    """
    if not api_key:
        print(json.dumps({"error": "API Key is required."}))
        return

    if not os.path.exists(image_path):
        print(json.dumps({"error": f"Image file not found at {image_path}"}))
        return

    try:
        # Configure the API key
        genai.configure(api_key=api_key)
        
        # Load the image
        img = PIL.Image.open(image_path)

        prompt = """
        You are an expert pharmacist and medical data extractor. 
        Analyze the provided medical prescription image. 
        Extract the following details for each medicine found:
        1. Medicine Name
        2. Uses/Purpose (if not explicitly stated, infer the common medical purpose in 50 words so a common man can understand)
        3. Intake Dosages (e.g., 500mg, 1 tablet)
        4. Time Schedule (e.g., Morning-Night, twice a day, after food)
        5. Days (duration of the course)

        Output the result STRICTLY as a JSON list of objects. Do not include markdown naming like ```json ... ```. 
        Each object should have keys: "medicine_name", "purpose", "dosage", "time_schedule", "duration_days".
        If a field is not readable or missing, use null.
        """

        # Create the model
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        # Generate content with retry logic for 429 errors
        import time
        max_retries = 2
        response = None
        
        for attempt in range(max_retries):
            try:
                response = model.generate_content([prompt, img])
                break  # Success!
            except Exception as e:
                error_str = str(e)
                
                # Check if it's a rate limit error
                if "429" in error_str or "RESOURCE_EXHAUSTED" in error_str:
                    if attempt < max_retries - 1:
                        wait_time = 5  # Wait 5 seconds between retries
                        time.sleep(wait_time)
                    else:
                        # Final attempt failed, return user-friendly error
                        print(json.dumps({
                            "error": "API rate limit exceeded. Please wait a moment and try again.",
                            "error_type": "rate_limit",
                            "suggestion": "The Google Gemini API has temporary usage limits. Please try again in 30-60 seconds."
                        }))
                        return
                else:
                    # Other error, re-raise
                    raise e
        
        if response is None:
            print(json.dumps({"error": "Failed to get response from API after retries"}))
            return
        
        # Clean up response text in case it contains markdown formatting
        text_response = response.text.strip()
        if text_response.startswith("```json"):
            text_response = text_response[7:]
        if text_response.endswith("```"):
            text_response = text_response[:-3]
        
        text_response = text_response.strip()
        
        try:
            data = json.loads(text_response)
            # Output clean JSON to stdout for Node.js to capture
            print(json.dumps(data))
            
        except json.JSONDecodeError:
            print(json.dumps({"error": "Could not parse JSON from response", "raw_response": response.text}))

    except Exception as e:
        print(json.dumps({"error": str(e)}))

if __name__ == "__main__":
    # Check if image path is provided as command line argument (from Node.js)
    if len(sys.argv) > 1:
        # CLI Mode
        api_key_env = 'your_actual_key_here'
        image_path_arg = sys.argv[1]
        analyze_prescription(api_key_env, image_path_arg)
    else:
        print(json.dumps({"error": "No image path provided"}))
        sys.exit(1)
