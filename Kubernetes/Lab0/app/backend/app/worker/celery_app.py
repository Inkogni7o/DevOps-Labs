from celery import Celery

from app.core.config import get_settings

settings = get_settings()

celery_app = Celery(
    "store_lab_worker",
    broker=str(settings.redis_url),
    backend=str(settings.redis_url),
    include=["app.worker.tasks"],
)
celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
)
