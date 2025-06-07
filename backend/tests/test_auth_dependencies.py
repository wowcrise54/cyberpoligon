from types import SimpleNamespace
import pytest
import database.auth_dependencies as dep


def test_blacklist():
    token = 't'
    dep.blacklist_token(token)
    assert dep.is_token_blacklisted(token)

