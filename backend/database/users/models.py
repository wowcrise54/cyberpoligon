from sqlalchemy import Integer, Column, String, ForeignKey
from sqlalchemy.orm import relationship
from database.db_config import Base

class Role(Base):
    __tablename__ = 'roles'
    
    id = Column(Integer, primary_key=True)
    name = Column(String, unique=True, nullable=False)
    users = relationship('Users', back_populates='role')

class Users(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password = Column(String, nullable=False)
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False)
    role = relationship('Role', back_populates='users')


class VirtualMachine(Base):
    __tablename__ = 'virtual_machine'

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    os_type = Column(String, nullable=False)
    cpu_cores = Column(Integer, nullable=False)
    memory_gb = Column(Integer, nullable=False)
    status = Column(String, nullable=False)
    address = Column(String, nullable=False)
