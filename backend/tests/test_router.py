import database.router as r


def test_get_password_hash():
    pw = 'secret'
    hashed = r.get_password_hash(pw)
    assert hashed != pw
    assert r.pwd_context.verify(pw, hashed)

