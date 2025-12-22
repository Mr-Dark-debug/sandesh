import re
from dataclasses import dataclass
from ..exceptions import InvalidEmailError

@dataclass(frozen=True)
class EmailAddress:
    value: str
    username: str
    domain: str

    @classmethod
    def from_string(cls, address: str) -> "EmailAddress":
        address = address.strip()
        if "@" not in address:
            raise InvalidEmailError(f"Invalid email format: {address}")

        parts = address.split("@")
        if len(parts) != 2:
            raise InvalidEmailError(f"Invalid email format: {address}")

        username, domain = parts
        if not username or not domain:
            raise InvalidEmailError(f"Invalid email format: {address}")

        return cls(value=address, username=username, domain=domain)

    def __str__(self) -> str:
        return self.value
