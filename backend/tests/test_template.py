import semaphore_api.template as tpl


def test_extract_playbook_vars(tmp_path):
    pb = tmp_path / 'play.yml'
    pb.write_text("hello {{ var1 }} and {{ var2 }}")
    assert tpl.extract_playbook_vars(str(pb)) == ['var1', 'var2']


def test_build_survey_vars():
    res = tpl.build_survey_vars(['a'])
    assert res[0]['title'] == 'A'

