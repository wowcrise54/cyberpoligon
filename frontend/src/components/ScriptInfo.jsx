import React, { useEffect, useState } from "react";
import { Modal, Text, Loader } from "@gravity-ui/uikit";
import './User.css';

const ScriptInfo = ({ open, onClose, script }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Триггерим загрузку только при открытии модалки и наличии скрипта
    if (!open || !script?.id) {
      return;
    }
    setLoading(true);
    fetch("/api/scripts")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(scripts => {
        const found = scripts.find(s => s.id === script.id);
        setDetails(found || null);
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [open, script?.id]);

  return (
    <Modal open={open} onClose={onClose}>
      {script ? (
        <div className="scriptinfo">
          <div className="script-title">
            <Text variant="header-2">Описание скрипта "{details?.name || script.name}"</Text>
          </div>

          <div className="script-description">
            {loading ? (
              <Text variant="body-2">Загрузка...</Text>
            ) : (
              <Text variant="body-2">
                {details?.description || 'Описание отсутствует.'}
              </Text>
            )}
          </div>

        </div>
      ) : (
        <div style={{ padding: "16px" }}>
          <Text variant="header-2">Нет данных</Text>
        </div>
      )}
    </Modal>
  );
};

export default ScriptInfo;