import builtins
import json
from types import SimpleNamespace
import zvirt_client as zc
import pytest


def test_get_vms_success(tmp_path, monkeypatch):
    out_file = tmp_path / 'out.json'
    out_file.write_text(json.dumps([{'id':'1'}]))
    runner = SimpleNamespace(rc=0, stdout='ok')
    monkeypatch.setattr(zc.ansible_runner, 'run', lambda private_data_dir, playbook: runner)
    monkeypatch.setattr(zc.os.path, 'exists', lambda p: True)
    orig_open = builtins.open
    monkeypatch.setattr(builtins, 'open', lambda p, mode, encoding=None: orig_open(out_file, mode, encoding=encoding))
    result = zc.get_vms('playbook', str(out_file))
    assert result == [{'id':'1'}]


def test_get_vms_failure(monkeypatch):
    runner = SimpleNamespace(rc=1, stdout='error')
    monkeypatch.setattr(zc.ansible_runner, 'run', lambda private_data_dir, playbook: runner)
    with pytest.raises(Exception):
        zc.get_vms('p', 'o')

