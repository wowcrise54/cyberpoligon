from semaphore_api import create_task
from types import SimpleNamespace
import pytest

class DummyResponse:
    def __init__(self, data):
        self._data = data
        self.status_code = 200
    def json(self):
        return self._data
    def raise_for_status(self):
        pass

def test_get_inventory(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse({'inv': 1}))
    assert create_task.get_inventory() == {'inv': 1}

def test_get_environment(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse({'env': 1}))
    assert create_task.get_environment() == {'env': 1}

def test_get_repositories(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse({'repos': 1}))
    assert create_task.get_repositories() == {'repos': 1}

def test_get_template(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse({'id': 5}))
    assert create_task.get_template(5) == {'id': 5}

def test_create_task(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'post', lambda url, headers=None, json=None: DummyResponse({'id': 3}))
    assert create_task.create_task({'a': 1}) == {'id': 3}

def test_get_task_output(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse({'out': 'x'}))
    assert create_task.get_task_output(1) == {'out': 'x'}

def test_get_templates(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse([{'name':'n','id':2}]))
    assert create_task.get_templates() == [{'name':'n','id':2}]

def test_find_template_id_by_name(monkeypatch):
    monkeypatch.setattr(create_task, 'get_templates', lambda: [{'name':'t','id':9}])
    assert create_task.find_template_id_by_name('t') == 9
    assert create_task.find_template_id_by_name('x') is None

def test_extract_id():
    assert create_task.extract_id({'id':5}) == 5
    assert create_task.extract_id([{'id':7}]) == 7
    assert create_task.extract_id([], default=2) == 2

def test_run_playbook_by_name(monkeypatch):
    monkeypatch.setattr(create_task, 'find_template_id_by_name', lambda n: 1)
    monkeypatch.setattr(create_task, 'get_inventory', lambda: {'id':2})
    monkeypatch.setattr(create_task, 'get_environment', lambda: {'id':3})
    monkeypatch.setattr(create_task, 'get_repositories', lambda: [{'id':4}])
    monkeypatch.setattr(create_task, 'create_task', lambda payload: {'id':10})
    monkeypatch.setattr(create_task, 'get_task_output', lambda tid: {'o':1})
    monkeypatch.setattr(create_task.time, 'sleep', lambda s: None)
    result = create_task.run_playbook_by_name('tpl')
    assert result == {'task_id':10, 'output': {'o':1}}

def test_get_task_status(monkeypatch):
    monkeypatch.setattr(create_task.requests, 'get', lambda url, headers=None: DummyResponse({'status':'ok'}))

    assert create_task.get_task_status(1) == {'status':'ok'}

