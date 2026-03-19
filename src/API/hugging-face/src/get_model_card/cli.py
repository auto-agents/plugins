import argparse
import json
import sys

from huggingface_hub import ModelCard


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="get-model-card")
    parser.add_argument(
        "model_id",
        help="Model repo id on the Hugging Face Hub, e.g. 'gpt2' or 'meta-llama/Llama-2-7b-hf'",
    )
    parser.add_argument(
        "--json",
        action="store_true",
        help="Output the card data as JSON (card.data.to_dict()) instead of markdown.",
    )

    args = parser.parse_args(argv)

    try:
        card = ModelCard.load(args.model_id)
    except Exception as e:
        sys.stderr.write(f"failed to load model card for '{args.model_id}': {e}\n")
        return 2

    if args.json:
        data = getattr(card, "data", None)
        if data is None:
            sys.stdout.write("{}\n")
            return 0
        try:
            payload = data.to_dict()
        except Exception:
            payload = {}
        sys.stdout.write(json.dumps(payload, ensure_ascii=False) + "\n")
        return 0

    # Print markdown
    sys.stdout.write(card.text)
    if not card.text.endswith("\n"):
        sys.stdout.write("\n")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
