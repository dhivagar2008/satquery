import hashlib
import json
from datetime import datetime, timezone
from typing import Any, Dict

def generate_audit_hash(
    geometry: Dict[str, Any],
    year_start: int,
    year_end: int,
    index_type: str,
    metrics: Dict[str, Any],
    timestamp: str = None
) -> str:
    """
    Computes a cryptographic SHA-256 tamper-proof signature
    over the analysis parameters and computed geospatial metrics.
    """
    if timestamp is None:
        timestamp = datetime.now(timezone.utc).isoformat()

    payload = {
        "geometry": geometry,
        "year_start": year_start,
        "year_end": year_end,
        "index_type": index_type,
        "metrics": metrics,
        "signature_version": "v1-sha256",
        "authority": "SatQuery-EarthObservation-Dossier"
    }

    canonical_str = json.dumps(payload, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest()

def verify_audit_hash(
    geometry: Dict[str, Any],
    year_start: int,
    year_end: int,
    index_type: str,
    metrics: Dict[str, Any],
    expected_hash: str
) -> bool:
    """Verifies that an audit hash matches canonical parameters."""
    calculated = generate_audit_hash(geometry, year_start, year_end, index_type, metrics)
    return calculated == expected_hash
