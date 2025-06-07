import database.auth as auth


def test_token_encode_decode():
    token = auth.create_access_token({'sub':'user'})
    claims = auth.decode_token(token)
    assert claims['sub'] == 'user'

