# get-model-card

Python CLI tool that fetches a Hugging Face Hub model card and prints it.

## Install (editable)

```bash
pip install -e .
```

## Usage

```bash
get-model-card gpt2
```

If you need to access gated models, authenticate first (e.g. `huggingface-cli login`) or set `HF_TOKEN`.
