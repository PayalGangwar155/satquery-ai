import re
from typing import Set, Dict, Any, List, Tuple

class NumericGuardViolationError(Exception):
    """Raised when composer emits a numeric token not found in operation evidence."""
    pass

def extract_numeric_tokens(text: str) -> List[str]:
    """
    Extracts numerical tokens from text string, including integers, floats, percentages, and dates.
    Excludes markdown headers or common structural tokens if appropriate.
    """
    # Pattern for numbers: standalone floats/ints, percentages, dates YYYY-MM-DD
    # Matches numbers like 0.45, 12.5%, 4500, 2026-08-23, -0.12
    tokens = re.findall(r'-?\b\d+(?:\.\d+)?%?\b|\b\d{4}-\d{2}-\d{2}\b', text)
    return tokens

def build_evidence_set(evidence_dict: Dict[str, Any]) -> Set[str]:
    """
    Recursively collects all numeric string values from completed operation outputs.
    Includes common reformats like rounded values and percentage conversions.
    """
    evidence_set: Set[str] = set()

    def _collect(val: Any):
        if isinstance(val, (int, float)):
            s_val = str(val)
            evidence_set.add(s_val)
            # Add rounded forms
            evidence_set.add(str(round(val, 1)))
            evidence_set.add(str(round(val, 2)))
            evidence_set.add(str(round(val, 3)))
            evidence_set.add(str(round(val, 4)))
            evidence_set.add(str(int(val)))
            # Add percentage form (e.g. 0.45 -> 45%)
            if 0.0 <= val <= 1.0:
                pct = round(val * 100, 1)
                evidence_set.add(f"{pct}%")
                evidence_set.add(f"{int(pct)}%")
        elif isinstance(val, str):
            # Extract numbers from string values (e.g. scene IDs, dates, descriptions)
            nums = extract_numeric_tokens(val)
            for n in nums:
                evidence_set.add(n)
        elif isinstance(val, dict):
            for v in val.values():
                _collect(v)
        elif isinstance(val, list):
            for item in val:
                _collect(item)

    _collect(evidence_dict)
    return evidence_set

def validate_response_numerics(
    candidate_text: str,
    evidence_dict: Dict[str, Any]
) -> Tuple[bool, List[str]]:
    """
    Validates that every numeric token in candidate_text is grounded in evidence_dict.
    Returns (is_valid, list_of_violations).
    """
    evidence_set = build_evidence_set(evidence_dict)
    candidate_tokens = extract_numeric_tokens(candidate_text)
    
    violations: List[str] = []
    for token in candidate_tokens:
        clean_token = token.strip()
        # Allow year tokens if present in context or current time window
        if clean_token in evidence_set:
            continue
        # Also check if token with/without % is present
        if clean_token.endswith("%") and clean_token[:-1] in evidence_set:
            continue
        if not clean_token.endswith("%") and f"{clean_token}%" in evidence_set:
            continue
        
        violations.append(clean_token)

    return (len(violations) == 0, violations)
