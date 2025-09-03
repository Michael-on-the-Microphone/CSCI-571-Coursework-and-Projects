from fastapi import FastAPI, HTTPException # type: ignore
from fastapi.responses import FileResponse, HTMLResponse # type: ignore
import requests # type: ignore
from fastapi.staticfiles import StaticFiles # type: ignore

import os
import time


ARTSY_TOKEN = None
ARTSY_API_BASE_URL = "https://api.artsy.net/api"

app = FastAPI()

def generate_token():
    """
    Generate a new Artsy API token.
    """
    client_id = "e4837ed4288e90964c88"
    client_secret = "28cf5dabdbc7522155b01add560fc196"
    token_url = f"{ARTSY_API_BASE_URL}/tokens/xapp_token"
    params = {"client_id": client_id, "client_secret": client_secret}
    response = None
    # Added delay between retries to avoid busy looping
    while response is None:
        try:
            response = requests.post(token_url, params=params)
        except requests.exceptions.RequestException:
            time.sleep(1)
    if response.status_code not in (200, 201):
        raise HTTPException(status_code=response.status_code, detail="Error making new token")
    json_response = response.json()
    token = json_response["token"]
    return token

@app.get("/search")
def search_artist(keyword: str):
    global ARTSY_TOKEN
    if ARTSY_TOKEN is None:
        ARTSY_TOKEN = generate_token()

    headers = {"X-Xapp-Token": ARTSY_TOKEN}
    params = {"q": keyword, "type": "artist", "size": 10}  # Limit results

    response = requests.get(f"{ARTSY_API_BASE_URL}/search", headers=headers, params=params)
    
    if response.status_code != 200:
        ARTSY_TOKEN = generate_token()  # Refresh token if needed
        response = requests.get(f"{ARTSY_API_BASE_URL}/search", headers={"X-Xapp-Token": ARTSY_TOKEN}, params=params)

    data = response.json()
    
    # Extract artist details
    artists = []
    for result in data.get('_embedded', {}).get('results', []):
        if result.get('og_type') == 'artist':
            artist_id = result['_links']['self']['href'].split("/")[-1]
            artist_name = result['title']
            thumbnail_url = result['_links']['thumbnail']['href']
            artists.append({"id": artist_id, "name": artist_name, "image": thumbnail_url})

    return {"artists": artists}

@app.get("/artist/{artist_id}")
def get_artist(artist_id: str):
    """
    artist id --> artist info
    artist --> "_links" --> "self" --> "href"

    {
        "type": "artist",
        "title": "Pablo Picasso",
        "description": null,
        "og_type": "artist",
        "_links": {
          "self": {
            "href": "https://api.artsy.net/api/artists/ --> 4d8b928b4eb68a1b2c0001f2 <-- this part"
          },
          "permalink": {
            "href": "https://www.artsy.net/artist/pablo-picasso"
          },
          "thumbnail": {
            "href": "https://d32dm0rphc51dk.cloudfront.net/i3rCA3IaKE-cLBnc-U5swQ/square.jpg"
          }
        }
      }
    """
    headers = {"X-Xapp-Token": ARTSY_TOKEN}
    response = requests.get(f"{ARTSY_API_BASE_URL}/artists/{artist_id}", headers=headers)
    if response.status_code != 200:
        raise HTTPException(status_code=response.status_code, detail="Error getting artist details")
    return response.json()

@app.get("/", response_class=HTMLResponse)
def serve_index():
    """
    Serve the index.html file as the front end.
    """
    file_path = os.path.join(os.path.dirname(__file__), "index.html")
    return FileResponse(file_path, media_type="text/html")

app.mount("/static", StaticFiles(directory="static"), name="static")

# For debugging purposes only. Remove or adjust for production.
if __name__ == "__main__":
    print(search_artist("picasso"))