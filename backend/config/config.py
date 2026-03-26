from pydantic_settings import BaseSettings,SettingsConfigDict
class Settings(BaseSettings):
    ASYNC_DATABASE_URL:str
    SECRET_KEY:str
    ALGORITHM:str
    ACCESS_TOKEN_EXPIRE_MINUTES:int
    REFRESH_TOKEN_EXPIRE_DAYS:int
    PEPPER:str
    ETHEREUM_RPC_URL:str
    ETHEREUM_WALLET_ADDRESS:str
    METAMASK_PRIVATE_KEY:str
    REMIX_CONTRACT_ADDRESS:str
    model_config=SettingsConfigDict(env_file=".env")
settings=Settings()