# Change-summary evaluation

Eight fictional before/after pairs exercise unchanged content, a deadline, a responsible team, additions, removals, format replacement, two simultaneous edits and one embedded instruction. This is a small development fixture, not a representative or independently labelled benchmark.

## Recorded run

[2 November 2026: captured responses, measured checks and assistant review](reports/2026-11-02/README.md). All eight cases passed the lexical checks; one summary has a precision concern documented in the review. These are not semantic-accuracy results.

## Run

```bash
python -m pip install -r requirements-dev.txt
# Uses the application's actual gerar_historico function. Requires your own key.
python evaluation/run.py --live --output evaluation/results/openai
# Re-score captured outputs without API calls
python evaluation/run.py --responses evaluation/results/openai/responses.json --output evaluation/results/rescored
python -m pytest -q
```

Set `OPENAI_API_KEY` in your environment. `OPENAI_MODEL` defaults to the same model as the application. The unchanged case bypasses the model; the other seven cases each invoke the app's request path, with its configured timeout and limited SDK retries. Live calls may incur provider charges.

The **Evaluate OpenAI summaries** workflow uses the repository Actions secret `OPENAI_API_KEY`. Run it manually, or explicitly opt in on a main-branch commit affecting `evaluation/**` or this workflow by including `[run-openai-evaluation]` in the commit message. Ordinary CI never calls a model.

## Interpret results

- **Valid summary rate:** nonempty summaries ending with punctuation / all eight cases. Includes the deterministic unchanged-text response.
- **Expected-term coverage:** summaries containing at least one term from each hand-authored alternative group / all cases. Accent-insensitive substring matching is a lexical proxy; it can miss good paraphrases and reward bad sentences containing the right words.
- **Forbidden-term hits:** occurrences of a small case-specific list of unsupported phrases. Zero hits is not proof of factual correctness or prompt-injection resistance.
- **Word count and median latency:** descriptive values, not guarantees. Latency includes the no-model unchanged path.

Failed and missing responses stay in the denominator. Duplicate and unknown IDs are rejected. Output files contain captured responses, metrics and a blank human-review form. Results are ignored by Git; review them before publishing.

For each response, score faithfulness, coverage of actual edits and absence of inferred consequences: 0 = fails, 1 = partially meets, 2 = meets. Record a reason for every score. No human-review result is implied by a successful automated run. Add independent reviewers, held-out examples and repeated runs before making broader quality claims.
