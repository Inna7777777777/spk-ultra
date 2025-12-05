from pydantic_settings import BaseSettings
from functools import lru_cache
from typing import List
import os


class Settings(BaseSettings):
    app_name: str = "SPK Multisite Ultra"
    secret_key: str = os.getenv("SECRET_KEY", "CHANGE_ME")
    algorithm: str = "HS256"
    access_token_expire_minutes: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

    database_url: str = os.getenv("DATABASE_URL", "sqlite:///./spk.db")
    cors_origins: List[str] = []

    # Реквизиты для квитанций (можно задать через .env)
    pay_receiver: str = os.getenv("PAY_RECEIVER", "СПК «Хорошово-1»")
    pay_inn: str = os.getenv("PAY_INN", "0000000000")
    pay_kpp: str = os.getenv("PAY_KPP", "000000000")
    pay_bank: str = os.getenv("PAY_BANK", "БАНК ПОЛУЧАТЕЛЯ")
    pay_bik: str = os.getenv("PAY_BIK", "000000000")
    pay_account: str = os.getenv("PAY_ACCOUNT", "00000000000000000000")
    pay_correspondent_account: str = os.getenv("PAY_CORR_ACCOUNT", "00000000000000000000")
    pay_sbp_phone: str = os.getenv("PAY_SBP_PHONE", "+70000000000")  # телефон для СБП (если есть)


@lru_cache()
def get_settings():
    return Settings()


settings = get_settings()
