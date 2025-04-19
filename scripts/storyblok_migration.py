#!/usr/bin/env python3
"""
Storyblok to Directus Migration Script (API Version)

This script fetches data from Storyblok API and imports it into Directus
using the Directus API. It handles two collections:
- Artworks (paintings)
- Photoshoots (sesje)

It uploads images directly via the API to ensure correct storage adapter usage.
"""

import requests
import os
import uuid
import json
import io
from datetime import datetime
from urllib.parse import urlparse
import time
from PIL import Image  # Need to install pillow: pip install pillow

# --- Configuration --- #
STORYBLOK_TOKEN = "KxvPHENMsmwwwKgGllYrDgtt"
DIRECTUS_URL = "https://cms.fram.dev"  # Your Directus instance URL
DIRECTUS_TOKEN = "qoSqIjkeA5FzeRh2PxhlsJVgvApFio-j" # Needs permissions for files, kepka_artworks, kepka_shoots
MAX_RETRIES = 3  # Number of retries for failed uploads
DELAY_BETWEEN_RETRIES = 2  # Delay in seconds between retries
MAX_IMAGE_SIZE = (1200, 1200)  # Reduced max width and height for images
MAX_FILE_SIZE = 4 * 1024 * 1024  # 4MB max file size
PROCESS_ARTWORKS = False  # Set to False to skip artwork processing for this run
MAX_IMAGES_PER_PHOTOSHOOT = 5  # Limit number of images to process per photoshoot
UPDATE_EXISTING = True  # Set to True to update existing items instead of creating new ones
# ------------------- #

# Storyblok API URLs
ARTWORK_URL = f"https://api.storyblok.com/v2/cdn/stories/?starts_with=paintings/&version=published&token={STORYBLOK_TOKEN}"
PHOTOSHOOT_URL = f"https://api.storyblok.com/v2/cdn/stories/?starts_with=sesje/&version=published&token={STORYBLOK_TOKEN}&cv=1743293497"

# --- Helper Functions --- #

def get_directus_headers(json_content=True):
    """Returns headers for Directus API requests."""
    headers = {
        "Authorization": f"Bearer {DIRECTUS_TOKEN}"
    }
    if json_content:
        headers["Content-Type"] = "application/json"
    return headers

def fetch_storyblok_data(url):
    """Fetch data from Storyblok API"""
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching Storyblok data from {url}: {e}")
        return None

def resize_image(image_content, max_size=MAX_IMAGE_SIZE):
    """Resize image if it's too large"""
    try:
        img = Image.open(io.BytesIO(image_content))
        width, height = img.size
        
        # Only resize if the image is larger than max_size
        if width > max_size[0] or height > max_size[1]:
            # Calculate new dimensions while maintaining aspect ratio
            if width > height:
                new_width = max_size[0]
                new_height = int(height * (max_size[0] / width))
            else:
                new_height = max_size[1]
                new_width = int(width * (max_size[1] / height))
            
            print(f"Resizing image from {width}x{height} to {new_width}x{new_height}")
            img = img.resize((new_width, new_height), Image.LANCZOS)
        
        # Save to BytesIO buffer
        buffer = io.BytesIO()
        format = img.format if img.format else 'JPEG'
        img.save(buffer, format=format, quality=80)  # Reduced quality
        buffer.seek(0)
        return buffer.getvalue()
    except Exception as e:
        print(f"Error resizing image: {e}")
        return image_content  # Return original if resize fails

def upload_directus_file(image_url, retry_count=0):
    """Downloads an image and uploads it to Directus via API with retry logic."""
    if not image_url:
        return None
    
    try:
        # Download the image
        print(f"Downloading image: {image_url}")
        img_response = requests.get(image_url, stream=True)
        img_response.raise_for_status()
        
        # Extract filename
        parsed_url = urlparse(image_url)
        filename = os.path.basename(parsed_url.path)
        
        # Check file size and resize if needed
        content = img_response.content
        if len(content) > MAX_FILE_SIZE:
            print(f"Image too large ({len(content) / 1024 / 1024:.2f}MB), resizing...")
            content = resize_image(content)
            
        # Prepare for upload - Use headers WITHOUT Content-Type for multipart uploads
        files = {'file': (filename, content, img_response.headers.get('Content-Type', 'application/octet-stream'))}
        upload_url = f"{DIRECTUS_URL}/files"
        
        print(f"Uploading {filename} to Directus...")
        # Important: Do NOT include Content-Type in headers for multipart file uploads
        api_response = requests.post(upload_url, headers=get_directus_headers(json_content=False), files=files)
        
        if api_response.status_code == 200:
            file_data = api_response.json().get("data", {})
            file_id = file_data.get("id")
            print(f"Successfully uploaded {filename}, File ID: {file_id}")
            return file_id
        else:
            print(f"Error uploading file {filename}: {api_response.status_code} - {api_response.text}")
            # Retry logic
            if retry_count < MAX_RETRIES:
                print(f"Retrying upload ({retry_count + 1}/{MAX_RETRIES})...")
                time.sleep(DELAY_BETWEEN_RETRIES)
                return upload_directus_file(image_url, retry_count + 1)
            return None
            
    except requests.exceptions.RequestException as e:
        print(f"Error processing image {image_url}: {e}")
        # Retry logic for network errors
        if retry_count < MAX_RETRIES:
            print(f"Retrying after error ({retry_count + 1}/{MAX_RETRIES})...")
            time.sleep(DELAY_BETWEEN_RETRIES)
            return upload_directus_file(image_url, retry_count + 1)
        return None
    except Exception as e:
        print(f"An unexpected error occurred with image {image_url}: {e}")
        return None

def find_photoshoot_by_slug(slug):
    """Find a photoshoot by its slug."""
    try:
        url = f"{DIRECTUS_URL}/items/kepka_shoots?filter[slug][_eq]={slug}"
        response = requests.get(url, headers=get_directus_headers())
        
        if response.status_code == 200:
            data = response.json().get("data", [])
            if data and len(data) > 0:
                return data[0]  # Return the first match
        return None
    except Exception as e:
        print(f"Error looking up photoshoot with slug '{slug}': {e}")
        return None

def create_directus_item(collection, data):
    """Creates an item in a Directus collection via API."""
    url = f"{DIRECTUS_URL}/items/{collection}"
    try:
        response = requests.post(url, headers=get_directus_headers(), json=data)
        if response.status_code == 200:
            item_data = response.json().get("data", {})
            print(f"Successfully created item in '{collection}': ID {item_data.get('id')}")
            return item_data
        else:
            print(f"Error creating item in '{collection}': {response.status_code} - {response.text}")
            print(f"Payload: {json.dumps(data)}") # Log payload for debugging
            return None
    except requests.exceptions.RequestException as e:
        print(f"Error connecting to Directus API at {url}: {e}")
        return None
    except Exception as e:
        print(f"An unexpected error occurred creating item in {collection}: {e}")
        return None

def update_directus_item(collection, item_id, data):
    """Updates an existing item in a Directus collection."""
    url = f"{DIRECTUS_URL}/items/{collection}/{item_id}"
    try:
        response = requests.patch(url, headers=get_directus_headers(), json=data)
        if response.status_code == 200:
            item_data = response.json().get("data", {})
            print(f"Successfully updated item in '{collection}': ID {item_id}")
            return item_data
        else:
            print(f"Error updating item in '{collection}': {response.status_code} - {response.text}")
            print(f"Payload: {json.dumps(data)}") # Log payload for debugging
            return None
    except Exception as e:
        print(f"Error updating item in '{collection}': {e}")
        return None

def link_photoshoot_images(photoshoot_id, file_ids):
    """Creates junction entries for photoshoot images in kepka_shoots_files collection."""
    if not file_ids:
        return True
    
    # First clear any existing image links for this photoshoot
    try:
        clear_url = f"{DIRECTUS_URL}/items/kepka_shoots_files?filter[kepka_shoots_id][_eq]={photoshoot_id}"
        existing_response = requests.get(clear_url, headers=get_directus_headers())
        
        if existing_response.status_code == 200:
            existing_links = existing_response.json().get("data", [])
            for link in existing_links:
                delete_url = f"{DIRECTUS_URL}/items/kepka_shoots_files/{link['id']}"
                delete_response = requests.delete(delete_url, headers=get_directus_headers())
                if delete_response.status_code == 204:
                    print(f"Deleted existing image link {link['id']} for photoshoot {photoshoot_id}")
                else:
                    print(f"Failed to delete existing image link: {delete_response.status_code}")
    except Exception as e:
        print(f"Error clearing existing image links: {e}")
    
    success = True
    junction_url = f"{DIRECTUS_URL}/items/kepka_shoots_files"
    headers = get_directus_headers()
    
    # Try each link individually to maximize success rate
    for file_id in file_ids:
        junction_payload = {
            "kepka_shoots_id": photoshoot_id,
            "directus_files_id": file_id
        }
        
        try:
            response = requests.post(junction_url, headers=headers, json=junction_payload)
            if response.status_code == 200:
                print(f"Linked image {file_id} to photoshoot {photoshoot_id}")
            else:
                print(f"Failed to link image {file_id} to photoshoot {photoshoot_id}: {response.status_code} - {response.text}")
                success = False
        except Exception as e:
            print(f"Error creating image link: {e}")
            success = False
        
        # Add small delay between API calls
        time.sleep(0.5)  # Increased delay between junction creation calls
            
    return success

def update_photoshoot_with_images(photoshoot_id, file_ids):
    """Updates a photoshoot with image relationships using the API."""
    if not file_ids:
        return True
    
    try:
        # First try to get the current photoshoot to see if it exists
        get_url = f"{DIRECTUS_URL}/items/kepka_shoots/{photoshoot_id}"
        response = requests.get(get_url, headers=get_directus_headers())
        
        if response.status_code != 200:
            print(f"Error retrieving photoshoot {photoshoot_id}: {response.status_code}")
            return False
        
        # Use the direct junction table method since it's more reliable
        return link_photoshoot_images(photoshoot_id, file_ids)
    except Exception as e:
        print(f"Error updating photoshoot with images: {e}")
        return False

def create_or_update_photoshoot(photoshoot_data, image_ids):
    """Creates a photoshoot or updates it if it already exists, then links images."""
    slug = photoshoot_data["slug"]
    
    # First check if a photoshoot with this slug already exists
    existing_photoshoot = None
    if UPDATE_EXISTING:
        existing_photoshoot = find_photoshoot_by_slug(slug)
    
    if existing_photoshoot:
        # Update the existing photoshoot
        photoshoot_id = existing_photoshoot["id"]
        payload = {
            "title": photoshoot_data["title"],
            "description": photoshoot_data["description"],
            "date_created": photoshoot_data["date_created"]
        }
        
        updated_photoshoot = update_directus_item("kepka_shoots", photoshoot_id, payload)
        if not updated_photoshoot:
            print(f"Failed to update photoshoot with slug '{slug}'")
            return False
            
        print(f"Updated existing photoshoot '{photoshoot_data['title']}' (ID: {photoshoot_id})")
    else:
        # Create a new photoshoot
        payload = {
            "title": photoshoot_data["title"],
            "description": photoshoot_data["description"],
            "date_created": photoshoot_data["date_created"],
            "slug": slug
        }
        
        new_photoshoot = create_directus_item("kepka_shoots", payload)
        if not new_photoshoot:
            return False
            
        photoshoot_id = new_photoshoot["id"]
    
    # Now link the images
    if not image_ids:
        print(f"No images to link for photoshoot '{photoshoot_data['title']}'")
        return True
    
    print(f"Linking {len(image_ids)} images to photoshoot '{photoshoot_data['title']}' (ID: {photoshoot_id})")
    return update_photoshoot_with_images(photoshoot_id, image_ids)

# --- Processing Functions --- #

def process_artwork_data(story):
    """Extracts relevant data for an artwork."""
    content = story.get("content", {})
    return {
        "storyblok_id": story.get("id"),
        "title": content.get("Title_ENG", "") or story.get("name", ""),
        "description": content.get("Description_ENG", ""),
        "date_created": story.get("created_at", ""),
        "slug": story.get("slug", ""),
        "cover_url": content.get("image", {}).get("filename", "") if content.get("image") else None
    }

def process_photoshoot_data(story):
    """Extracts relevant data for a photoshoot."""
    content = story.get("content", {})
    images = []
    gallery = content.get("gallery", [])
    for item in gallery:
        if isinstance(item, dict) and "filename" in item:
            images.append(item["filename"])
            
    return {
        "storyblok_id": story.get("id"),
        "title": content.get("name_eng", "") or content.get("name_pl", "") or story.get("name", ""),
        "description": content.get("desc_eng", "") or content.get("desc_pl", ""),
        "date_created": story.get("created_at", ""),
        "slug": story.get("slug", ""),
        "image_urls": images
    }

# --- Main Migration Logic --- #

def main():
    print("Starting Storyblok to Directus Migration (API Version)")
    print(f"Directus Instance: {DIRECTUS_URL}")
    print(f"Processing artworks: {PROCESS_ARTWORKS}")
    print(f"Max images per photoshoot: {MAX_IMAGES_PER_PHOTOSHOOT}")
    print(f"Update existing items: {UPDATE_EXISTING}")
    
    if DIRECTUS_TOKEN == "YOUR_DIRECTUS_API_TOKEN":
        print("\nERROR: Please configure your DIRECTUS_URL and DIRECTUS_TOKEN in the script.")
        return

    # 1. Fetch data from Storyblok
    print("\nFetching data from Storyblok...")
    artwork_api_data = None
    if PROCESS_ARTWORKS:
        artwork_api_data = fetch_storyblok_data(ARTWORK_URL)
    photoshoot_api_data = fetch_storyblok_data(PHOTOSHOOT_URL)

    if PROCESS_ARTWORKS and not artwork_api_data:
        print("Failed to fetch artwork data from Storyblok.")
    if not photoshoot_api_data:
        print("Failed to fetch photoshoot data from Storyblok. Exiting.")
        return
        
    artworks = []
    if PROCESS_ARTWORKS and artwork_api_data:
        artworks = [process_artwork_data(story) for story in artwork_api_data.get("stories", [])]
    
    photoshoots = [process_photoshoot_data(story) for story in photoshoot_api_data.get("stories", [])]
    
    # Limit the number of images per photoshoot
    for photoshoot in photoshoots:
        if len(photoshoot["image_urls"]) > MAX_IMAGES_PER_PHOTOSHOOT:
            print(f"Limiting photoshoot '{photoshoot['title']}' from {len(photoshoot['image_urls'])} to {MAX_IMAGES_PER_PHOTOSHOOT} images")
            photoshoot["image_urls"] = photoshoot["image_urls"][:MAX_IMAGES_PER_PHOTOSHOOT]
            
    print(f"Found {len(artworks)} artworks and {len(photoshoots)} photoshoots.")

    # 2. Collect all unique image URLs
    print("\nCollecting unique image URLs...")
    all_image_urls = set()
    if PROCESS_ARTWORKS:
        for artwork in artworks:
            if artwork["cover_url"]:
                all_image_urls.add(artwork["cover_url"])
                
    for photoshoot in photoshoots:
        for url in photoshoot["image_urls"]:
            if url:
                all_image_urls.add(url)
    print(f"Found {len(all_image_urls)} unique image URLs to process.")

    # 3. Upload images to Directus and store mapping
    print("\nUploading images to Directus...")
    image_url_to_id_map = {}
    upload_count = 0
    for url in all_image_urls:
        file_id = upload_directus_file(url)
        if file_id:
            image_url_to_id_map[url] = file_id
            upload_count += 1
        # Add a small delay to avoid overwhelming the server/network
        time.sleep(0.5)
        
    print(f"Successfully uploaded {upload_count} images out of {len(all_image_urls)}.")
    if upload_count < len(all_image_urls):
         print("WARNING: Some images failed to upload. Check logs above.")

    # 4. Create Artwork items in Directus
    if PROCESS_ARTWORKS:
        print("\nCreating Artwork items...")
        created_artworks = 0
        for artwork in artworks:
            file_id = image_url_to_id_map.get(artwork["cover_url"])
            payload = {
                "title": artwork["title"],
                "description": artwork["description"],
                "date_created": artwork["date_created"],
                "slug": artwork["slug"],
                "cover": file_id # Link the file ID
            }
            # Remove cover if file upload failed
            if not file_id and artwork["cover_url"]:
                 print(f"Skipping cover link for artwork '{artwork['title']}' due to upload failure.")
                 payload.pop("cover")
                 
            if create_directus_item("kepka_artworks", payload):
                created_artworks += 1
            time.sleep(0.5) # Increased delay
        print(f"Created {created_artworks} artwork items.")

    # 5. Create or update Photoshoot items in Directus
    print("\nCreating/Updating Photoshoot items...")
    processed_photoshoots = 0
    for photoshoot in photoshoots:
        # Get all valid file IDs for this photoshoot
        valid_file_ids = []
        for url in photoshoot["image_urls"]:
            file_id = image_url_to_id_map.get(url)
            if file_id:
                valid_file_ids.append(file_id)
            elif url:
                print(f"Image not found for photoshoot '{photoshoot['title']}' (URL: {url})")
        
        # Create or update the photoshoot and its image relationships
        if create_or_update_photoshoot(photoshoot, valid_file_ids):
            processed_photoshoots += 1
        time.sleep(1.0) # Longer delay for complex operations
    
    print(f"Successfully processed {processed_photoshoots} photoshoot items.")
    print("\nMigration finished.")

if __name__ == "__main__":
    main()



