from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
import sys
from os.path import abspath, dirname

# Добавляем корень проекта в PYTHONPATH
sys.path.insert(0, dirname(dirname(dirname(abspath(__file__)))))

from database.db_config import Base, DATABASE_URL
from database.users.models import Users
from database.scripts.models import Script
from alembic import context

# this is the Alembic Config object
config = context.config
config.set_main_option("sqlalchemy.url", f"{DATABASE_URL}?async_fallback=True")

# настройка логирования
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# включаем все модели в автогенерацию
target_metadata = Base.metadata

def run_migrations_offline() -> None:
    url = config.get_main_option("sqlalchemy.url")
    context.configure(
        url=url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()

def run_migrations_online() -> None:
    connectable = engine_from_config(
        config.get_section(config.config_ini_section, {}),
        prefix="sqlalchemy.",
        poolclass=pool.NullPool,
    )
    with connectable.connect() as connection:
        context.configure(
            connection=connection, target_metadata=target_metadata
        )
        with context.begin_transaction():
            context.run_migrations()

if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
