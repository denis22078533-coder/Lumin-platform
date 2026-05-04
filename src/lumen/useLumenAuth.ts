import { useState, useCallback } from "react";

const LOGIN_KEY = "lumen_auth";
const ADMIN_KEY = "lumen_admin";
const LOGIN_PASSWORD = "Lumen2024";
const ADMIN_PASSWORD = "Admin2026";

function isLoggedIn(): boolean {
  try { return localStorage.getItem(LOGIN_KEY) === "1"; } catch { return false; }
}

function isAdmin(): boolean {
  try { return localStorage.getItem(ADMIN_KEY) === "1"; } catch { return false; }
}

export function useLumenAuth() {
  const [loggedIn, setLoggedIn] = useState<boolean>(isLoggedIn);
  const [authed, setAuthed] = useState<boolean>(isAdmin);

  // ÐÑÐ¾Ð´ Ð² Ð¿ÑÐ¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ (Lumen2024)
  const login = useCallback((password: string): boolean => {
    if (password === LOGIN_PASSWORD) {
      localStorage.setItem(LOGIN_KEY, "1");
      setLoggedIn(true);
      return true;
    }
    return false;
  }, []);

  // ÐÑÐ¾Ð´ Ð² ÑÐµÐ¶Ð¸Ð¼ Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÐ° (Admin2026)
  const adminLogin = useCallback((password: string): boolean => {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem(ADMIN_KEY, "1");
      setAuthed(true);
      return true;
    }
    return false;
  }, []);

  // ÐÑÑÐ¾Ð´ Ð¸Ð· ÑÐµÐ¶Ð¸Ð¼Ð° Ð°Ð´Ð¼Ð¸Ð½Ð¸ÑÑÑÐ°ÑÐ¾ÑÐ°
  const logout = useCallback(() => {
    localStorage.removeItem(ADMIN_KEY);
    setAuthed(false);
  }, []);

  return { loggedIn, authed, login, adminLogin, logout };
}
