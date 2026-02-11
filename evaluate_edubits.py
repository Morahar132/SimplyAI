#!/usr/bin/env python3
"""Read a JSON file, run quality checks, and optionally send to a local LLM."""

import argparse
import json
import sys
import urllib.request


def _stringify(value):
    if value is None:
        return ""
    return str(value)


def extract_question_fields(item):
    question_text = None
    options = None
    answer = None

    if isinstance(item.get("question"), dict):
        question_text = item["question"].get("body") or item["question"].get("text")
        options = item["question"].get("options")
    else:
        question_text = item.get("question")

    if options is None:
        options = item.get("options")

    if question_text is None and isinstance(item.get("contents"), dict):
        question_text = item["contents"].get("question") or item["contents"].get("body")
        if options is None:
            options = item["contents"].get("options")

    if isinstance(item.get("answer"), dict):
        answer = item["answer"].get("answer")
    else:
        answer = item.get("answer")

    if answer is None:
        answer = item.get("correctAnswer")

    return question_text, options, answer


def flatten_questions(data):
    if isinstance(data, list):
        return data
    if isinstance(data, dict):
        for key in ("questions", "items", "data"):
            value = data.get(key)
            if isinstance(value, list):
                return value
    return []


def validate_questions(items):
    issues = []
    question_index = {}

    for idx, item in enumerate(items):
        if not isinstance(item, dict):
            issues.append({"index": idx, "issue": "Item is not an object"})
            continue

        question_text, options, answer = extract_question_fields(item)
        question_text = _stringify(question_text).strip()

        if not question_text:
            issues.append({"index": idx, "issue": "Missing question text"})
        else:
            key = question_text.casefold()
            if key in question_index:
                issues.append(
                    {
                        "index": idx,
                        "issue": "Duplicate question text",
                        "duplicate_of": question_index[key],
                    }
                )
            else:
                question_index[key] = idx

        if options is not None:
            if not isinstance(options, list):
                issues.append({"index": idx, "issue": "Options is not a list"})
            else:
                cleaned = [_stringify(opt).strip() for opt in options]
                if len(cleaned) < 2:
                    issues.append({"index": idx, "issue": "Fewer than 2 options"})
                empty_positions = [pos for pos, val in enumerate(cleaned) if not val]
                if empty_positions:
                    issues.append(
                        {
                            "index": idx,
                            "issue": "Empty option values",
                            "positions": empty_positions,
                        }
                    )
                normalized = [val.casefold() for val in cleaned if val]
                if len(set(normalized)) != len(normalized):
                    issues.append({"index": idx, "issue": "Duplicate options"})

                if isinstance(answer, int) and (answer < 0 or answer >= len(cleaned)):
                    issues.append(
                        {
                            "index": idx,
                            "issue": "Correct answer index out of range",
                        }
                    )
        else:
            issues.append({"index": idx, "issue": "Missing options"})

    return issues


def build_prompt(payload, custom_prompt=None):
    if custom_prompt:
        return f"{custom_prompt}\n\nJSON:\n{payload}"
    return (
        "Evaluate the question data below for quality. Check:\n"
        "- Options validity and duplication\n"
        "- Spelling/grammar issues in question text and options\n"
        "- Ambiguity or unclear wording\n"
        "- Any malformed fields\n\n"
        "Return a concise list of issues with indices.\n\n"
        f"JSON:\n{payload}"
    )


def main():
    parser = argparse.ArgumentParser(
        description="Send JSON content to a local LLM endpoint for quality evaluation."
    )
    parser.add_argument(
        "--json_file",
        nargs="?",
        default="pushpak.EduBitsCards.json",
        help="Path to JSON file to evaluate",
    )
    parser.add_argument(
        "--model",
        default="llama3.2:1b",
        help="Model name to use (default: llama3.2:1b)",
    )
    parser.add_argument(
        "--endpoint",
        default="http://localhost:11434/api/generate",
        help="LLM endpoint URL",
    )
    parser.add_argument(
        "--prompt",
        default=None,
        help="Custom prompt prefix to use before the JSON",
    )
    parser.add_argument(
        "--max-items",
        type=int,
        default=200,
        help="Maximum number of items to send to the LLM (default: 200)",
    )
    parser.add_argument(
        "--no-llm",
        action="store_true",
        help="Skip the LLM call and only run local checks",
    )

    args = parser.parse_args()

    try:
        with open(args.json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except FileNotFoundError:
        print(f"File not found: {args.json_file}", file=sys.stderr)
        sys.exit(1)
    except json.JSONDecodeError as exc:
        print(f"Invalid JSON: {exc}", file=sys.stderr)
        sys.exit(1)

    items = flatten_questions(data)
    issues = validate_questions(items)

    print(f"Loaded {len(items)} items")
    print(f"Local issues found: {len(issues)}")
    if issues:
        print(json.dumps(issues[:50], ensure_ascii=False, indent=2))
        if len(issues) > 50:
            print(f"... {len(issues) - 50} more issues not shown")

    if args.no_llm:
        return

    slim_items = []
    for idx, item in enumerate(items[: args.max_items]):
        question_text, options, answer = extract_question_fields(item)
        slim_items.append(
            {
                "index": idx,
                "id": _stringify(item.get("id") or item.get("_id") or ""),
                "question": _stringify(question_text).strip(),
                "options": options,
                "answer": answer,
            }
        )

    payload = json.dumps(slim_items, ensure_ascii=False, indent=2)
    prompt = build_prompt(payload, args.prompt)

    body = json.dumps(
        {
            "model": args.model,
            "prompt": prompt,
            "stream": False,
        }
    ).encode("utf-8")

    req = urllib.request.Request(
        args.endpoint,
        data=body,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            response_text = resp.read().decode("utf-8")
    except Exception as exc:
        print(f"Request failed: {exc}", file=sys.stderr)
        sys.exit(1)

    try:
        response_json = json.loads(response_text)
        print(response_json.get("response", ""))
    except json.JSONDecodeError:
        print(response_text)


if __name__ == "__main__":
    main()
