from app.core.logging import configure_logging, get_logger
from app.worker.celery_app import celery_app

configure_logging()
logger = get_logger(__name__)


@celery_app.task(name="store_lab.health_check")
def health_check() -> dict[str, str]:
    logger.info("worker_health_check")
    return {"status": "ok"}

