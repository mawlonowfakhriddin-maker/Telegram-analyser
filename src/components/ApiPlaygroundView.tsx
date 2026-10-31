import React, { useState } from 'react';
import {
  Terminal,
  Play,
  Copy,
  Check,
  Code,
  FileCode,
  Send,
  Layers,
  AlertTriangle,
  Info,
  Server,
} from 'lucide-react';
import { Lang, i18n } from '../utils/translations';

interface ApiPlaygroundViewProps {
  lang: Lang;
  apiKey: string;
}

export const ApiPlaygroundView: React.FC<ApiPlaygroundViewProps> = ({
  lang,
  apiKey,
}) => {
  const t = i18n[lang];
  const [selectedEndpoint, setSelectedEndpoint] = useState<
    '/lookup/email' | '/lookup/username' | '/lookup/modules' | '/account/ip'
  >('/lookup/email');
  const [codeLang, setCodeLang] = useState<'curl' | 'python' | 'javascript' | 'nodejs' | 'go'>('curl');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [responseOutput, setResponseOutput] = useState<any>(null);
  const [statusCode, setStatusCode] = useState<number | null>(null);

  // Request parameters state
  const [targetEmail, setTargetEmail] = useState<string>('target.intel@gmail.com');
  const [targetUsername, setTargetUsername] = useState<string>('shadow_agent');
  const [timeoutMs, setTimeoutMs] = useState<number>(15000);
  const [includeBreaches, setIncludeBreaches] = useState<boolean>(true);
  const [includeStealers, setIncludeStealers] = useState<boolean>(true);
  const [includeAi, setIncludeAi] = useState<boolean>(true);

  const displayKey = apiKey || 'YOUR_API_KEY';

  // Generate code snippets
  const getSnippet = () => {
    switch (codeLang) {
      case 'curl':
        if (selectedEndpoint === '/lookup/email') {
          return `curl -X POST https://api.intelbase.is/lookup/email \\
  -H "x-api-key: ${displayKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "email": "${targetEmail}",
    "timeout_ms": ${timeoutMs},
    "include_data_breaches": ${includeBreaches},
    "include_stealer_logs": ${includeStealers},
    "include_ai": ${includeAi}
  }'`;
        }
        if (selectedEndpoint === '/lookup/username') {
          return `curl -X POST https://api.intelbase.is/lookup/username \\
  -H "x-api-key: ${displayKey}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "username": "${targetUsername}",
    "timeout_ms": ${timeoutMs},
    "include_ai": ${includeAi}
  }'`;
        }
        if (selectedEndpoint === '/lookup/modules') {
          return `curl -X GET https://api.intelbase.is/lookup/modules \\
  -H "x-api-key: ${displayKey}"`;
        }
        return `curl -X GET https://api.intelbase.is/account/ip`;

      case 'python':
        if (selectedEndpoint === '/lookup/email') {
          return `import requests

url = "https://api.intelbase.is/lookup/email"
headers = {
    "x-api-key": "${displayKey}",
    "Content-Type": "application/json"
}
payload = {
    "email": "${targetEmail}",
    "timeout_ms": ${timeoutMs},
    "include_data_breaches": ${includeBreaches ? 'True' : 'False'},
    "include_stealer_logs": ${includeStealers ? 'True' : 'False'},
    "include_ai": ${includeAi ? 'True' : 'False'}
}

response = requests.post(url, json=payload, headers=headers, timeout=30)
print(response.status_code)
print(response.json())`;
        }
        if (selectedEndpoint === '/lookup/username') {
          return `import requests

url = "https://api.intelbase.is/lookup/username"
headers = {
    "x-api-key": "${displayKey}",
    "Content-Type": "application/json"
}
payload = {
    "username": "${targetUsername}",
    "timeout_ms": ${timeoutMs},
    "include_ai": ${includeAi ? 'True' : 'False'}
}

response = requests.post(url, json=payload, headers=headers, timeout=30)
print(response.json())`;
        }
        return `import requests
response = requests.get("https://api.intelbase.is${selectedEndpoint}", headers={"x-api-key": "${displayKey}"})
print(response.json())`;

      case 'javascript':
        return `const response = await fetch("https://api.intelbase.is${selectedEndpoint}", {
  method: "${selectedEndpoint.startsWith('/lookup/') && selectedEndpoint !== '/lookup/modules' ? 'POST' : 'GET'}",
  headers: {
    "x-api-key": "${displayKey}",
    "Content-Type": "application/json"
  }${
    selectedEndpoint === '/lookup/email'
      ? `,\n  body: JSON.stringify({ email: "${targetEmail}", include_data_breaches: true, include_ai: true })`
      : selectedEndpoint === '/lookup/username'
      ? `,\n  body: JSON.stringify({ username: "${targetUsername}", include_ai: true })`
      : ''
  }
});
const data = await response.json();
console.log(data);`;

      case 'nodejs':
        return `const axios = require('axios');

async function queryIntelBase() {
  const res = await axios({
    method: '${selectedEndpoint.startsWith('/lookup/') && selectedEndpoint !== '/lookup/modules' ? 'post' : 'get'}',
    url: 'https://api.intelbase.is${selectedEndpoint}',
    headers: {
      'x-api-key': '${displayKey}',
      'Content-Type': 'application/json'
    }${
      selectedEndpoint === '/lookup/email'
        ? `,\n    data: { email: '${targetEmail}', include_data_breaches: true }`
        : ''
    }
  });
  console.log(res.data);
}
queryIntelBase();`;

      case 'go':
        return `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
)

func main() {
    url := "https://api.intelbase.is${selectedEndpoint}"
    req, _ := http.NewRequest("${selectedEndpoint.startsWith('/lookup/') && selectedEndpoint !== '/lookup/modules' ? 'POST' : 'GET'}", url, nil)
    req.Header.Add("x-api-key", "${displayKey}")
    req.Header.Add("Content-Type", "application/json")

    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        panic(err)
    }
    defer resp.Body.Close()
    body, _ := io.ReadAll(resp.Body)
    fmt.Println(string(body))
}`;
      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(getSnippet());
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setResponseOutput(null);
    setStatusCode(null);

    try {
      if (selectedEndpoint === '/account/ip') {
        const res = await fetch('/api/intelbase/ip');
        const data = await res.json();
        setStatusCode(res.status);
        setResponseOutput(data);
      } else if (selectedEndpoint === '/lookup/modules') {
        const res = await fetch('/api/intelbase/modules', {
          headers: { 'x-api-key': apiKey },
        });
        const data = await res.json();
        setStatusCode(res.status);
        setResponseOutput(data);
      } else if (selectedEndpoint === '/lookup/email') {
        const res = await fetch('/api/intelbase/email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            email: targetEmail,
            timeout_ms: timeoutMs,
            include_data_breaches: includeBreaches,
            include_stealer_logs: includeStealers,
            include_ai: includeAi,
          }),
        });
        const data = await res.json();
        setStatusCode(res.status);
        setResponseOutput(data);
      } else if (selectedEndpoint === '/lookup/username') {
        const res = await fetch('/api/intelbase/username', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
          },
          body: JSON.stringify({
            username: targetUsername,
            timeout_ms: timeoutMs,
            include_ai: includeAi,
          }),
        });
        const data = await res.json();
        setStatusCode(res.status);
        setResponseOutput(data);
      }
    } catch (err: any) {
      setStatusCode(500);
      setResponseOutput({ error: err.message });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight text-white flex items-center space-x-2">
              <Terminal className="w-6 h-6 text-blue-400" />
              <span>{t.tabApiDocs}</span>
            </h2>
            <p className="text-xs text-slate-400">
              {lang === 'uz'
                ? "https://api.intelbase.is serveriga to'g'ridan-to'g'ri so'rovlar yuborish, kod namunalarini ko'rish va hujjatlarni o'rganish."
                : 'Interactive API sandbox, code generators and documentation for api.intelbase.is.'}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono">
            <span className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-cyan-400">
              Base URL: https://api.intelbase.is
            </span>
          </div>
        </div>

        {/* Endpoints Selector Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedEndpoint('/lookup/email')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedEndpoint === '/lookup/email'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            POST /lookup/email
          </button>
          <button
            onClick={() => setSelectedEndpoint('/lookup/username')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedEndpoint === '/lookup/username'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            POST /lookup/username
          </button>
          <button
            onClick={() => setSelectedEndpoint('/lookup/modules')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedEndpoint === '/lookup/modules'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            GET /lookup/modules
          </button>
          <button
            onClick={() => setSelectedEndpoint('/account/ip')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
              selectedEndpoint === '/account/ip'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
            }`}
          >
            GET /account/ip (Public)
          </button>
        </div>
      </div>

      {/* Main Grid: Parameters & Code on Left, Live Output on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Request Builder & Code Generator */}
        <div className="space-y-4">
          {/* Parameter Form */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Soʻrov Parametrlari (Request Parameters)
            </h3>

            {selectedEndpoint === '/lookup/email' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">email (string, required)</label>
                  <input
                    type="email"
                    value={targetEmail}
                    onChange={(e) => setTargetEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">timeout_ms (100–120000)</label>
                    <input
                      type="number"
                      value={timeoutMs}
                      onChange={(e) => setTimeoutMs(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5 pt-1">
                    <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeBreaches}
                        onChange={(e) => setIncludeBreaches(e.target.checked)}
                        className="rounded bg-slate-950 text-blue-600"
                      />
                      <span>include_data_breaches</span>
                    </label>
                    <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAi}
                        onChange={(e) => setIncludeAi(e.target.checked)}
                        className="rounded bg-slate-950 text-blue-600"
                      />
                      <span>include_ai</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedEndpoint === '/lookup/username' && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1 font-mono">username (string, required)</label>
                  <input
                    type="text"
                    value={targetUsername}
                    onChange={(e) => setTargetUsername(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-mono">timeout_ms</label>
                    <input
                      type="number"
                      value={timeoutMs}
                      onChange={(e) => setTimeoutMs(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-100 font-mono"
                    />
                  </div>
                  <div className="pt-4">
                    <label className="flex items-center space-x-2 text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeAi}
                        onChange={(e) => setIncludeAi(e.target.checked)}
                        className="rounded bg-slate-950 text-blue-600"
                      />
                      <span>include_ai (identity)</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {selectedEndpoint === '/lookup/modules' && (
              <p className="text-xs text-slate-400">
                GET /lookup/modules talab qiladi x-api-key sarlavhasi. Hech qanday soʻrov tanasi (body) talab qilinmaydi va kvotangizdan joy kamaytirmaydi.
              </p>
            )}

            {selectedEndpoint === '/account/ip' && (
              <p className="text-xs text-slate-400">
                GET /account/ip ommaviy yordamchi boʻlib, sizning serveringiz/qurilmangiz qaysi egress IP dan chiqayotganini qaytaradi. Hech qanday kalit talab qilinmaydi.
              </p>
            )}

            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="w-full mt-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center space-x-2 shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50"
            >
              {isExecuting ? (
                <span>Yuborilmoqda...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Soʻrovni Yuborish (Send Request)</span>
                </>
              )}
            </button>
          </div>

          {/* Code Snippets Panel */}
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-bold text-slate-200">Kod Namunalari (Code Snippet)</h4>
              </div>

              <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                {(['curl', 'python', 'javascript', 'nodejs', 'go'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setCodeLang(l)}
                    className={`px-2 py-0.5 rounded uppercase ${
                      codeLang === l ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="relative">
              <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
                {getSnippet()}
              </pre>
              <button
                onClick={handleCopyCode}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs flex items-center space-x-1"
                title="Copy code"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Live Output & API Reference */}
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-3 flex flex-col h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h4 className="text-xs font-bold text-slate-200">API Javobi (Server Response)</h4>
              </div>
              {statusCode !== null && (
                <span
                  className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${
                    statusCode >= 200 && statusCode < 300
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                  }`}
                >
                  HTTP {statusCode}
                </span>
              )}
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto flex-1 min-h-[250px] max-h-[420px]">
              {responseOutput ? (
                <pre>{JSON.stringify(responseOutput, null, 2)}</pre>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-600 text-center py-12">
                  <span>Soʻrov yuborilgandan soʻng natija shu yerda JSON formatida chiqadi.</span>
                </div>
              )}
            </div>
          </div>

          {/* IntelBase Rate Limits & Error Codes Reference Box */}
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-2.5">
            <h5 className="font-semibold text-slate-200 flex items-center space-x-1.5">
              <Info className="w-4 h-4 text-cyan-400" />
              <span>IntelBase API Cheklovlari & Xatolik Kodlari (HTTP Codes)</span>
            </h5>
            <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-white block">200 OK</strong>
                <span>Muvaffaqiyatli razvedka</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-amber-400 block">400 Bad Request</strong>
                <span>Notoʻgʻri JSON yoki parametrlar</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-rose-400 block">401 Unauthorized</strong>
                <span>Kalit xato / IP Whitelist kiritilmagan</span>
              </div>
              <div className="bg-slate-950 p-2 rounded border border-slate-800">
                <strong className="text-purple-400 block">429 Rate Limited</strong>
                <span>Minutlik limitdan oshib ketildi</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
