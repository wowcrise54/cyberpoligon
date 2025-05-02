from sqlalchemy import Integer, Column, String
from database.db_config import Base

class Users(Base):
     __tablename__ = 'users'
    
     id = Column(Integer, primary_key=True)
     first_name = Column(String, nullable=False)
     last_name = Column(String, nullable=False)
     email = Column(String, unique=True, nullable=False)
     password = Column(String, nullable=False)
