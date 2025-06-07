import json
import f


def test_format_vms(tmp_path):
    raw = {'ovirt_vms':[{'id':1,'name':'n','os':{'type':'linux'},'cpu':{'topology':{'cores':2}},'memory':1073741824,'status':'up'}]}
    in_file = tmp_path / 'vms_raw.json'
    out_file = tmp_path / 'out.json'
    in_file.write_text(json.dumps(raw))
    res = f.format_vms(str(in_file), str(out_file))
    assert res[0]['name'] == 'n'
    assert out_file.exists()

