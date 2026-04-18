# Game-Collection

Gradually building and adding mini games/apps that is useful for my life.

Clone the repo & try yourself or open the website and click on each mini game to try available ones.

## How to run

**Terminal 1 — backend (API):**

```bash
cd anagram/backend
pip install -r requirements.txt
python server.py                  # runs on port 8080
```

**Terminal 2 — frontend (static files):**

```bash
python -m http.server 3000        # run from repo root
```

Open `http://localhost:3000`


## Available Games

### Anagram 

Input a word or phrases, and search the dictionary for words & phrases with same characters but different ordering. 

There's general mode using English dictionary and Osrs mode using words from wiki.

To get the osrs dictionary, do 
```bash
cd anagram/
python bucket_dictionary.py 
```




## TODO
- Clean code of other games and upload
- Publish & deploy on githubpage. 