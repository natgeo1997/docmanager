"""Evaluate the actual DocManager summary path on fictional text pairs."""
import argparse
from datetime import datetime, timezone
import json
import os
from pathlib import Path
import statistics
import sys
import time
import unicodedata

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
from backend.main import Revisao, gerar_historico


def normalize(text):
    return ''.join(char for char in unicodedata.normalize('NFKD', text.casefold()) if not unicodedata.combining(char))


def score(cases, responses):
    known = {case['id'] for case in cases}
    if not cases or len(known) != len(cases):
        raise ValueError('Cases must have unique IDs and cannot be empty')
    by_id = {}
    for row in responses:
        if row['id'] not in known or row['id'] in by_id:
            raise ValueError('Unknown or duplicate response ID')
        by_id[row['id']] = row
    rows = []
    for case in cases:
        item = by_id.get(case['id'], {})
        text = item.get('summary')
        valid = isinstance(text, str) and bool(text.strip()) and text.strip()[-1] in '.!?'
        normalized = normalize(text) if isinstance(text, str) else ''
        expected = bool(valid and all(any(normalize(term) in normalized for term in group) for group in case['required_any']))
        forbidden = any(normalize(term) in normalized for term in case['forbidden'])
        rows.append({'id': case['id'], 'valid_summary': valid, 'expected_term_coverage': expected,
                     'forbidden_term_found': forbidden, 'word_count': len(text.split()) if isinstance(text, str) else None,
                     'latency_seconds': item.get('latency_seconds')})
    total = len(cases)
    latency = [row['latency_seconds'] for row in rows if isinstance(row['latency_seconds'], (int, float))]
    return {'case_count': total, 'valid_summary_rate': sum(r['valid_summary'] for r in rows)/total,
            'expected_term_coverage_rate': sum(r['expected_term_coverage'] for r in rows)/total,
            'forbidden_term_hit_count': sum(r['forbidden_term_found'] for r in rows),
            'median_latency_seconds': statistics.median(latency) if latency else None, 'cases': rows}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    mode = parser.add_mutually_exclusive_group(required=True)
    mode.add_argument('--live', action='store_true')
    mode.add_argument('--responses', type=Path)
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args()
    cases = json.loads((ROOT/'evaluation/cases.json').read_text())
    if args.live:
        if not os.environ.get('OPENAI_API_KEY','').strip():
            parser.error('Configure OPENAI_API_KEY as a repository Actions secret or environment variable. No calls made.')
        responses=[]
        for case in cases:
            start=time.monotonic()
            try:
                result=gerar_historico(Revisao(documento='Fictional benchmark',versao_anterior=case['before'],versao_atual=case['after']))
                responses.append({'id':case['id'],'summary':result['resumo'],'latency_seconds':round(time.monotonic()-start,3)})
            except Exception:
                responses.append({'id':case['id'],'error':'provider_or_validation_failure','latency_seconds':round(time.monotonic()-start,3)})
    else:
        responses=json.loads(args.responses.read_text())
    result=score(cases,responses)
    result['run']={'mode':'openai-live' if args.live else 'captured-responses','model':os.environ.get('OPENAI_MODEL','gpt-5-mini') if args.live else None,'created_at':datetime.now(timezone.utc).isoformat(),'scope':'Lexical checks on fictional examples; not semantic accuracy or production performance.'}
    args.output.mkdir(parents=True,exist_ok=True)
    for name,value in [('metrics',result),('responses',responses),('human-review',[{'id':case['id'],'faithfulness_0_to_2':None,'edit_coverage_0_to_2':None,'no_inferred_consequences_0_to_2':None,'notes':''} for case in cases])]:
        (args.output/(name+'.json')).write_text(json.dumps(value,ensure_ascii=False,indent=2)+'\n')
    print(json.dumps({k:v for k,v in result.items() if k!='cases'},indent=2))

if __name__=='__main__':
    main()
