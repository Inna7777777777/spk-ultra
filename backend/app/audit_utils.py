import json
from typing import Optional
from . import models


def log_audit(
    db,
    site_id: int,
    user_id: Optional[int],
    action: str,
    entity_type: str,
    entity_id: Optional[int],
    data: dict | None = None,
):
    entry = models.AuditLog(
        site_id=site_id,
        user_id=user_id,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        data=json.dumps(data or {}, ensure_ascii=False),
    )
    db.add(entry)
    # вызывать db.commit() снаружи
