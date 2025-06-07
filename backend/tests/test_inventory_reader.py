import json
import builtins
from pathlib import Path

import pytest

import utils.inventory_reader as ir


def test_load_inventory(tmp_path, monkeypatch):
    data = {
        'all': {
            'hosts': {
                'host1': {'ansible_host': '1.1.1.1'},
                'host2': {'ansible_host': '2.2.2.2'}
            }
        }
    }
    inv_file = tmp_path / 'inventory.yml'
    inv_file.write_text(json.dumps(data))
    monkeypatch.setattr(ir, 'INV', inv_file)
    pairs = ir.load_inventory()
    assert pairs == {'host1': '1.1.1.1', 'host2': '2.2.2.2'}


def test_alias_by_ip(monkeypatch):
    monkeypatch.setattr(ir, 'load_inventory', lambda: {'a': '10.0.0.1'})
    assert ir.alias_by_ip('10.0.0.1') == 'a'
    assert ir.alias_by_ip('1.1.1.1') is None
