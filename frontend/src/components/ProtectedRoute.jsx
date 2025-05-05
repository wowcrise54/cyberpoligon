import React, { useState, useEffect } from "react";
import { Outlet, Navigate, useLocation } from "react-router-dom";

export function ProtectedRoute() {
  const [status, setStatus] = useState("loading");
  const location = useLocation();

  useEffect(() => {
    const token = sessionStorage.getItem("token");
    if (!token) {
      setStatus("fail");
      return;
    }

    fetch("api/protected", {
      headers: { Authorization: "Bearer " + token },
    })
      .then(res => res.ok ? setStatus("ok") : setStatus("fail"))
      .catch(() => setStatus("fail"));
  }, []);

  if (status === "loading") {
    return null; // или <Spinner />
  }
  if (status === "fail") {
    return <Navigate to="/auth" replace state={{ from: location }} />;
  }
  return <Outlet />;
}
