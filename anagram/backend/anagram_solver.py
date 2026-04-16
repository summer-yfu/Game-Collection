from __future__ import annotations

from pathlib import Path
from typing import NamedTuple

# letter frequency vector for fast subset checks
class LetterBag(NamedTuple):
    counts: tuple[int, ...]
    total: int


def make_bag(text: str) -> LetterBag:
    counts = [0] * 26
    total = 0
    for ch in text.lower():
        idx = ord(ch) - ord("a")
        if 0 <= idx < 26:
            counts[idx] += 1
            total += 1
    return LetterBag(tuple(counts), total)


def _fits_in(small: LetterBag, big: LetterBag) -> bool:
    if small.total > big.total:
        return False
    return all(s <= b for s, b in zip(small.counts, big.counts))


def _subtract_bag(a: LetterBag, b: LetterBag) -> LetterBag:
    return LetterBag(
        tuple(ac - bc for ac, bc in zip(a.counts, b.counts)),
        a.total - b.total,
    )


WordList = list[tuple[str, LetterBag]]
AnagramIndex = dict[str, list[str]]

_MIN_WORD_LEN = 2
_MAX_WORD_LEN = 32


def load_dictionary(path: str | Path) -> tuple[WordList, AnagramIndex] | None:
    p = Path(path)
    if not p.is_file():
        return None

    seen: set[str] = set()
    words: WordList = []
    index: AnagramIndex = {}

    with p.open(encoding="utf-8", errors="ignore") as f:
        for line in f:
            word = "".join(c for c in line.lower() if c.isalpha())
            if not _MIN_WORD_LEN <= len(word) <= _MAX_WORD_LEN or word in seen:
                continue
            seen.add(word)
            words.append((word, make_bag(word)))
            index.setdefault("".join(sorted(word)), []).append(word)

    words.sort(key=lambda e: (-len(e[0]), e[0]))
    return words, index


def solve(
    text: str,
    words: WordList,
    anagram_index: AnagramIndex,
    *,
    max_words: int = 24,
    max_phrases: int = 24,
    max_phrase_terms: int = 3,
) -> tuple[list[str], list[str]]:
    input_bag = make_bag(text)
    if input_bag.total == 0:
        return [], []

    cleaned = "".join(c for c in text.lower() if c.isalpha())

    sorted_key = "".join(sorted(cleaned))
    word_matches = sorted(
        w for w in anagram_index.get(sorted_key, []) if w != cleaned
    )[:max_words]

    candidates = [(w, b) for w, b in words if _fits_in(b, input_bag)]
    results: list[str] = []

    def search(remaining, start, depth, path):
        if len(results) >= max_phrases:
            return
        if remaining.total == 0:
            if len(path) >= 2 and "".join(path) != cleaned:
                results.append(" ".join(path))
            return
        if depth == 0:
            return
        for i in range(start, len(candidates)):
            w, bag = candidates[i]
            if not _fits_in(bag, remaining):
                continue
            path.append(w)
            search(_subtract_bag(remaining, bag), i, depth - 1, path)
            path.pop()
            if len(results) >= max_phrases:
                return

    search(input_bag, 0, max_phrase_terms, [])
    return word_matches, sorted(set(results))[:max_phrases]


def default_dictionary_path() -> Path:
    return Path(__file__).resolve().parent.parent / "dictionary" / "words_alpha.txt"
