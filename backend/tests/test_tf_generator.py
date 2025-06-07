import tf_generator as tg

class DummyTF:
    def __init__(self):
        self.inited = False
        self.applied = False
        self.removed = []
    def init(self):
        self.inited = True
    def apply(self, skip_plan=True, var=None, auto_approve=True):
        self.applied = True
        return 0, 'ok', ''
    def cmd(self, cmd, action, resource):
        self.removed.append(resource)
        return 0, '', ''

def test_run_terraform(monkeypatch):
    dummy = DummyTF()
    monkeypatch.setattr(tg, 'Terraform', lambda working_dir: dummy)
    monkeypatch.setattr(tg, 'remove_state', lambda r: None)
    res = tg.run_terraform({'name': 'vm'})
    assert dummy.inited and dummy.applied
    assert res == 'ok'

