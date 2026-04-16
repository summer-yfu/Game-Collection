from __future__ import annotations

from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from anagram_solver import load_dictionary, solve

_dicts: dict = {}
_dict_dir = Path(__file__).resolve().parent.parent / "dictionary"

_DICT_FILES = {
    "general": "words_alpha.txt",
    "osrs": "osrs.txt",
}


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _dicts
    for key, filename in _DICT_FILES.items():
        result = load_dictionary(_dict_dir / filename)
        if result is not None:
            _dicts[key] = result
        elif key == "general":
            raise RuntimeError(f"Required dictionary missing: {_dict_dir / filename}")
    yield


app = FastAPI(title="Anagram API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)


class AnagramRequest(BaseModel):
    text: str = ""
    dict_name: str = Field(default="osrs", alias="dict")
    max_words: int = Field(default=24, ge=1, le=100)
    max_phrases: int = Field(default=24, ge=1, le=100)
    max_phrase_terms: int = Field(default=3, ge=2, le=4)


class AnagramResponse(BaseModel):
    input: str
    word_matches: list[str]
    phrase_matches: list[str]


@app.post("/api/anagrams", response_model=AnagramResponse)
def anagrams(body: AnagramRequest) -> AnagramResponse:
    key = body.dict_name if body.dict_name in _dicts else "general"
    if key not in _dicts:
        raise RuntimeError("no dictionary loaded")
    words, index = _dicts[key]
    word_matches, phrase_matches = solve(
        body.text, words, index,
        max_words=body.max_words,
        max_phrases=body.max_phrases,
        max_phrase_terms=body.max_phrase_terms,
    )
    return AnagramResponse(
        input=body.text,
        word_matches=word_matches,
        phrase_matches=phrase_matches,
    )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("server:app", host="0.0.0.0", port=8080)
