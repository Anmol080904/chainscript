from sqlalchemy import Enum,String,UUID
from database.database import Base
from sqlalchemy.orm import mapped_column,Mapped
import uuid
class User(Base):
    __tablename__="Users"
    id:Mapped[uuid.UUID]=mapped_column(primary_key=True,index=True,nullable=False)
    name:Mapped[str]=mapped_column(index=True,nullable=False)
    email:Mapped[str]=mapped_column(nullable=False,unique=True)
    password:Mapped[str]=mapped_column(nullable=False)
