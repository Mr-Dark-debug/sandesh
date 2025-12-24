class SandeshError(Exception):
    """Base exception for Sandesh."""
    pass


class DomainError(SandeshError):
    """Base for domain logic errors."""
    pass


class ValidationError(SandeshError):
    """Input validation errors."""
    pass


class InvalidEmailError(DomainError):
    pass


class EntityNotFoundError(SandeshError):
    pass


class AuthenticationError(SandeshError):
    pass


class AuthorizationError(SandeshError):
    """User lacks permission for action."""
    pass
