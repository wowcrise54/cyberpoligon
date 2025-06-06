// ScriptsTable.jsx
import React, {useState, useEffect} from 'react';
import {Icon, Table, withTableActions, Spin} from '@gravity-ui/uikit';
import {toaster} from '@gravity-ui/uikit/toaster-singleton';
import {TrashBin, ArrowDownToLine} from '@gravity-ui/icons';
import ScriptInfo from './ScriptInfo';
import DynamicModal from './DynamicModal';

const MyTable = withTableActions(Table);

// Универсальная функция для приведения output к строке
function formatOutput(output) {
  if (typeof output === 'string') return output;
  if (Array.isArray(output))          return output.join('\n');
  if (output && typeof output === 'object') {
    try { return JSON.stringify(output, null, 2); }
    catch { return String(output); }
  }
  return String(output);
}

export default function ScriptsTable({osType, vmId}) {
  const [data, setData]               = useState([]);
  const [loading, setLoading]         = useState(true);
  const [selectedIds, setSelectedIds] = useState([]);

  // для Info‑модалки
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [selectedScript, setSelectedScript]   = useState(null);

  // для Install‑модалки
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [installModalVars,    setInstallModalVars]  = useState([]);
  const [installModalParams,  setInstallModalParams] = useState({});
  const [scriptForInstall,    setScriptForInstall]   = useState(null);

  // фильтр тег→ОС
  const tagToOs = {
    deb:     ['debian','ubuntu','kali','astra'],
    rpm:     ['centos','redhat','oracle'],
    dnf:     ['fedora'],
    windows: ['windows'],
  };
  const isAllowed = (tag) => {
    if (!osType) return true;
    return (tagToOs[tag] || [])
      .some(substr => osType.toLowerCase().includes(substr));
  };

  // --- Загрузка списка скриптов ---
  useEffect(() => {
    setLoading(true);
    fetch('/api/scripts')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(scripts => {
        const rows = scripts
          .filter(s => isAllowed(s.tag))
          .map(s => ({
            id:          s.id,
            'Название':  s.name,
            'Тег':       s.tag || '—',
            'Приложение':
              typeof s.app === 'string'
                ? s.app
                : s.app?.name || '—',
            'Состояние': '-',
            'Статус':    'Не установлен',
            _raw:        s,            // только для модалки
            isLoading:   false,        // флаг, чтобы показать <Spin/>
          }));
        setData(rows);
      })
      .catch(err => {
        toaster.add({
          title:   'Ошибка загрузки',
          content: err.message,
          theme:   'danger',
        });
      })
      .finally(() => setLoading(false));
  }, [osType]);

  // клик по строке → инфо‑модалка
  const handleRowClick = (item) => {
    setSelectedScript(item._raw);
    setIsInfoModalOpen(true);
  };

  // удалить из таблицы
  const handleDelete = (item) => {
    setData(prev =>
      prev.map(r =>
        r.id === item.id
          ? {
              ...r,
              'Состояние': '-',
              'Статус':    'Отсутствует',
              isLoading:   false,
            }
          : r
      )
    );
    toaster.add({
      title:   item['Название'],
      content: 'Скрипт удалён',
      theme:   'danger',
    });
  };

  // начать установку — получить survey_vars и открыть форму
  const handleRunClick = async (item) => {
    setScriptForInstall(item);
    try {
      const res = await fetch(`/api/scripts/${item._raw.id}/survey_vars`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const defs = await res.json();
      setInstallModalVars(defs);

      const init = {};
      defs.forEach(v => {
        init[v.name] = (v.values?.length > 0 ? v.values[0] : '');
      });
      setInstallModalParams(init);
      setIsInstallModalOpen(true);
    } catch (err) {
      toaster.add({
        title:   'Ошибка параметров',
        content: err.message,
        theme:   'danger',
      });
    }
  };

  // отправить запуск + polling
  const handleModalSubmit = async () => {
    setIsInstallModalOpen(false);
    const item = scriptForInstall;

    // включаем спиннер
    setData(prev =>
      prev.map(r =>
        r.id === item.id ? {...r, isLoading: true} : r
      )
    );

    try {
      const createRes = await fetch('/api/run_playbook', {
        method:  'POST',
        headers: {'Content-Type': 'application/json'},
        body:    JSON.stringify({
          template_name: item['Название'],
          vm_id:         vmId,
          variables:     installModalParams,
        }),
      });
      if (!createRes.ok) {
        const errJson = await createRes.json().catch(() => ({}));
        throw new Error(errJson.detail || `HTTP ${createRes.status}`);
      }
      const {task_id} = await createRes.json();
      toaster.add({
        title:   item['Название'],
        content: `Задача ${task_id} запущена`,
        theme:   'success',
      });

      const timer = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/run_playbook/status?task_id=${task_id}`
          );
          if (!statusRes.ok) throw new Error(`HTTP ${statusRes.status}`);
          const {status, output} = await statusRes.json();

          if (['running','pending','waiting'].includes(status)) {
            return;
          }
          clearInterval(timer);

          const text = formatOutput(output) || '-';
          if (status === 'success') {
            setData(prev =>
              prev.map(r =>
                r.id === item.id
                  ? {
                      ...r,
                      isLoading:   false,
                      'Состояние': 'Выполнен',
                      'Статус':    'Установлен',
                    }
                  : r
              )
            );
            toaster.add({
              title:   item['Название'],
              content: 'Успешно установлен',
              theme:   'success',
            });
          } else {
            setData(prev =>
              prev.map(r =>
                r.id === item.id
                  ? {
                      ...r,
                      isLoading:   false,
                      'Состояние': `Ошибка: ${text}`,
                      'Статус':    'Не установлен',
                    }
                  : r
              )
            );
            toaster.add({
              title:   item['Название'],
              content: `Ошибка установки: ${text}`,
              theme:   'danger',
            });
          }
        } catch (pollErr) {
          clearInterval(timer);
          setData(prev =>
            prev.map(r =>
              r.id === item.id
                ? {
                    ...r,
                    isLoading:   false,
                    'Состояние': `Polling error: ${pollErr.message}`,
                    'Статус':    'Не установлен',
                  }
                : r
            )
          );
          toaster.add({
            title:   item['Название'],
            content: `Polling error: ${pollErr.message}`,
            theme:   'danger',
          });
        }
      }, 3000);
    } catch (runErr) {
      setData(prev =>
        prev.map(r =>
          r.id === item.id
            ? {
                ...r,
                isLoading:   false,
                'Состояние': `Запуск error: ${runErr.message}`,
                'Статус':    'Не установлен',
              }
            : r
        )
      );
      toaster.add({
        title:   item['Название'],
        content: `Запуск error: ${runErr.message}`,
        theme:   'danger',
      });
    }
  };

  const getRowActions = (item) => [
    {
      text:    'Установить',
      icon:    <Icon data={ArrowDownToLine} size={16}/>,
      handler: () => handleRunClick(item),
    },
    {
      text:    'Удалить',
      icon:    <Icon data={TrashBin} size={16}/>,
      handler: () => handleDelete(item),
      theme:   'danger',
    },
  ];

  if (loading) {
    return <Spin size="l"/>;
  }

  // финальный набор колонок
  const columns = [
    { id: 'id',          title: '#',                align: 'center' },
    { id: 'Название',    title: 'Название скрипта' },
    { id: 'Тег',         title: 'Тег' },
    { id: 'Приложение',  title: 'Приложение' },
    {
      id:       'Состояние',
      title:    'Состояние',
      align:    'center',
      // здесь именно (row), а не ({row})
      template: (row) =>
        row.isLoading
          ? <Spin size="xs" view="normal"/>
          : row['Состояние'],
    },
    { id: 'Статус',      title: 'Статус' },
  ];

  return (
    <>
      <MyTable
        data={data}
        columns={columns}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
        getRowActions={getRowActions}
        rowActionsSize="l"
        onRowClick={handleRowClick}
      />

      <ScriptInfo
        open={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        script={selectedScript}
      />

      <DynamicModal
        open={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        vars={installModalVars}
        params={installModalParams}
        onChange={setInstallModalParams}
        onSubmit={handleModalSubmit}
      />
    </>
  );
}