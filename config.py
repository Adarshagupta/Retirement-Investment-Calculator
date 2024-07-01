import requests
import json

HUME_API_KEY = "oP3Gspr4CdSzj0DjVZl6IqnPuSR4C9M7GebeiNiwtQ1o9ToA"

# Create files (POST /files)
response = requests.post(
    "https://api.hume.ai/v0/registry/files",
    headers={
        "X-Hume-Api-Key": HUME_API_KEY,
        "Content-Type": "application/json"
    },
    json=[{
        "file": {
            "name": "00033_depressed.mp4",
            "hume_storage": True,
            "data_type": "video/mp4",
            "uri": "storage.com/00033_depressed.mp4"
        }
    }, {
        "file": {
            "name": "00034_depressed.mp4",
            "hume_storage": True,
            "data_type": "video/mp4",
            "uri": "storage.com/00034_depressed.mp4"
        }
    }],
)

# Create dataset (POST /datasets)
response = requests.post(
    "https://api.hume.ai/v0/registry/datasets",
    headers={
        "X-Hume-Api-Key": HUME_API_KEY,
        "Content-Type": "multipart/form-data"
    },
    data={
        'name': json.dumps("Depressed vs Not Depressed"),
    },
    files={
        'labels_file': ('labelsFile.csv', open('labelsFile.csv', 'rb')),
    },
)
