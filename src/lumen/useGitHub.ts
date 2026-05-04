import { useState, useCallback } from "react";

const STORAGE_KEY = "lumen_github";

export interface GitHubSettings {
  token: string;
  repo: string;
  filePath: string;
  siteUrl: string;
  engineToken: string;
  engineRepo: string;
  engineBranch: string;
}

const DEFAULT: GitHubSettings = {
  token: "",
  repo: "denis22078533-coder/Lumin-platform",
  filePath: "index.html",
  siteUrl: "",
  engineToken: "",
  engineRepo: "",
  engineBranch: "main",
};

function load(): GitHubSettings {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    return s ? { ...DEFAULT, ...JSON.parse(s) } : DEFAULT;
  } catch { return DEFAULT; }
}

export interface FetchResult {
  ok: boolean;
  html: string;
  sha: string;
  filePath: string;
  message?: string;
}

export function useGitHub() {
  const [ghSettings, setGhSettings] = useState<GitHubSettings>(load);

  const saveGhSettings = useCallback((s: GitHubSettings) => {
    setGhSettings(s);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }, []);

  const fetchFromGitHub = useCallback(async (): Promise<FetchResult> => {
    const { token, repo, filePath } = ghSettings;
    const path = (filePath || "index.html").trim().replace(/^\//, "");
    if (!token || !repo) return { ok: false, html: "", sha: "", filePath: path, message: "ÐÐµÑ ÑÐ¾ÐºÐµÐ½Ð° Ð¸Ð»Ð¸ ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ñ" };

    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}?ref=main`;
    try {
      const res = await fetch(apiUrl, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({})) as { message?: string };
        return { ok: false, html: "", sha: "", filePath: path, message: `GitHub HTTP ${res.status}: ${errData.message || "Ð½ÐµÐ¸Ð·Ð²ÐµÑÑÐ½Ð°Ñ Ð¾ÑÐ¸Ð±ÐºÐ°"}` };
      }
      const data = await res.json() as { content: string; sha: string };
      const b64 = data.content.replace(/\s/g, "");
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      const decoded = new TextDecoder("utf-8").decode(bytes);
      return { ok: true, html: decoded, sha: data.sha, filePath: path };
    } catch (e) {
      return { ok: false, html: "", sha: "", filePath: path, message: String(e) };
    }
  }, [ghSettings]);

  const pushToGitHub = useCallback(async (
    html: string,
    sha: string,
    filePath: string
  ): Promise<{ ok: boolean; message: string }> => {
    const { token, repo } = ghSettings;
    if (!token) return { ok: false, message: "ÐÐ²ÐµÐ´Ð¸ÑÐµ GitHub Personal Token Ð² Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ°Ñ" };
    if (!repo) return { ok: false, message: "ÐÐ²ÐµÐ´Ð¸ÑÐµ Ð¿ÑÑÑ Ðº ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ñ" };

    const path = (filePath || "index.html").trim().replace(/^\//, "");
    const apiUrl = `https://api.github.com/repos/${repo}/contents/${path}`;

    let actualSha = sha;
    try {
      const getRes = await fetch(`${apiUrl}?ref=main`, {
        headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
      });
      if (getRes.ok) {
        const data = await getRes.json() as { sha: string };
        actualSha = data.sha;
      }
    } catch (_e) { /* Ð½Ð¾Ð²ÑÐ¹ ÑÐ°Ð¹Ð» */ }

    const utf8Bytes = new TextEncoder().encode(html);
    const b64Chunks: string[] = [];
    const chunkSize = 8192;
    for (let i = 0; i < utf8Bytes.length; i += chunkSize) {
      b64Chunks.push(String.fromCharCode(...utf8Bytes.slice(i, i + chunkSize)));
    }
    const content = btoa(b64Chunks.join(""));

    const doPut = async (shaToUse: string) => {
      const reqBody: Record<string, string> = {
        message: `Lumen: Ð¿ÑÐ°Ð²ÐºÐ¸ Ð² ${path}`,
        content,
        branch: "main",
      };
      if (shaToUse) reqBody.sha = shaToUse;
      const r = await fetch(apiUrl, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(reqBody),
      });
      const d = await r.json().catch(() => ({})) as { message?: string };
      return { status: r.status, ok: r.ok, data: d };
    };

    let result = await doPut(actualSha);

    let attempts = 0;
    while (!result.ok && attempts < 3 && /sha|match|conflict/i.test(result.data.message || "")) {
      attempts++;
      try {
        const refresh = await fetch(`${apiUrl}?ref=main&_=${Date.now()}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "Cache-Control": "no-cache" },
        });
        if (refresh.ok) {
          const fresh = await refresh.json() as { sha: string };
          actualSha = fresh.sha;
          result = await doPut(actualSha);
        } else break;
      } catch (_e) { break; }
    }

    if (result.ok) {
      return { ok: true, message: `Ð¤Ð°Ð¹Ð» ${path} Ð¾Ð±Ð½Ð¾Ð²Ð»ÑÐ½ Ð² GitHub (HTTP ${result.status})` };
    } else {
      return { ok: false, message: result.data.message || `ÐÑÐ¸Ð±ÐºÐ° GitHub: HTTP ${result.status}` };
    }
  }, [ghSettings]);

  const syncEngine = useCallback(async (
    onProgress?: (msg: string) => void
  ): Promise<{ ok: boolean; message: string }> => {
    // ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÐ¼ engine-ÑÐ¿ÐµÑÐ¸ÑÐ¸ÑÐ½ÑÐµ Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ¸, ÐµÑÐ»Ð¸ Ð¾Ð½Ð¸ ÐµÑÑÑ, Ð¸Ð½Ð°ÑÐµ â Ð¾ÑÐ½Ð¾Ð²Ð½ÑÐµ
    const sourceToken = ghSettings.engineToken || ghSettings.token;
    const sourceRepo = ghSettings.engineRepo;
    const branch = ghSettings.engineBranch || 'main';

    if (!sourceToken) return { ok: false, message: 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Engine GitHub Token Ð² Ð½Ð°ÑÑÑÐ¾Ð¹ÐºÐ°Ñ' };
    if (!sourceRepo) return { ok: false, message: 'Ð£ÐºÐ°Ð¶Ð¸ÑÐµ Engine Repository (Ð½Ð°Ð¿ÑÐ¸Ð¼ÐµÑ: user/repo)' };

    const headers = {
      Authorization: `Bearer ${sourceToken}`,
      Accept: 'application/vnd.github+json',
    };

    try {
      // Ð¨Ð°Ð³ 1: ÐÐ¾Ð»ÑÑÐ°ÐµÐ¼ SHA Ð¿Ð¾ÑÐ»ÐµÐ´Ð½ÐµÐ³Ð¾ ÐºÐ¾Ð¼Ð¼Ð¸ÑÐ°
      onProgress?.(`ÐÐ¾Ð»ÑÑÐµÐ½Ð¸Ðµ Ð´Ð°Ð½Ð½ÑÑ Ð²ÐµÑÐºÐ¸ ${branch} Ð¸Ð· ${sourceRepo}...`);
      const refRes = await fetch(`https://api.github.com/repos/${sourceRepo}/git/ref/heads/${branch}`, { headers });
      if (!refRes.ok) throw new Error(`ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ Ð²ÐµÑÐºÐ¸: ${refRes.statusText}`);
      const refData = await refRes.json();
      const commitSha = refData.object.sha;

      // Ð¨Ð°Ð³ 2: ÐÐ¾Ð»ÑÑÐ°ÐµÐ¼ SHA Ð´ÐµÑÐµÐ²Ð° Ð¸Ð· ÐºÐ¾Ð¼Ð¼Ð¸ÑÐ°
      const commitRes = await fetch(`https://api.github.com/repos/${sourceRepo}/git/commits/${commitSha}`, { headers });
      if (!commitRes.ok) throw new Error(`ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ ÐºÐ¾Ð¼Ð¼Ð¸ÑÐ°: ${commitRes.statusText}`);
      const commitData = await commitRes.json();
      const treeSha = commitData.tree.sha;

      // Ð¨Ð°Ð³ 3: ÐÐ¾Ð»ÑÑÐ°ÐµÐ¼ ÑÐµÐºÑÑÑÐ¸Ð²Ð½Ð¾Ðµ Ð´ÐµÑÐµÐ²Ð¾ ÑÐ°Ð¹Ð»Ð¾Ð²
      onProgress?.('ÐÐ¾Ð»ÑÑÐµÐ½Ð¸Ðµ ÑÐ¿Ð¸ÑÐºÐ° ÑÐ°Ð¹Ð»Ð¾Ð² Ð¸Ð· ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ñ-Ð¸ÑÑÐ¾ÑÐ½Ð¸ÐºÐ°...');
      const treeRes = await fetch(`https://api.github.com/repos/${sourceRepo}/git/trees/${treeSha}?recursive=1`, { headers });
      if (!treeRes.ok) throw new Error(`ÐÑÐ¸Ð±ÐºÐ° Ð¿Ð¾Ð»ÑÑÐµÐ½Ð¸Ñ Ð´ÐµÑÐµÐ²Ð° ÑÐ°Ð¹Ð»Ð¾Ð²: ${treeRes.statusText}`);
      const treeData = await treeRes.json();

      const files = treeData.tree.filter((item: any) => 
        item.type === 'blob' &&
        !item.path.startsWith('.git') &&
        !item.path.includes('node_modules')
      );
      
      onProgress?.(`ÐÐ°Ð¹Ð´ÐµÐ½Ð¾ ${files.length} ÑÐ°Ð¹Ð»Ð¾Ð² Ð´Ð»Ñ ÑÐ¸Ð½ÑÑÐ¾Ð½Ð¸Ð·Ð°ÑÐ¸Ð¸.`);
      
      // Ð¨Ð°Ð³ 4: Ð¡ÐºÐ°ÑÐ¸Ð²Ð°ÐµÐ¼ ÐºÐ°Ð¶Ð´ÑÐ¹ ÑÐ°Ð¹Ð» Ð¸ Ð¿ÑÑÐ¸Ð¼ ÐµÐ³Ð¾ Ð² ÑÐµÐ»ÐµÐ²Ð¾Ð¹ ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        onProgress?.(`(${i + 1}/${files.length}) Ð¡Ð¸Ð½ÑÑÐ¾Ð½Ð¸Ð·Ð°ÑÐ¸Ñ ÑÐ°Ð¹Ð»Ð°: ${file.path}...`);
        
        // ÐÐ¾Ð»ÑÑÐ°ÐµÐ¼ ÐºÐ¾Ð½ÑÐµÐ½Ñ ÑÐ°Ð¹Ð»Ð° Ð² base64
        const blobRes = await fetch(`https://api.github.com/repos/${sourceRepo}/git/blobs/${file.sha}`, { headers });
        if (!blobRes.ok) {
          onProgress?.(`ÐÑÐ¾Ð¿ÑÑÐº ÑÐ°Ð¹Ð»Ð° ${file.path}: Ð½Ðµ ÑÐ´Ð°Ð»Ð¾ÑÑ ÑÐºÐ°ÑÐ°ÑÑ (${blobRes.statusText})`);
          continue;
        }
        const blobData = await blobRes.json();
        
        // ÐÐµÐºÐ¾Ð´Ð¸ÑÑÐµÐ¼ ÐºÐ¾Ð½ÑÐµÐ½Ñ Ð¸Ð· base64
        const decodedContent = atob(blobData.content);

        // ÐÑÐ¿Ð¾Ð»ÑÐ·ÑÐµÐ¼ ÑÑÑÐµÑÑÐ²ÑÑÑÑÑ ÑÑÐ½ÐºÑÐ¸Ñ pushToGitHub Ð´Ð»Ñ Ð·Ð°Ð¿Ð¸ÑÐ¸ ÑÐ°Ð¹Ð»Ð° Ð² Ð¾ÑÐ½Ð¾Ð²Ð½Ð¾Ð¹ ÑÐµÐ¿Ð¾Ð·Ð¸ÑÐ¾ÑÐ¸Ð¹
        // ÐÐµÑÐµÐ´Ð°ÐµÐ¼ Ð¿ÑÑÑÐ¾Ð¹ SHA, ÑÐ°Ðº ÐºÐ°Ðº pushToGitHub ÑÐ°Ð¼ Ð¾Ð¿ÑÐµÐ´ÐµÐ»Ð¸Ñ Ð½ÑÐ¶Ð½ÑÐ¹ SHA Ð´Ð»Ñ ÐºÐ¾Ð¼Ð¼Ð¸ÑÐ°
        const pushResult = await pushToGitHub(decodedContent, '', file.path);
        
        if (!pushResult.ok) {
          // ÐÑÐ»Ð¸ Ð²Ð¾Ð·Ð½Ð¸ÐºÐ»Ð° Ð¾ÑÐ¸Ð±ÐºÐ°, Ð¼Ð¾Ð¶Ð½Ð¾ ÐµÐµ Ð¾Ð±ÑÐ°Ð±Ð¾ÑÐ°ÑÑ Ð¸Ð»Ð¸ Ð¿ÑÐµÑÐ²Ð°ÑÑ Ð¿ÑÐ¾ÑÐµÑÑ
          onProgress?.(`ÐÑÐ¸Ð±ÐºÐ° Ð¿ÑÐ¸ Ð·Ð°Ð¿Ð¸ÑÐ¸ ÑÐ°Ð¹Ð»Ð° ${file.path}: ${pushResult.message}`);
          // ÐÐ¾Ð¶Ð½Ð¾ ÑÐ°ÑÐºÐ¾Ð¼Ð¼ÐµÐ½ÑÐ¸ÑÐ¾Ð²Ð°ÑÑ, ÑÑÐ¾Ð±Ñ Ð¾ÑÑÐ°Ð½Ð¾Ð²Ð¸ÑÑ Ð¿ÑÐ¸ Ð¿ÐµÑÐ²Ð¾Ð¹ Ð¾ÑÐ¸Ð±ÐºÐµ
          // throw new Error(`Failed to push file ${file.path}: ${pushResult.message}`);
        }
      }

      const message = `Ð¡Ð¸Ð½ÑÑÐ¾Ð½Ð¸Ð·Ð°ÑÐ¸Ñ ÑÑÐ¿ÐµÑÐ½Ð¾ Ð·Ð°Ð²ÐµÑÑÐµÐ½Ð°. ÐÐ±ÑÐ°Ð±Ð¾ÑÐ°Ð½Ð¾ ${files.length} ÑÐ°Ð¹Ð»Ð¾Ð².`;
      onProgress?.(message);
      return { ok: true, message };

    } catch (e: any) {
      const message = `ÐÑÐ¸Ð±ÐºÐ° ÑÐ¸Ð½ÑÑÐ¾Ð½Ð¸Ð·Ð°ÑÐ¸Ð¸: ${e.message || String(e)}`;
      onProgress?.(message);
      console.error(e);
      return { ok: false, message };
    }
  }, [ghSettings, pushToGitHub]);


  return { ghSettings, saveGhSettings, fetchFromGitHub, pushToGitHub, syncEngine };
}
