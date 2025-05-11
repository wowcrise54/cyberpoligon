from sqlalchemy import Column, Integer, String, Text
from database.db_config import Base

class Script(Base):
    __tablename__ = "scripts"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), unique=True, index=True, nullable=False)
    description = Column(Text, nullable=True)
    path = Column(String(500), nullable=False)
    template_id = Column(Integer, nullable=False)
    tag = Column(String(200), nullable=False)
    app = Column(String(200), nullable=False)