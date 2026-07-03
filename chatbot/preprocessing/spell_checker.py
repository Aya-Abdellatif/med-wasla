from spellchecker import SpellChecker


# create a single instance (used across project)
spell = SpellChecker()


def clean_query(user_query):
    """
    Cleans and corrects spelling in user input.
    """

    query = user_query.strip().lower()

    try:
        words = query.split()

        unknown = spell.unknown(words)

        corrected = []

        for word in words:

            # handle shortcut "iam"
            if word == "iam":
                corrected.extend(["i", "am"])
                continue

            # correct unknown words
            if word in unknown:

                fixed = spell.correction(word)

                corrected.append(fixed if fixed else word)

            else:
                corrected.append(word)

        return " ".join(corrected)

    except Exception as e:

        print(f"⚠️ Spell correction skipped: {e}")

        return query