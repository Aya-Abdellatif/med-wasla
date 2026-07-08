import re

import models
from preprocessing.spell_checker import spell


def is_gibberish(text, chat_id):
    """
    Returns True if the message appears to be gibberish.
    """

    text = text.strip().lower()

    if not text:
        return True

    # --------------------------------------------------
    # Numbers only
    # --------------------------------------------------
    if re.fullmatch(r"[0-9\s]+", text):

        # Allow numbers if the bot previously asked for one.
        history = models.chat_sessions.get(chat_id, [])

        if history:

            last_bot = None

            for turn in reversed(history):

                if turn["role"] == "assistant":
                    last_bot = turn["text"].lower()
                    break

            if last_bot:

                numeric_keywords = [
                    "how many",
                    "how long",
                    "how old",
                    "how much",
                    "scale",
                    "1 to 10",
                    "rate",
                    "days",
                    "weeks",
                    "months",
                    "years"
                ]

                if any(
                    keyword in last_bot
                    for keyword in numeric_keywords
                ):
                    return False

        return True

    # --------------------------------------------------
    # Symbols only
    # --------------------------------------------------
    if re.fullmatch(r"[\W_]+", text):
        return True

    words = text.split()

    # --------------------------------------------------
    # Single meaningless token
    # --------------------------------------------------
    if len(words) == 1:

        word = words[0]

        vowels = sum(
            c in "aeiou"
            for c in word
        )

        # One character
        if len(word) == 1:
            return True

        # Same character repeated (ee, eee, rrrr...)
        if len(set(word)) == 1:
            return True

        # kb, df, xpt, jgd, wxyz...
        if 2 <= len(word) <= 4 and vowels == 0:
            return True

        # qwrty, zxcvb...
        if len(word) >= 5 and vowels <= 1:
            return True

        # Not a dictionary word, and not even a fuzzy (edit-distance)
        # match to one — e.g. "fejubfr", "iksdujdsegde". Real words,
        # including medical terms and genuine typos, always have at
        # least one candidate. Restricted to len >= 5 so short real
        # words with few candidates (e.g. "ve") aren't misflagged.
        if len(word) >= 5 and word not in spell and not spell.candidates(word):
            return True

    # --------------------------------------------------
    # Looks like normal text
    # --------------------------------------------------
    return False