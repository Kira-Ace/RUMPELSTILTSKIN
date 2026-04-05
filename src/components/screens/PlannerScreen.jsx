import { useState, useRef, useCallback, useEffect } from "react";
import {
  Upload, FileText, X, Send, RotateCcw, CheckCircle2,
  AlertCircle, ChevronDown, ChevronUp, Edit3, Trash2,
  BookOpen, Calendar, Hash, ArrowRight,
  Loader2, Plus, Clock, Check, BookMarked
} from "lucide-react";
import TopBar from "../common/TopBar.jsx";
import wheelIcon from "../assets/wheelwithout.png";
import { callGeminiWithFiles } from "../../utils/geminiApi.js";
import TimeBlockSchedule from "./TimeBlockSchedule.jsx";

/* ── STYLES ─────────────────────────────────────────────── */
const S = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Noto+Serif:wght@400;600;700&family=Work+Sans:wght@400;500;600;700&display=swap');

    .planner-wrap * { box-sizing: border-box; }
    .planner-wrap { padding: 12px 14px 60px; }

    :root {
      --bg:       #fff8f5;
      --bg-low:   #fff1e9;
      --bg-dim:   #ffeadd;
      --surface:  #ffdbc8;
      --surf-hi:  #ffe3d1;
      --orange:   #994700;
      --orange-m: #f47b20;
      --yellow:   #fdcf49;
      --yel-d:    #755b00;
      --brown:    #28180c;
      --brown-m:  #574237;
      --outline:  #8b7265;
      --outline-v:#dec1b1;
      --green:    #2d6a4f;
      --green-bg: #d8f3dc;
      --red:      #ba1a1a;
      --red-bg:   #ffdad6;
    }

    /* spacing */
    .planner-wrap > div:first-child { margin-bottom:16px; }

    /* step indicator */
    .steps { display:flex; align-items:center; justify-content:center; gap:0; margin-bottom:16px; width:100%; }
    .step-item { display:flex; align-items:center; gap:5px; }
    .step-dot { width:22px; height:22px; border-radius:50%; border:2px solid rgba(40,24,12,.15); display:flex; align-items:center; justify-content:center; font-family:'Work Sans',sans-serif; font-size:9px; font-weight:700; color:var(--outline); transition:all .3s; flex-shrink:0; }
    .step-dot.active { border-color:var(--orange-m); background:var(--orange-m); color:white; }
    .step-dot.done   { border-color:var(--yellow); background:var(--yellow); color:var(--brown); }
    .step-label { font-family:'Work Sans',sans-serif; font-size:9px; font-weight:600; letter-spacing:.4px; text-transform:uppercase; color:var(--outline); transition:color .3s; }
    .step-label.active { color:var(--brown); }
    .step-label.done   { color:var(--yellow); }
    .step-line { flex:1; height:1px; background:rgba(40,24,12,.1); margin:0 8px; flex-shrink:1; }

    /* cards */
    .card { background:var(--bg); border-radius:14px; padding:14px; margin-bottom:10px; }
    .card-title { font-family:'Newsreader',serif; font-style:italic; font-size:16px; font-weight:700; color:var(--brown); margin-bottom:3px; }
    .card-sub { font-family:'Work Sans',sans-serif; font-size:10px; color:var(--outline); margin-bottom:10px; }

    /* drop zone */
    .dropzone {
      border:2px dashed var(--outline-v); border-radius:12px; padding:18px 14px;
      display:flex; flex-direction:column; align-items:center; justify-content:center; gap:6px;
      cursor:pointer; transition:border-color .2s, background .2s;
      background:var(--bg-low);
    }
    .dropzone:hover, .dropzone.drag { border-color:var(--orange-m); background:var(--bg-dim); }
    .dropzone-icon { width:36px; height:36px; background:var(--bg-dim); border-radius:9px; display:flex; align-items:center; justify-content:center; color:var(--orange-m); }
    .dropzone-text { font-family:'Work Sans',sans-serif; font-size:12px; font-weight:600; color:var(--brown-m); }
    .dropzone-hint { font-family:'Work Sans',sans-serif; font-size:9px; color:var(--outline); }
    /* file list */
    .file-list { display:flex; flex-direction:column; gap:5px; margin-top:8px; }
    .file-row { background:var(--bg-low); border-radius:9px; padding:7px 9px; display:flex; align-items:center; gap:7px; }
    .file-icon { width:26px; height:26px; border-radius:6px; background:var(--bg-dim); display:flex; align-items:center; justify-content:center; color:var(--orange); flex-shrink:0; }
    .file-name { font-family:'Work Sans',sans-serif; font-size:11px; font-weight:600; color:var(--brown); flex:1; min-width:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .file-size { font-family:'Work Sans',sans-serif; font-size:9px; color:var(--outline); flex-shrink:0; }
    .file-remove { width:20px; height:20px; border-radius:50%; border:none; background:transparent; cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--outline); transition:background .15s,color .15s; flex-shrink:0; }
    .file-remove:hover { background:var(--red-bg); color:var(--red); }

    /* textarea */
    .prompt-area { width:100%; border:1.5px solid var(--outline-v); border-radius:10px; padding:10px 12px; font-size:12px; font-family:'Noto Serif',serif; color:var(--brown); background:var(--bg-low); outline:none; resize:vertical; min-height:80px; line-height:1.4; transition:border-color .2s; }
    .prompt-area:focus { border-color:var(--orange-m); }
    .prompt-area::placeholder { color:var(--outline); }
    .prompt-hint { font-family:'Work Sans',sans-serif; font-size:9px; color:var(--outline); margin-top:5px; line-height:1.4; }

    /* buttons */
    .btn { display:inline-flex; align-items:center; justify-content:center; gap:5px; padding:9px 16px; border-radius:9px; font-family:'Work Sans',sans-serif; font-size:12px; font-weight:700; cursor:pointer; border:none; transition:transform .15s,opacity .15s,box-shadow .15s; }
    .btn:hover { transform:scale(1.02); }
    .btn:active { transform:scale(.97); }
    .btn:disabled { opacity:.5; cursor:not-allowed; transform:none; }
    .btn-primary { background:var(--orange); color:white; box-shadow:0 2px 8px rgba(153,71,0,.2); }
    .btn-primary:hover:not(:disabled) { box-shadow:0 3px 12px rgba(153,71,0,.3); }
    .btn-yellow { background:var(--yellow); color:var(--brown); }
    .btn-ghost  { background:var(--bg-low); color:var(--brown-m); }
    .btn-danger { background:var(--red-bg); color:var(--red); }
    .btn-green  { background:var(--green-bg); color:var(--green); }
    .btn-full   { width:100%; }

    /* loading */
    .loading-card { background:var(--bg); border-radius:14px; padding:24px 14px; display:flex; flex-direction:column; align-items:center; gap:10px; text-align:center; }
    .spin { animation:spin 1s linear infinite; }
    @keyframes spin { to { transform:rotate(360deg); } }
    .loading-title { font-family:'Newsreader',serif; font-style:italic; font-size:16px; font-weight:700; color:var(--brown); }
    .loading-sub   { font-family:'Work Sans',sans-serif; font-size:11px; color:var(--outline); }
    .loading-dots  { display:flex; gap:3px; }
    .loading-dot   { width:4px; height:4px; border-radius:50%; background:var(--orange-m); animation:bounce .8s ease-in-out infinite; }
    .loading-dot:nth-child(2) { animation-delay:.12s; }
    .loading-dot:nth-child(3) { animation-delay:.24s; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-5px)} }

    /* review */
    .review-meta { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px; }
    .meta-badge { display:flex; align-items:center; gap:4px; background:var(--bg-low); border-radius:16px; padding:4px 9px; font-family:'Work Sans',sans-serif; font-size:10px; font-weight:700; color:var(--brown-m); }
    .meta-badge svg { color:var(--orange-m); }
    .topic-list { display:flex; flex-direction:column; gap:6px; }
    .topic-card { background:var(--bg-low); border-radius:11px; padding:10px 12px; position:relative; border:1.5px solid transparent; transition:border-color .2s; }
    .topic-card.removed { opacity:.38; }
    .topic-card.editing { border-color:var(--orange-m); }
    .topic-header { display:flex; align-items:flex-start; justify-content:space-between; gap:8px; }
    .topic-tag { font-family:'Work Sans',sans-serif; font-size:8px; font-weight:700; letter-spacing:.5px; text-transform:uppercase; padding:2px 6px; border-radius:16px; background:rgba(153,71,0,.1); color:var(--orange); margin-bottom:3px; display:inline-block; }
    .topic-title { font-family:'Newsreader',serif; font-size:13px; font-weight:700; color:var(--brown); }
    .topic-desc  { font-family:'Noto Serif',serif; font-size:10px; color:var(--brown-m); line-height:1.4; margin-top:2px; }
    .topic-hours { font-family:'Work Sans',sans-serif; font-size:9px; color:var(--outline); margin-top:3px; display:flex; align-items:center; gap:2px; }
    .topic-actions { display:flex; gap:4px; flex-shrink:0; }
    .icon-btn { width:24px; height:24px; border-radius:6px; border:none; background:var(--bg-dim); cursor:pointer; display:flex; align-items:center; justify-content:center; color:var(--outline); transition:background .15s,color .15s; }
    .icon-btn:hover { background:var(--surface); color:var(--brown); }
    .icon-btn.danger:hover { background:var(--red-bg); color:var(--red); }
    .edit-inline { width:100%; border:1.5px solid var(--orange-m); border-radius:8px; padding:6px 8px; font-size:11px; font-family:'Noto Serif',serif; color:var(--brown); background:white; outline:none; margin-top:4px; }

    /* format selector */
    .format-grid { display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:3px; }
    .format-opt { border:1.5px solid var(--outline-v); border-radius:10px; padding:9px; cursor:pointer; transition:border-color .2s,background .2s; text-align:center; }
    .format-opt:hover { border-color:var(--orange-m); background:var(--bg-low); }
    .format-opt.selected { border-color:var(--orange-m); background:var(--bg-dim); }
    .format-opt-icon { font-size:18px; margin-bottom:3px; }
    .format-opt-label { font-family:'Work Sans',sans-serif; font-size:11px; font-weight:700; color:var(--brown); }
    .format-opt-sub   { font-family:'Work Sans',sans-serif; font-size:8px; color:var(--outline); margin-top:1px; }

    /* retry / clarification */
    .retry-card { background:var(--bg); border-radius:14px; padding:14px; margin-bottom:10px; border:1.5px dashed var(--outline-v); }
    .retry-title { font-family:'Newsreader',serif; font-style:italic; font-size:15px; font-weight:700; color:var(--brown); margin-bottom:3px; }
    .retry-sub   { font-family:'Work Sans',sans-serif; font-size:10px; color:var(--outline); margin-bottom:8px; }

    /* success */
    .success-card { background:var(--green-bg); border-radius:14px; padding:20px 14px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:8px; }
    .success-icon { width:44px; height:44px; border-radius:50%; background:var(--green); display:flex; align-items:center; justify-content:center; }
    .success-title { font-family:'Newsreader',serif; font-style:italic; font-size:18px; font-weight:700; color:var(--green); }
    .success-sub   { font-family:'Work Sans',sans-serif; font-size:11px; color:var(--green); opacity:.8; }

    /* section label */
    .sec-label { font-family:'Work Sans',sans-serif; font-size:8px; font-weight:700; letter-spacing:1.2px; text-transform:uppercase; color:var(--outline); margin-bottom:6px; margin-top:2px; }
    .divider { height:1px; background:var(--outline-v); margin:8px 0; }
    .row-btns { display:flex; gap:6px; flex-direction:column; }

    /* paste area */
    .paste-area { border:1.5px solid var(--outline-v); border-radius:10px; padding:10px 12px; font-size:12px; font-family:'Noto Serif',serif; color:var(--brown); background:var(--bg-low); outline:none; resize:vertical; min-height:70px; line-height:1.4; transition:border-color .2s; width:100%; }
    .paste-area:focus { border-color:var(--orange-m); }
    .paste-area::placeholder { color:var(--outline); }
    .paste-divider { display:flex; align-items:center; gap:8px; margin:10px 0; opacity:.6; }
    .paste-divider::before, .paste-divider::after { content:''; flex:1; height:1px; background:var(--outline-v); }

    /* deadline input */
    .deadline-row { display:flex; gap:6px; align-items:center; margin-bottom:10px; }
    .dl-input { flex:1; border:1.5px solid var(--outline-v); border-radius:9px; padding:8px 10px; font-size:12px; font-family:'Work Sans',sans-serif; color:var(--brown); background:var(--bg-low); outline:none; transition:border-color .2s; }
    .dl-input:focus { border-color:var(--orange-m); }

    /* banner */
    .banner { border-radius:10px; padding:10px 12px; display:flex; align-items:flex-start; gap:7px; margin-bottom:8px; }
    .banner.info { background:var(--bg-dim); }
    .banner.warn { background:var(--red-bg); }
    .banner-text { font-family:'Work Sans',sans-serif; font-size:10px; color:var(--brown-m); line-height:1.4; }
    .banner.warn .banner-text { color:var(--red); }
  `}</style>
);

/* ── HELPERS ─────────────────────────────────────────────── */
const fmt = n => n < 1024 ? `${n}B` : n < 1048576 ? `${(n/1024).toFixed(1)}KB` : `${(n/1048576).toFixed(1)}MB`;

const FORMATS = [
  { id:"daily",   icon:"📅", label:"Daily View",    sub:"Tasks split by day" },
  { id:"weekly",  icon:"🗓️", label:"Weekly View",   sub:"Tasks grouped by week" },
  { id:"topic",   icon:"📚", label:"By Topic",      sub:"Grouped by subject" },
  { id:"priority",icon:"🎯", label:"By Priority",   sub:"Most urgent first" },
];

const SYSTEM_PROMPT = `You are Cal Newport's study planner using time-blocking and realistic scheduling.

TODAY IS: April 5, 2026

Extract topics from file content ONLY (ignore filename). Create a realistic study schedule that:
- Respects the deadline: spread exactly across days between today and deadline
- Uses time blocking: assign specific times (9am-11am = 2 hours)
- Prioritizes: high-priority topics FIRST, due dates BEFORE content
- Fits into available time: assumes 6-8 hours study/day, respects sleep/meals

Return ONLY valid JSON:

{
  "deadline": "April 8 2026",
  "daysAvailable": 3,
  "totalHours": 18,
  "schedule": [
    {
      "id": "t1",
      "date": "April 5 2026",
      "startTime": "9:00am",
      "endTime": "11:00am",
      "duration": 2,
      "title": "Linear Algebra Foundations",
      "description": "Matrix operations and row echelon form",
      "priority": 1,
      "subtasks": ["Read Ch1-2", "Do practice set"]
    }
  ],
  "plannerNote": "Work-ahead approach: day 1 is hardest, spreads across exact deadline"
}

CRITICAL RULES:
- EXTRACT ONLY FROM FILE CONTENT (not filename)
- Calculate days: deadline - today = daysAvailable
- Distribute topics EVENLY across exactly daysAvailable days
- Schedule highest priority FIRST (Priority 1 = Day 1)
- Time blocks: 2-3 hour chunks, morning first (9am-11am best)
- If no deadline specified, default to 3 days from today
- Each study block includes: date, startTime, endTime
- DO NOT skip days or spread beyond deadline
- 3-8 topics maximum`;

/* ── MAIN COMPONENT ──────────────────────────────────────── */
export default function PlannerScreen({ onImport, bgPlan, setBgPlan }) {
  // step: archive | newPlanChoice | manual | upload | loading | review | success | background
  const [step,      setStep]      = useState("archive");
  const [files,     setFiles]     = useState([]);
  const [prompt,    setPrompt]    = useState("");
  const [deadline,  setDeadline]  = useState("");
  const [dragging,  setDragging]  = useState(false);
  const [error,     setError]     = useState("");
  const [plan,      setPlan]      = useState(null);
  const [format,    setFormat]    = useState("daily");
  const [removed,   setRemoved]   = useState(new Set());
  const [editing,   setEditing]   = useState(null);
  const [editBuf,   setEditBuf]   = useState({});
  const [clarify,   setClarify]   = useState("");
  const [showRetry, setShowRetry] = useState(false);
  const [pastedText, setPastedText] = useState("");
  const [bgRequest, setBgRequest] = useState(null); // {nextRetry: timestamp, message: string, files: [...]}
  const [retryIn,   setRetryIn]   = useState(0); // seconds until retry
  const [archive,   setArchive]   = useState([]); // List of completed plans
  const [loadingExpanded, setLoadingExpanded] = useState(true); // Curtain collapse state
  const [isLoading, setIsLoading] = useState(false); // True while API call is in progress
  const [editingArchiveId, setEditingArchiveId] = useState(null); // ID of archive item being edited
  const [archiveEditBuf, setArchiveEditBuf] = useState({}); // Edit data for archive item
  const [generatingPlanId, setGeneratingPlanId] = useState(null); // ID of plan currently being generated
  // Manual plan creation
  const [manualPlan, setManualPlan] = useState({
    title: "",
    deadline: "",
    topics: [{ id: "t1", title: "", description: "", estimatedHours: 0, subtasks: [""] }]
  });
  const inputRef = useRef();

  // Load persisted background request on mount
  useEffect(() => {
    // Load archive
    const savedArchive = localStorage.getItem("rumpel_archive");
    if (savedArchive) {
      try {
        setArchive(JSON.parse(savedArchive));
      } catch (e) {
        console.error("Failed to load archive:", e);
      }
    }

    // Clear any old background requests on startup
    localStorage.removeItem("rumpel_bg_request");
    setBgPlan(null);
  }, []);

  // Auto-retry timer for background requests
  useEffect(() => {
    if (!bgRequest || step !== "background") return;
    
    const interval = setInterval(() => {
      const now = Date.now();
      const timeLeft = Math.max(0, Math.ceil((bgRequest.nextRetry - now) / 1000));
      setRetryIn(timeLeft);
      
      if (timeLeft <= 0) {
        // Time to retry
        callAPIWithPersistence(bgRequest.message, bgRequest.files);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [bgRequest, step]);

  const parseRetryAfter = (error) => {
    const match = error.match(/Please retry in ([\d.]+)s/);
    return match ? parseInt(match[1]) + 2 : 30; // Add 2s buffer
  };

  /* ── FILE HANDLING ── */
  const addFiles = useCallback(newFiles => {
    const valid = [...newFiles].filter(f => f.size < 10*1024*1024);
    setFiles(prev => {
      const names = new Set(prev.map(f=>f.name));
      return [...prev, ...valid.filter(f=>!names.has(f.name))];
    });
  }, []);

  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    addFiles(e.dataTransfer.files);
  };
  const removeFile = name => setFiles(f => f.filter(x => x.name !== name));

  /* ── FILE CONTENT READING ── */
  const readFileContent = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      
      // Read as data URL for images/PDFs, text for documents
      if (file.type.startsWith('image/')) {
        reader.readAsDataURL(file);
      } else if (file.type === 'application/pdf') {
        reader.readAsArrayBuffer(file);
      } else {
        reader.readAsText(file);
      }
    });
  };

  const getFileMimeType = (file) => {
    if (file.type) return file.type;
    const ext = file.name.split('.').pop().toLowerCase();
    const mimeMap = {
      'pdf': 'application/pdf',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'webp': 'image/webp',
      'txt': 'text/plain',
      'md': 'text/markdown',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return mimeMap[ext] || 'application/octet-stream';
  };

  /* ── PERSISTENT API CALL WITH AUTO-RETRY ── */
  const callAPIWithPersistence = async (userContent, filesToUse = files) => {
    setStep("archive");
    setError("");
    setIsLoading(true);
    setBgRequest(null);
    localStorage.removeItem("rumpel_bg_request");
    
    try {
      const fileParts = [];
      for (const file of filesToUse) {
        try {
          const content = await readFileContent(file);
          const mimeType = getFileMimeType(file);
          
          if (file.type.startsWith('image/')) {
            fileParts.push({
              inlineData: {
                mimeType: mimeType,
                data: content.split(',')[1]
              }
            });
          } else if (file.type === 'application/pdf') {
            const binary = String.fromCharCode.apply(null, new Uint8Array(content));
            const base64 = btoa(binary);
            fileParts.push({
              inlineData: {
                mimeType: 'application/pdf',
                data: base64
              }
            });
          } else {
            fileParts.push({
              text: `[File: ${file.name}]\n${content}\n`
            });
          }
        } catch (err) {
          console.warn(`Failed to read file ${file.name}:`, err);
        }
      }
      
      const messageParts = [{ text: userContent }, ...fileParts];

      try {
        const text = await callGeminiWithFiles(userContent, fileParts, SYSTEM_PROMPT, {
          maxOutputTokens: 4000,
          temperature: 0.7
        });

        if (!text) throw new Error("No response from API");
        
        let jsonStr = text.trim();
        if (jsonStr.startsWith("```json")) {
          jsonStr = jsonStr.replace(/^```json\s*/, "").replace(/\s*```$/, "");
        } else if (jsonStr.startsWith("```")) {
          jsonStr = jsonStr.replace(/^```\s*/, "").replace(/\s*```$/, "");
        }
        
        jsonStr = jsonStr.trim();
        jsonStr = jsonStr.replace(/[""]/g, '"').replace(/['']/g, "'");
        jsonStr = jsonStr.replace(/[\r\n\t]+/g, " ");
        
        let parsed = JSON.parse(jsonStr);
        
        setPlan(parsed);
        setFormat(parsed.suggestedFormat || "daily");
        setRemoved(new Set());
        setEditing(null);
        setShowRetry(false);
        
        // Update the generating plan card with the actual plan
        if (generatingPlanId) {
          setArchive(prev => prev.map(item =>
            item.id === generatingPlanId
              ? {
                  ...item,
                  title: parsed.topics[0]?.title || "Study Plan",
                  estimatedHours: parsed.totalHours || 0,
                  topicCount: parsed.topics?.length || 0,
                  plan: parsed,
                  isGenerating: false
                }
              : item
          ));
          setGeneratingPlanId(null);
        }
        
        // Keep user on archive view to see the new card
        localStorage.removeItem("rumpel_bg_request");
        setBgPlan(null);
        setIsLoading(false);
      } catch (err) {
        // Handle quota exceeded - set up for auto-retry
        if (err.isQuotaExceeded) {
          const retryDelay = 30;
          const bgReq = {
            nextRetry: Date.now() + (retryDelay * 1000),
            message: userContent,
            files: filesToUse.map(f => ({name: f.name, type: f.type, size: f.size}))
          };
          setBgRequest(bgReq);
          setBgPlan(bgReq);
          localStorage.setItem("rumpel_bg_request", JSON.stringify(bgReq));
          setStep("archive");
          setRetryIn(retryDelay);
          setIsLoading(false);
          return;
        }
        throw err;
      }
      
    } catch(e) {
      console.error(e);
      setError(e.message || "Rumpel had trouble reading that.");
      setStep("archive");
      setBgRequest(null);
      localStorage.removeItem("rumpel_bg_request");
      setBgPlan(null);
      setIsLoading(false);
    }
  };

  /* ── API CALL ── */
  const callAPI = (userContent) => callAPIWithPersistence(userContent, files);

  const buildMessage = (extraClarify="") => {
    const parts = [];
    if(deadline) parts.push(`Deadline: ${deadline}`);
    if(files.length>0) parts.push(`Files attached: ${files.map(f=>f.name).join(", ")} (content is included below)`);
    if(prompt.trim()) parts.push(`Instructions: ${prompt}`);
    if(pastedText.trim()) parts.push(`Pasted content:\n${pastedText}`);
    if(extraClarify.trim()) parts.push(`Additional clarification: ${extraClarify}`);
    if(files.length===0 && !prompt.trim() && !pastedText.trim()) parts.push("Create a sample study plan for a typical university student with exams in 3 weeks.");
    return parts.join("\n");
  };

  const handleSubmit = () => {
    if(!files.length && !prompt.trim() && !pastedText.trim()) {
      setError("Add files, describe your plan, or paste content.");
      return;
    }
    
    // Create a temporary planner card that will show loading state
    const tempId = Date.now().toString();
    const tempPlan = {
      id: tempId,
      title: "New Study Plan",
      deadline: deadline || "TBD",
      topicCount: files.length > 0 ? files.length : 1,
      estimatedHours: 0,
      createdAt: new Date().toISOString(),
      plan: null,
      isGenerating: true
    };
    
    setGeneratingPlanId(tempId);
    setArchive(prev => [tempPlan, ...prev.filter(p => !p.isGenerating)]);
    setStep("archive");
    
    // Now make the API call
    callAPI(buildMessage());
  };

  const handleRetry = () => {
    if(!clarify.trim()) return;
    callAPI(buildMessage(clarify));
    setClarify("");
  };

  const goBackToUpload = () => {
    setStep("upload");
  };

  const resetManualPlan = () => {
    setManualPlan({
      title: "",
      deadline: "",
      topics: [{ id: "t1", title: "", description: "", estimatedHours: 0, subtasks: [""] }]
    });
    setError("");
  };

  const loadFromArchive = (archivedPlan) => {
    setPlan(archivedPlan.plan);
    setFormat(archivedPlan.plan.suggestedFormat || "daily");
    setRemoved(new Set());
    setEditing(null);
    setShowRetry(false);
    setStep("review");
  };

  const viewPendingPlan = () => {
    setStep("archive");
  };

  /* ── TOPIC EDITING ── */
  const startEdit = t => { setEditing(t.id); setEditBuf({title:t.title, description:t.description, estimatedHours:t.estimatedHours}); };
  const saveEdit  = id => {
    setPlan(p=>({...p, topics:p.topics.map(t=>t.id===id?{...t,...editBuf}:t)}));
    setEditing(null);
  };
  const toggleRemove = id => setRemoved(s=>{ const n=new Set(s); n.has(id)?n.delete(id):n.add(id); return n; });

  const activePlan = plan ? { ...plan, topics: plan.topics.filter(t=>!removed.has(t.id)) } : null;

  /* ── ARCHIVE EDITING ── */
  const startArchiveEdit = (item) => {
    setEditingArchiveId(item.id);
    setArchiveEditBuf({title: item.title, description: item.topicCount + " topics • ~" + item.estimatedHours + "h"});
  };

  const saveArchiveEdit = (itemId) => {
    setArchive(prev => prev.map(item => 
      item.id === itemId 
        ? {...item, title: archiveEditBuf.title}
        : item
    ));
    localStorage.setItem("rumpel_archive", JSON.stringify(archive.map(item =>
      item.id === itemId
        ? {...item, title: archiveEditBuf.title}
        : item
    )));
    setEditingArchiveId(null);
    setArchiveEditBuf({});
  };

  const deleteArchiveItem = (itemId) => {
    const updatedArchive = archive.filter(item => item.id !== itemId);
    setArchive(updatedArchive);
    localStorage.setItem("rumpel_archive", JSON.stringify(updatedArchive));
  };

  /* ── MANUAL PLAN HELPERS ── */
  const updateManualTopic = (topicId, field, value) => {
    setManualPlan(p => ({
      ...p,
      topics: p.topics.map(t => t.id === topicId ? {...t, [field]: value} : t)
    }));
  };

  const addManualTopic = () => {
    const newId = "t" + (Date.now());
    setManualPlan(p => ({
      ...p,
      topics: [...p.topics, {id: newId, title: "", description: "", estimatedHours: 0, subtasks: [""]}]
    }));
  };

  const removeManualTopic = (topicId) => {
    if (manualPlan.topics.length <= 1) return;
    setManualPlan(p => ({
      ...p,
      topics: p.topics.filter(t => t.id !== topicId)
    }));
  };

  const updateManualSubtask = (topicId, subtaskIdx, value) => {
    setManualPlan(p => ({
      ...p,
      topics: p.topics.map(t => t.id === topicId 
        ? {...t, subtasks: t.subtasks.map((st, i) => i === subtaskIdx ? value : st)}
        : t
      )
    }));
  };

  const addManualSubtask = (topicId) => {
    setManualPlan(p => ({
      ...p,
      topics: p.topics.map(t => t.id === topicId 
        ? {...t, subtasks: [...t.subtasks, ""]}
        : t
      )
    }));
  };

  const removeManualSubtask = (topicId, subtaskIdx) => {
    setManualPlan(p => ({
      ...p,
      topics: p.topics.map(t => t.id === topicId 
        ? {...t, subtasks: t.subtasks.filter((_, i) => i !== subtaskIdx)}
        : t
      )
    }));
  };

  const saveManualPlan = () => {
    if (!manualPlan.title.trim()) {
      setError("Please enter a plan title");
      return;
    }
    if (manualPlan.topics.some(t => !t.title.trim())) {
      setError("All topics must have a title");
      return;
    }

    const totalHours = manualPlan.topics.reduce((sum, t) => sum + (parseInt(t.estimatedHours) || 0), 0);
    const planData = {
      deadline: manualPlan.deadline || "No deadline",
      totalFiles: 0,
      suggestedFormat: "daily",
      estimatedHours: totalHours,
      topics: manualPlan.topics.map(t => ({
        ...t,
        subtasks: t.subtasks.filter(s => s.trim())
      })),
      plannerNote: "Manually created plan"
    };

    setPlan(planData);
    setFormat("daily");
    setRemoved(new Set());
    setEditing(null);
    setStep("review");
    setError("");
  };

  /* ── CONFIRM ── */
  const handleConfirm = () => {
    if(onImport) onImport({ ...activePlan, format });
    
    // Save to archive
    const archivedPlan = {
      id: Date.now().toString(),
      title: activePlan.topics[0]?.title || "Study Plan",
      deadline: activePlan.deadline,
      topicCount: activePlan.topics.length,
      estimatedHours: activePlan.estimatedHours,
      createdAt: new Date().toISOString(),
      plan: activePlan
    };
    
    const updatedArchive = [archivedPlan, ...archive];
    setArchive(updatedArchive);
    localStorage.setItem("rumpel_archive", JSON.stringify(updatedArchive));
    
    setStep("success");
  };

  /* ── STEP LABEL ── */
  const stepState = (s, current) => {
    const order = ["upload","loading","review","success"];
    const si = order.indexOf(s), ci = order.indexOf(current);
    if(si < ci) return "done";
    if(si === ci) return "active";
    return "";
  };

  /* ── RENDER ─────────────────────────────────────────────── */
  return (
    <>
      <TopBar title="Study Plan"/>
      <div className="scroll-content">
        <S/>
        <div className="planner-wrap">

          {/* Steps */}
          <div className="steps">
            {[{s:"upload",label:"Upload"},{s:"review",label:"Review"},{s:"success",label:"Done"}].map(({s,label},i,arr)=>(
              <div key={`step-${i}`} style={{display:"flex", alignItems:"center", gap: 0}}>
                <div className="step-item">
                  <div className={`step-dot ${stepState(s,step)}`}>
                    {stepState(s,step)==="done" ? <Check size={11}/> : i+1}
                  </div>
                  <span className={`step-label ${stepState(s,step)}`}>{label}</span>
                </div>
                {i < arr.length - 1 && <div className="step-line" style={{minWidth:"40px"}}/>}
              </div>
            ))}
        </div>

        {/* ── STEP: PLAN CREATION CHOICE ── */}
        {step==="newPlanChoice" && (
          <>
            <div style={{marginBottom: 28}}>
              <div style={{
                display:"inline-block",
                background:"rgba(45,106,79,0.12)",
                color:"var(--green)",
                fontFamily:"'Work Sans',sans-serif",
                fontSize:9,
                fontWeight:700,
                letterSpacing:1.2,
                textTransform:"uppercase",
                padding:"6px 12px",
                borderRadius:20,
                marginBottom:16
              }}>
                🎯 New Journey
              </div>
              <h2 style={{fontFamily:"'Newsreader',serif",fontSize:28,fontWeight:700,color:"var(--brown)",margin:"0 0 8px 0",lineHeight:1.2}}>
                How would you like to <span style={{color:"var(--green)"}}>create</span> your study plan?
              </h2>
              <p style={{fontFamily:"'Noto Serif',serif",fontSize:13,color:"var(--outline)",margin:"0",lineHeight:1.5,maxWidth:"85%"}}>
                Choose a method that fits your rhythm. Whether you prefer total control or AI-powered curation, we've got you covered.
              </p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr",gap:18,marginBottom:24}}>
              {/* AI Generated Plan */}
              <div 
                style={{
                  background:"var(--bg-low)",
                  borderRadius:20,
                  padding:20,
                  border:"2px solid var(--outline-v)",
                  transition:"all 0.2s",
                  display:"flex",
                  flexDirection:"column",
                  minHeight:180,
                  cursor:"pointer"
                }}
                onClick={() => setStep("upload")}
                onMouseEnter={e => {e.currentTarget.style.borderColor="var(--orange-m)"; e.currentTarget.style.background="var(--bg-dim)"}}
                onMouseLeave={e => {e.currentTarget.style.borderColor="var(--outline-v)"; e.currentTarget.style.background="var(--bg-low)"}}
              >
                <div style={{marginBottom:16}}>
                  <div style={{
                    width:52,
                    height:52,
                    borderRadius:14,
                    background:"rgba(244,123,32,0.15)",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:28,
                    marginBottom:12
                  }}>
                    ✨
                  </div>
                  <div style={{fontFamily:"'Newsreader',serif",fontSize:18,fontWeight:700,color:"var(--brown)",marginBottom:6}}>AI Generate</div>
                  <div style={{fontFamily:"'Noto Serif',serif",fontSize:12,color:"var(--outline)",lineHeight:1.5}}>
                    Magically curate a full curriculum based on your goals, schedule, and preferred sources.
                  </div>
                </div>
                <div style={{marginTop:"auto"}}>
                  <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,color:"var(--orange-m)",display:"flex",alignItems:"center",gap:6}}>
                    Get Started <ArrowRight size={14}/>
                  </div>
                </div>
              </div>

              {/* Manual Plan Creation */}
              <div 
                style={{
                  background:"var(--bg-low)",
                  borderRadius:20,
                  padding:20,
                  border:"2px dashed var(--outline-v)",
                  transition:"all 0.2s",
                  display:"flex",
                  flexDirection:"column",
                  minHeight:180,
                  cursor:"pointer"
                }}
                onClick={() => { resetManualPlan(); setStep("manual"); }}
                onMouseEnter={e => {e.currentTarget.style.borderColor="var(--orange-m)"; e.currentTarget.style.borderStyle="solid"; e.currentTarget.style.background="var(--bg-dim)"}}
                onMouseLeave={e => {e.currentTarget.style.borderColor="var(--outline-v)"; e.currentTarget.style.borderStyle="dashed"; e.currentTarget.style.background="var(--bg-low)"}}
              >
                <div style={{marginBottom:16}}>
                  <div style={{
                    width:52,
                    height:52,
                    borderRadius:14,
                    background:"rgba(244,123,32,0.15)",
                    display:"flex",
                    alignItems:"center",
                    justifyContent:"center",
                    fontSize:28,
                    marginBottom:12
                  }}>
                    📝
                  </div>
                  <div style={{fontFamily:"'Newsreader',serif",fontSize:18,fontWeight:700,color:"var(--brown)",marginBottom:6}}>Create Manually</div>
                  <div style={{fontFamily:"'Noto Serif',serif",fontSize:12,color:"var(--outline)",lineHeight:1.5}}>
                    Hand-pick your modules, set custom milestones, and build your library from scratch.
                  </div>
                </div>
                <div style={{marginTop:"auto"}}>
                  <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,color:"var(--orange-m)",display:"flex",alignItems:"center",gap:6}}>
                    Define Steps <ArrowRight size={14}/>
                  </div>
                </div>
              </div>
            </div>

            <div style={{display:"flex",justifyContent:"center"}}>
              <button 
                onClick={() => setStep("archive")}
                style={{
                  padding:"10px 16px",
                  borderRadius:9,
                  border:"none",
                  background:"transparent",
                  color:"var(--outline)",
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:12,
                  fontWeight:700,
                  cursor:"pointer",
                  transition:"all 0.15s",
                  display:"flex",
                  alignItems:"center",
                  gap:6
                }}
                onMouseOver={e => e.target.style.color="var(--brown)"}
                onMouseOut={e => e.target.style.color="var(--outline)"}
              >
                ← Back to Plans
              </button>
            </div>
          </>
        )}

        {/* ── STEP: MANUAL PLAN CREATION ── */}
        {step==="manual" && (
          <>
            <div style={{marginBottom: 24}}>
              <h2 style={{fontFamily:"'Newsreader',serif",fontSize:24,fontWeight:700,color:"var(--brown)",margin:"0 0 6px 0"}}>Define Steps</h2>
              <p style={{fontFamily:"'Noto Serif',serif",fontSize:12,color:"var(--outline)",margin:0,lineHeight:1.5}}>Hand-pick your modules and set custom milestones</p>
            </div>

            {error && (
              <div style={{background:"var(--red-bg)",borderRadius:10,padding:"10px 12px",display:"flex",alignItems:"flex-start",gap:8,marginBottom:16}}>
                <AlertCircle size={14} style={{color:"var(--red)",flexShrink:0,marginTop:2}}/>
                <span style={{fontFamily:"'Work Sans',sans-serif",fontSize:10,color:"var(--red)",lineHeight:1.4}}>{error}</span>
              </div>
            )}

            {/* Plan Details Card */}
            <div style={{background:"var(--bg-low)",borderRadius:16,padding:16,marginBottom:16}}>
              <div style={{fontFamily:"'Newsreader',serif",fontSize:14,fontWeight:700,color:"var(--brown)",marginBottom:12}}>Plan Details</div>
              
              <div style={{marginBottom:12}}>
                <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,fontWeight:700,color:"var(--outline)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Title</div>
                <input
                  type="text"
                  placeholder="e.g., Spring 2026 Midterms"
                  value={manualPlan.title}
                  onChange={(e) => setManualPlan({...manualPlan, title: e.target.value})}
                  style={{
                    width:"100%",
                    border:"1.5px solid var(--outline-v)",
                    borderRadius:10,
                    padding:"10px 12px",
                    fontSize:13,
                    fontFamily:"'Newsreader',serif",
                    fontWeight:700,
                    color:"var(--brown)",
                    background:"white",
                    outline:"none",
                    transition:"border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                  onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                />
              </div>

              <div>
                <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,fontWeight:700,color:"var(--outline)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Deadline</div>
                <input
                  type="text"
                  placeholder="e.g., May 15 2026"
                  value={manualPlan.deadline}
                  onChange={(e) => setManualPlan({...manualPlan, deadline: e.target.value})}
                  style={{
                    width:"100%",
                    border:"1.5px solid var(--outline-v)",
                    borderRadius:10,
                    padding:"10px 12px",
                    fontSize:13,
                    fontFamily:"'Noto Serif',serif",
                    color:"var(--brown)",
                    background:"white",
                    outline:"none",
                    transition:"border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                  onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                />
              </div>
            </div>

            {/* Topics Section */}
            <div style={{marginBottom:16}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <div style={{fontFamily:"'Newsreader',serif",fontSize:14,fontWeight:700,color:"var(--brown)"}}>Topics</div>
                <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,fontWeight:700,color:"var(--outline)"}}>{manualPlan.topics.length} topic{manualPlan.topics.length!==1?"s":""}</div>
              </div>

              {manualPlan.topics.map((topic, idx) => (
                <div key={topic.id} style={{background:"var(--bg-low)",borderRadius:14,padding:14,marginBottom:12,border:"1.5px solid var(--outline-v)"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                    <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",color:"var(--orange-m)"}}>Module {idx + 1}</div>
                    {manualPlan.topics.length > 1 && (
                      <button
                        onClick={() => removeManualTopic(topic.id)}
                        style={{
                          width:24,
                          height:24,
                          borderRadius:6,
                          border:"none",
                          background:"rgba(186,26,26,0.12)",
                          color:"var(--red)",
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          transition:"all 0.15s"
                        }}
                        onMouseOver={e => e.target.style.background="rgba(186,26,26,0.25)"}
                        onMouseOut={e => e.target.style.background="rgba(186,26,26,0.12)"}
                        title="Remove topic"
                      >
                        <X size={14}/>
                      </button>
                    )}
                  </div>

                  <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:8,fontWeight:700,color:"var(--outline)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Title</div>
                  <input
                    type="text"
                    placeholder="Module title"
                    value={topic.title}
                    onChange={(e) => updateManualTopic(topic.id, "title", e.target.value)}
                    style={{
                      width:"100%",
                      border:"1.5px solid var(--outline-v)",
                      borderRadius:10,
                      padding:"8px 10px",
                      fontSize:12,
                      fontFamily:"'Newsreader',serif",
                      fontWeight:700,
                      color:"var(--brown)",
                      background:"white",
                      outline:"none",
                      marginBottom:10,
                      transition:"border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                    onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                  />

                  <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:8,fontWeight:700,color:"var(--outline)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Description</div>
                  <textarea
                    placeholder="What will you learn?"
                    value={topic.description}
                    onChange={(e) => updateManualTopic(topic.id, "description", e.target.value)}
                    style={{
                      width:"100%",
                      border:"1.5px solid var(--outline-v)",
                      borderRadius:10,
                      padding:"8px 10px",
                      fontSize:11,
                      fontFamily:"'Noto Serif',serif",
                      color:"var(--brown)",
                      background:"white",
                      outline:"none",
                      marginBottom:10,
                      minHeight:60,
                      resize:"vertical",
                      transition:"border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                    onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                  />

                  <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:8,fontWeight:700,color:"var(--outline)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:6}}>Time (Hours)</div>
                  <input
                    type="number"
                    placeholder="0"
                    min="0"
                    max="100"
                    value={topic.estimatedHours}
                    onChange={(e) => updateManualTopic(topic.id, "estimatedHours", parseInt(e.target.value) || 0)}
                    style={{
                      width:"100%",
                      border:"1.5px solid var(--outline-v)",
                      borderRadius:10,
                      padding:"8px 10px",
                      fontSize:11,
                      fontFamily:"'Work Sans',sans-serif",
                      color:"var(--brown)",
                      background:"white",
                      outline:"none",
                      marginBottom:12,
                      transition:"border-color 0.2s"
                    }}
                    onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                    onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                  />

                  <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:8,fontWeight:700,color:"var(--outline)",letterSpacing:0.5,textTransform:"uppercase",marginBottom:8}}>Subtasks</div>
                  {topic.subtasks.map((subtask, subIdx) => (
                    <div key={subIdx} style={{display:"flex",gap:6,marginBottom:6}}>
                      <input
                        type="text"
                        placeholder={`Step ${subIdx + 1}`}
                        value={subtask}
                        onChange={(e) => updateManualSubtask(topic.id, subIdx, e.target.value)}
                        style={{
                          flex:1,
                          border:"1.5px solid var(--outline-v)",
                          borderRadius:8,
                          padding:"8px 10px",
                          fontSize:11,
                          fontFamily:"'Noto Serif',serif",
                          color:"var(--brown)",
                          background:"white",
                          outline:"none",
                          transition:"border-color 0.2s"
                        }}
                        onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                        onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                      />
                      {topic.subtasks.length > 1 && (
                        <button
                          onClick={() => removeManualSubtask(topic.id, subIdx)}
                          style={{
                            width:34,
                            height:34,
                            borderRadius:8,
                            border:"none",
                            background:"rgba(186,26,26,0.12)",
                            color:"var(--red)",
                            cursor:"pointer",
                            display:"flex",
                            alignItems:"center",
                            justifyContent:"center",
                            transition:"all 0.15s"
                          }}
                          onMouseOver={e => e.target.style.background="rgba(186,26,26,0.25)"}
                          onMouseOut={e => e.target.style.background="rgba(186,26,26,0.12)"}
                          title="Remove step"
                        >
                          <X size={16}/>
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    onClick={() => addManualSubtask(topic.id)}
                    style={{
                      fontSize:10,
                      fontFamily:"'Work Sans',sans-serif",
                      fontWeight:700,
                      color:"var(--orange-m)",
                      background:"transparent",
                      border:"none",
                      cursor:"pointer",
                      padding:"6px 0",
                      transition:"opacity 0.15s"
                    }}
                    onMouseOver={e => e.target.style.opacity="0.7"}
                    onMouseOut={e => e.target.style.opacity="1"}
                  >
                    + Add Step
                  </button>
                </div>
              ))}

              <button
                onClick={addManualTopic}
                style={{
                  width:"100%",
                  padding:"12px",
                  borderRadius:12,
                  border:"2px dashed var(--outline-v)",
                  background:"transparent",
                  color:"var(--orange-m)",
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:12,
                  fontWeight:700,
                  cursor:"pointer",
                  transition:"all 0.2s"
                }}
                onMouseOver={e => {e.target.style.borderColor="var(--orange-m)"; e.target.style.background="var(--bg-dim)"; e.target.style.borderStyle="solid"}}
                onMouseOut={e => {e.target.style.borderColor="var(--outline-v)"; e.target.style.background="transparent"; e.target.style.borderStyle="dashed"}}
              >
                + Add Module
              </button>
            </div>

            {/* Action Buttons */}
            <div style={{display:"flex",gap:10,marginBottom:20}}>
              <button 
                onClick={saveManualPlan}
                style={{
                  flex:1,
                  padding:"14px 16px",
                  borderRadius:12,
                  border:"none",
                  background:"var(--orange)",
                  color:"white",
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:13,
                  fontWeight:700,
                  cursor:"pointer",
                  transition:"all 0.15s",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:6
                }}
                onMouseOver={e => {e.target.style.opacity="0.9"; e.target.style.boxShadow="0 4px 12px rgba(153,71,0,0.3)"}}
                onMouseOut={e => {e.target.style.opacity="1"; e.target.style.boxShadow="none"}}
              >
                Review Plan
              </button>
              <button 
                onClick={() => setStep("newPlanChoice")}
                style={{
                  flex:1,
                  padding:"14px 16px",
                  borderRadius:12,
                  border:"2px solid var(--orange)",
                  background:"white",
                  color:"var(--orange)",
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:13,
                  fontWeight:700,
                  cursor:"pointer",
                  transition:"all 0.15s"
                }}
                onMouseOver={e => {e.target.style.background="var(--bg-dim)"; e.target.style.borderColor="var(--orange-m)"}}
                onMouseOut={e => {e.target.style.background="white"; e.target.style.borderColor="var(--orange)"}}
              >
                Back
              </button>
            </div>
          </>
        )}

        {/* ── STEP: ARCHIVE ── */}
        {step==="archive" && (
          <>
            <div style={{marginBottom: 16}}>
              <h2 style={{fontFamily:"'Newsreader',serif",fontSize:20,fontWeight:700,color:"var(--brown)",margin:"0 0 4px 0"}}>My Plans</h2>
              <p style={{fontFamily:"'Work Sans',sans-serif",fontSize:12,color:"var(--outline)",margin:0}}>Your saved study plans and archive</p>
            </div>

            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
              {/* Create New Plan Card */}
              <div 
                onClick={() => setStep("newPlanChoice")}
                style={{
                  background:"var(--bg-low)",
                  borderRadius:12,
                  padding:12,
                  cursor:"pointer",
                  border:"1.5px solid var(--outline-v)",
                  transition:"all 0.2s",
                  display:"flex",
                  flexDirection:"column",
                  alignItems:"center",
                  justifyContent:"center",
                  minHeight:160,
                  gap:8
                }}
                onMouseEnter={e => {e.currentTarget.style.borderColor="var(--orange-m)"; e.currentTarget.style.background="var(--bg-dim)"}}
                onMouseLeave={e => {e.currentTarget.style.borderColor="var(--outline-v)"; e.currentTarget.style.background="var(--bg-low)"}}
              >
                <div style={{
                  width:56,
                  height:56,
                  borderRadius:12,
                  background:"rgba(244,123,32,0.15)",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  fontSize:28,
                  color:"var(--orange-m)"
                }}>
                  +
                </div>
                <div style={{fontFamily:"'Newsreader',serif",fontSize:13,fontWeight:700,color:"var(--brown)",textAlign:"center"}}>Create new plan</div>
              </div>

              {/* Generating Plans */}
              {bgRequest && (
                <div 
                  onClick={viewPendingPlan}
                  style={{
                    background:"rgba(253,207,73,0.15)",
                    borderRadius:12,
                    padding:12,
                    cursor:"pointer",
                    border:"1.5px solid rgba(253,207,73,0.3)",
                    transition:"all 0.2s",
                    display:"flex",
                    flexDirection:"column",
                    justifyContent:"space-between",
                    minHeight:160
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor="rgba(253,207,73,0.6)"}
                  onMouseLeave={e => e.currentTarget.style.borderColor="rgba(253,207,73,0.3)"}
                >
                  <div>
                    <div style={{fontFamily:"'Newsreader',serif",fontSize:13,fontWeight:700,color:"var(--brown)",marginBottom:4}}>Your study plan</div>
                    <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,color:"var(--outline)"}}>
                      Processing in background
                    </div>
                  </div>
                  <div style={{display:"flex",alignItems:"center",gap:6}}>
                    <Loader2 size={14} className="spin" style={{color:"var(--yellow)"}}/>
                    <span style={{fontFamily:"'Work Sans',sans-serif",fontSize:10,color:"var(--outline)"}}>Retry in {retryIn}s</span>
                  </div>
                </div>
              )}

              {/* Completed Plans */}
              {archive.map(item => {
                const date = new Date(item.createdAt);
                const dateStr = date.toLocaleDateString("en-US", {month:"short",day:"numeric"});
                const isEditing = editingArchiveId === item.id;

                return isEditing ? (
                  <div key={item.id} style={{
                    background:"var(--bg)",
                    borderRadius:12,
                    padding:12,
                    border:"1.5px solid var(--orange-m)",
                    display:"flex",
                    flexDirection:"column",
                    justifyContent:"space-between",
                    minHeight:160,
                    gap:8
                  }}>
                    <div>
                      <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:8,fontWeight:700,letterSpacing:1,textTransform:"uppercase",color:"var(--orange)",marginBottom:6}}>Edit Plan</div>
                      <input 
                        type="text"
                        value={archiveEditBuf.title}
                        onChange={(e) => setArchiveEditBuf({...archiveEditBuf, title: e.target.value})}
                        style={{
                          width:"100%",
                          border:"1.5px solid var(--orange-m)",
                          borderRadius:8,
                          padding:"6px 8px",
                          fontSize:13,
                          fontFamily:"'Newsreader',serif",
                          fontWeight:700,
                          color:"var(--brown)",
                          background:"white",
                          outline:"none",
                          marginBottom:6
                        }}
                        placeholder="Plan title"
                      />
                    </div>
                    <div style={{display:"flex",gap:6}}>
                      <button 
                        onClick={() => saveArchiveEdit(item.id)}
                        style={{
                          flex:1,
                          padding:"7px 12px",
                          borderRadius:8,
                          border:"none",
                          background:"var(--orange)",
                          color:"white",
                          fontFamily:"'Work Sans',sans-serif",
                          fontSize:11,
                          fontWeight:700,
                          cursor:"pointer",
                          transition:"opacity 0.15s"
                        }}
                        onMouseOver={e => e.target.style.opacity="0.9"}
                        onMouseOut={e => e.target.style.opacity="1"}
                      >
                        Save
                      </button>
                      <button 
                        onClick={() => setEditingArchiveId(null)}
                        style={{
                          flex:1,
                          padding:"7px 12px",
                          borderRadius:8,
                          border:"1px solid var(--outline-v)",
                          background:"white",
                          color:"var(--outline)",
                          fontFamily:"'Work Sans',sans-serif",
                          fontSize:11,
                          fontWeight:700,
                          cursor:"pointer",
                          transition:"opacity 0.15s"
                        }}
                        onMouseOver={e => e.target.style.opacity="0.7"}
                        onMouseOut={e => e.target.style.opacity="1"}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : item.isGenerating ? (
                  <div key={item.id} 
                    style={{
                      background:"rgba(253,207,73,0.12)",
                      borderRadius:12,
                      padding:12,
                      border:"1.5px solid rgba(253,207,73,0.3)",
                      display:"flex",
                      flexDirection:"column",
                      justifyContent:"space-between",
                      minHeight:160,
                      position:"relative"
                    }}
                  >
                    <div>
                      <div style={{fontFamily:"'Newsreader',serif",fontSize:13,fontWeight:700,color:"var(--brown)",marginBottom:6}}>Weaving your plan…</div>
                      <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:10,color:"var(--outline)",display:"flex",alignItems:"center",gap:6}}>
                        <Loader2 size={12} className="spin" style={{color:"var(--orange-m)"}}/>
                        Creating your study schedule
                      </div>
                    </div>
                    <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,color:"var(--outline)",marginTop:"auto"}}>
                      {item.deadline || "Deadline: TBD"}
                    </div>
                  </div>
                ) : (
                  <div key={item.id} 
                    onClick={() => loadFromArchive(item)}
                    style={{
                      background:"var(--bg-low)",
                      borderRadius:12,
                      padding:12,
                      cursor:"pointer",
                      border:"1.5px solid var(--outline-v)",
                      transition:"all 0.2s",
                      display:"flex",
                      flexDirection:"column",
                      justifyContent:"space-between",
                      minHeight:160,
                      position:"relative",
                      group:"true"
                    }}
                    onMouseEnter={e => {e.currentTarget.style.borderColor="var(--orange-m)"; e.currentTarget.querySelector('.archive-actions').style.opacity="1"}}
                    onMouseLeave={e => {e.currentTarget.style.borderColor="var(--outline-v)"; e.currentTarget.querySelector('.archive-actions').style.opacity="0"}}
                  >
                    <div className="archive-actions" style={{
                      position:"absolute",
                      top:8,
                      right:8,
                      display:"flex",
                      gap:4,
                      opacity:"0",
                      transition:"opacity 0.2s"
                    }}>
                      <button 
                        onClick={(e) => {e.stopPropagation(); startArchiveEdit(item);}}
                        style={{
                          width:28,
                          height:28,
                          borderRadius:6,
                          border:"none",
                          background:"rgba(244,123,32,0.15)",
                          color:"var(--orange-m)",
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          transition:"background 0.15s"
                        }}
                        onMouseOver={e => e.currentTarget.style.background="rgba(244,123,32,0.25)"}
                        onMouseOut={e => e.currentTarget.style.background="rgba(244,123,32,0.15)"}
                        title="Edit plan"
                      >
                        <Edit3 size={14}/>
                      </button>
                      <button 
                        onClick={(e) => {e.stopPropagation(); deleteArchiveItem(item.id);}}
                        style={{
                          width:28,
                          height:28,
                          borderRadius:6,
                          border:"none",
                          background:"rgba(186,26,26,0.15)",
                          color:"var(--red)",
                          cursor:"pointer",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          transition:"background 0.15s"
                        }}
                        onMouseOver={e => e.currentTarget.style.background="rgba(186,26,26,0.25)"}
                        onMouseOut={e => e.currentTarget.style.background="rgba(186,26,26,0.15)"}
                        title="Delete plan"
                      >
                        <Trash2 size={14}/>
                      </button>
                    </div>
                    <div>
                      <div style={{fontFamily:"'Newsreader',serif",fontSize:13,fontWeight:700,color:"var(--brown)",marginBottom:3}}>{item.title}</div>
                      <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,color:"var(--outline)"}}>
                        {item.topicCount} topics • ~{item.estimatedHours}h
                      </div>
                    </div>
                    <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,color:"var(--outline)"}}>
                      {dateStr}
                    </div>
                  </div>
                );
              })}
            </div>

            {archive.length === 0 && !bgRequest && (
              <div style={{textAlign:"center",padding:"40px 12px",color:"var(--outline)",gridColumn:"1 / -1"}}>
                <BookOpen size={32} style={{opacity:0.3,marginBottom:12}}/>
                <p style={{fontFamily:"'Newsreader',serif",fontSize:14,margin:0}}>No plans yet</p>
                <p style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,margin:"4px 0 0 0"}}>Create your first study plan</p>
              </div>
            )}
          </>
        )}

        {/* ── STEP: UPLOAD ── */}
        {(step==="upload") && (
          <>
            {error && (
              <div className="banner warn" style={{marginBottom:12}}>
                <AlertCircle size={14} style={{color:"var(--red)",flexShrink:0,marginTop:1}}/>
                <span className="banner-text">{error}</span>
              </div>
            )}

            {/* Drop zone */}
            <div className="card">
              <div className="card-title">Your Study Materials</div>
              <div className="card-sub">Drop syllabi, notes, PDFs, or anything — Rumpel will figure it out.</div>
              <div
                className={`dropzone ${dragging?"drag":""}`}
                onDragOver={e=>{e.preventDefault();setDragging(true);}}
                onDragLeave={()=>setDragging(false)}
                onDrop={onDrop}
                onClick={()=>inputRef.current.click()}
              >
                <input ref={inputRef} type="file" multiple style={{display:"none"}} onChange={e=>addFiles(e.target.files)}/>
                <div className="dropzone-icon"><Upload size={18}/></div>
                <div className="dropzone-text">Drop files or click</div>
                <div className="dropzone-hint">PDF, DOCX, TXT, images · max 10MB each</div>
              </div>
              {files.length>0 && (
                <div className="file-list">
                  {files.map(f=>(
                    <div className="file-row" key={f.name}>
                      <div className="file-icon"><FileText size={13}/></div>
                      <span className="file-name">{f.name}</span>
                      <span className="file-size">{fmt(f.size)}</span>
                      <button className="file-remove" onClick={()=>removeFile(f.name)}><X size={11}/></button>
                    </div>
                  ))}
                </div>
              )}

              {/* Or paste text */}
              <div className="paste-divider">
                <span style={{fontSize: "10px", color: "var(--outline)"}}>or</span>
              </div>

              <textarea
                className="paste-area"
                placeholder="Paste your syllabus, notes, study guide, or any text content here..."
                value={pastedText}
                onChange={e=>setPastedText(e.target.value)}
              />
            </div>

            {/* Deadline */}
            <div className="card">
              <div className="card-title">Deadline</div>
              <div className="card-sub">When do you need this done by?</div>
              <div className="deadline-row">
                <input
                  className="dl-input"
                  type="text"
                  placeholder="e.g. May 15, 2026"
                  value={deadline}
                  onChange={e=>setDeadline(e.target.value)}
                />
                <Calendar size={16} style={{color:"var(--outline)",flexShrink:0}}/>
              </div>
            </div>

            {/* Instructions */}
            <div className="card">
              <div className="card-title">Instructions</div>
              <div className="card-sub">Tell Rumpel what you need.</div>
              <textarea
                className="prompt-area"
                placeholder={`e.g. Please focus on Linear Algebra. I have 3 days to prepare for my midterm examination. I am not available in these days; April 4th and April 7th.}"`}
                value={prompt}
                onChange={e=>setPrompt(e.target.value)}
              />
              <div className="prompt-hint">
                Mention subjects, time restrictions, what's hardest.
              </div>
            </div>

            <button
              className="btn btn-primary btn-full"
              onClick={handleSubmit}
              disabled={!files.length && !prompt.trim() && !pastedText.trim()}
            >
              <img src={wheelIcon} alt="Weave" style={{width: "14px", height: "14px"}} /> Weave My Plan
            </button>
            <button
              className="btn btn-ghost btn-full"
              style={{marginTop: 6}}
              onClick={() => setStep("archive")}
            >
              ← Back to Plans
            </button>
          </>
        )}

        {/* ── LOADING CURTAIN ── */}
        {(isLoading || bgRequest) && (
          <div style={{background:"var(--bg-dim)",borderRadius:12,padding:"12px 14px",marginBottom:12,cursor:"pointer"}} onClick={() => setLoadingExpanded(!loadingExpanded)}>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{fontFamily:"'Newsreader',serif",fontSize:14,fontWeight:700,color:"var(--brown)"}}>Weaving your plan…</div>
              <ChevronDown size={18} style={{color:"var(--brown)",transform:loadingExpanded?"rotate(0deg)":"rotate(-90deg)",transition:"transform 0.3s"}}/>
            </div>
            {loadingExpanded && <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,color:"var(--outline)",marginTop:6}}>{bgRequest ? `Processing in background • Retry in ${retryIn}s` : "This may take a moment"}</div>}
          </div>
        )}

        {/* ── STEP: REVIEW ── */}
        {step==="review" && plan && (
          <>
            {/* Plan Title & Meta */}
            <div style={{marginBottom: 28}}>
              <h2 style={{fontFamily:"'Newsreader',serif",fontSize:26,fontWeight:700,color:"var(--brown)",margin:"0 0 12px 0",lineHeight:1.2}}>
                {plan.topics[0]?.title || "Your Study Plan"}
              </h2>
              
              {/* Metadata Badges */}
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                <div style={{
                  background:"var(--bg-low)",
                  borderRadius:24,
                  padding:"8px 12px",
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:11,
                  fontWeight:600,
                  color:"var(--brown-m)"
                }}>
                  <Calendar size={14} style={{color:"var(--orange-m)"}}/>
                  Deadline: {plan.deadline}
                </div>
                <div style={{
                  background:"var(--bg-low)",
                  borderRadius:24,
                  padding:"8px 12px",
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:11,
                  fontWeight:600,
                  color:"var(--brown-m)"
                }}>
                  <BookOpen size={14} style={{color:"var(--orange-m)"}}/>
                  {plan.topics.length} Topics
                </div>
                <div style={{
                  background:"var(--bg-low)",
                  borderRadius:24,
                  padding:"8px 12px",
                  display:"flex",
                  alignItems:"center",
                  gap:6,
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:11,
                  fontWeight:600,
                  color:"var(--brown-m)"
                }}>
                  <Clock size={14} style={{color:"var(--orange-m)"}}/>
                  ~{plan.estimatedHours} Hours Total
                </div>
              </div>
            </div>

            {/* Display Format */}
            <div style={{marginBottom: 28}}>
              <div style={{fontFamily:"'Newsreader',serif",fontSize:16,fontWeight:700,color:"var(--brown)",marginBottom:12}}>Display Format</div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {FORMATS.map(f=>(
                  <div key={f.id} 
                    onClick={()=>setFormat(f.id)}
                    style={{
                      padding:"16px 12px",
                      borderRadius:16,
                      border:`2px solid ${format===f.id ? "var(--orange-m)" : "var(--outline-v)"}`,
                      background:format===f.id ? "var(--bg-dim)" : "var(--bg-low)",
                      cursor:"pointer",
                      transition:"all 0.2s",
                      textAlign:"center",
                      display:"flex",
                      flexDirection:"column",
                      alignItems:"center",
                      gap:6
                    }}
                    onMouseEnter={e => {if(format!==f.id) e.currentTarget.style.borderColor="var(--orange-m)"}}
                    onMouseLeave={e => {if(format!==f.id) e.currentTarget.style.borderColor="var(--outline-v)"}}
                  >
                    <div style={{fontSize:20}}>{f.icon}</div>
                    <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,color:"var(--brown-m)",letterSpacing:0.5}}>{f.label}</div>
                    <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:8,color:"var(--outline)",letterSpacing:0.3}}>{f.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar Placement */}
            <div style={{marginBottom: 28, background: "white", borderRadius: 16, border: "1.5px solid var(--outline-v)", overflow: "hidden"}}>
              <TimeBlockSchedule plan={plan} />
            </div>

            {/* Topics Review */}
            <div style={{marginBottom: 24}}>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
                <div style={{fontFamily:"'Newsreader',serif",fontSize:16,fontWeight:700,color:"var(--brown)"}}>Topics Review</div>
                <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,fontWeight:700,color:"var(--orange-m)",cursor:"pointer"}}>
                  + Add Topic
                </div>
              </div>
              
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {plan.topics.map((t, idx) => {
                  const topicIcons = ["📚", "🔬", "#️⃣", "📖", "🎯", "✍️", "💡", "🧩"];
                  const icon = topicIcons[idx % topicIcons.length];
                  
                  return (
                    <div key={t.id} className={`${removed.has(t.id)?"removed":""} ${editing===t.id?"editing":""}`} style={{
                      background:"var(--bg-low)",
                      borderRadius:16,
                      padding:16,
                      border:`1.5px solid ${editing===t.id ? "var(--orange-m)" : removed.has(t.id) ? "var(--red-bg)" : "var(--outline-v)"}`,
                      transition:"all 0.2s",
                      opacity:removed.has(t.id) ? 0.5 : 1
                    }}>
                      <div style={{display:"flex",gap:12}}>
                        {/* Icon */}
                        <div style={{
                          width:44,
                          height:44,
                          borderRadius:12,
                          background:"rgba(244,123,32,0.15)",
                          display:"flex",
                          alignItems:"center",
                          justifyContent:"center",
                          fontSize:20,
                          flexShrink:0
                        }}>
                          {icon}
                        </div>

                        {/* Content */}
                        <div style={{flex:1,minWidth:0}}>
                          {editing===t.id ? (
                            <div style={{display:"flex",flexDirection:"column",gap:6}}>
                              <input 
                                className="edit-inline" 
                                value={editBuf.title} 
                                onChange={e=>setEditBuf(b=>({...b,title:e.target.value}))} 
                                placeholder="Topic title"
                                style={{fontFamily:"'Newsreader',serif",fontSize:13}}
                              />
                              <textarea
                                className="edit-inline"
                                value={editBuf.description}
                                onChange={e=>setEditBuf(b=>({...b,description:e.target.value}))}
                                placeholder="Description"
                                style={{fontFamily:"'Noto Serif',serif",fontSize:11,minHeight:60}}
                              />
                              <div style={{display:"flex",gap:6}}>
                                <button style={{flex:1,padding:"8px 12px",borderRadius:8,border:"none",background:"var(--orange)",color:"white",fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={()=>saveEdit(t.id)}>
                                  <Check size={12} style={{display:"inline",marginRight:4}}/>Save
                                </button>
                                <button style={{flex:1,padding:"8px 12px",borderRadius:8,border:"1px solid var(--outline-v)",background:"white",color:"var(--outline)",fontFamily:"'Work Sans',sans-serif",fontSize:11,fontWeight:700,cursor:"pointer"}} onClick={()=>setEditing(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div style={{fontFamily:"'Newsreader',serif",fontSize:14,fontWeight:700,color:"var(--brown)",marginBottom:4,textDecoration:removed.has(t.id)?"line-through":"none"}}>
                                {t.title}
                              </div>
                              <div style={{fontFamily:"'Noto Serif',serif",fontSize:11,color:"var(--brown-m)",lineHeight:1.4,marginBottom:8}}>
                                {t.description}
                              </div>
                              <div style={{display:"flex",gap:8,alignItems:"center"}}>
                                <div style={{
                                  background:"rgba(244,123,32,0.1)",
                                  color:"var(--orange-m)",
                                  fontFamily:"'Work Sans',sans-serif",
                                  fontSize:8,
                                  fontWeight:700,
                                  letterSpacing:0.5,
                                  textTransform:"uppercase",
                                  padding:"4px 8px",
                                  borderRadius:12
                                }}>
                                  {t.tag || "Study"}
                                </div>
                                <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:10,color:"var(--outline)",display:"flex",alignItems:"center",gap:3}}>
                                  <Clock size={12}/>
                                  {t.estimatedHours || 0} min
                                </div>
                              </div>
                            </>
                          )}
                        </div>

                        {/* Actions */}
                        {editing!==t.id && (
                          <div style={{display:"flex",gap:6,flexShrink:0}}>
                            <button 
                              onClick={()=>startEdit(t)}
                              style={{
                                width:28,
                                height:28,
                                borderRadius:8,
                                border:"none",
                                background:"rgba(244,123,32,0.1)",
                                color:"var(--orange-m)",
                                cursor:"pointer",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                transition:"background 0.15s"
                              }}
                              onMouseOver={e => e.target.style.background="rgba(244,123,32,0.2)"}
                              onMouseOut={e => e.target.style.background="rgba(244,123,32,0.1)"}
                              disabled={removed.has(t.id)}
                            >
                              <Edit3 size={14}/>
                            </button>
                            <button
                              onClick={()=>toggleRemove(t.id)}
                              style={{
                                width:28,
                                height:28,
                                borderRadius:8,
                                border:"none",
                                background:removed.has(t.id) ? "rgba(45,106,79,0.1)" : "rgba(186,26,26,0.1)",
                                color:removed.has(t.id) ? "var(--green)" : "var(--red)",
                                cursor:"pointer",
                                display:"flex",
                                alignItems:"center",
                                justifyContent:"center",
                                transition:"background 0.15s"
                              }}
                              onMouseOver={e => e.target.style.background=removed.has(t.id) ? "rgba(45,106,79,0.2)" : "rgba(186,26,26,0.2)"}
                              onMouseOut={e => e.target.style.background=removed.has(t.id) ? "rgba(45,106,79,0.1)" : "rgba(186,26,26,0.1)"}
                            >
                              {removed.has(t.id) ? <Plus size={14}/> : <Trash2 size={14}/>}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{display:"flex",flexDirection:"column",gap:10,marginBottom:20}}>
              <button 
                onClick={handleConfirm}
                disabled={activePlan.topics.length===0}
                style={{
                  width:"100%",
                  padding:"14px 16px",
                  borderRadius:12,
                  border:"none",
                  background:"var(--orange)",
                  color:"white",
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:13,
                  fontWeight:700,
                  cursor:"pointer",
                  transition:"opacity 0.15s,box-shadow 0.15s",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:6
                }}
                onMouseOver={e => {if(!e.target.disabled) {e.target.style.opacity="0.9"; e.target.style.boxShadow="0 4px 12px rgba(153,71,0,0.3)"}}}
                onMouseOut={e => {e.target.style.opacity="1"; e.target.style.boxShadow="none"}}
              >
                <CheckCircle2 size={16}/>Confirm & Add to Library
              </button>
              
              <button 
                onClick={()=>setShowRetry(v=>!v)}
                style={{
                  width:"100%",
                  padding:"14px 16px",
                  borderRadius:12,
                  border:"2px solid var(--orange)",
                  background:"white",
                  color:"var(--orange)",
                  fontFamily:"'Work Sans',sans-serif",
                  fontSize:13,
                  fontWeight:700,
                  cursor:"pointer",
                  transition:"all 0.15s",
                  display:"flex",
                  alignItems:"center",
                  justifyContent:"center",
                  gap:6
                }}
                onMouseOver={e => {e.target.style.background="var(--bg-dim)"; e.target.style.borderColor="var(--orange-m)"}}
                onMouseOut={e => {e.target.style.background="white"; e.target.style.borderColor="var(--orange)"}}
              >
                <RotateCcw size={16}/>Retry with AI
              </button>
            </div>

            {/* Retry / clarification */}
            {showRetry && (
              <div style={{
                background:"var(--bg-low)",
                borderRadius:14,
                padding:14,
                border:"1.5px dashed var(--outline-v)",
                marginBottom:20
              }}>
                <div style={{fontFamily:"'Newsreader',serif",fontSize:14,fontWeight:700,color:"var(--brown)",marginBottom:4}}>Tell Rumpel what to fix</div>
                <div style={{fontFamily:"'Work Sans',sans-serif",fontSize:10,color:"var(--outline)",marginBottom:10}}>Describe what's wrong and the AI will regenerate.</div>
                <textarea
                  placeholder={`e.g. "Add Chemistry, split History into two parts."`}
                  value={clarify}
                  onChange={e=>setClarify(e.target.value)}
                  style={{
                    width:"100%",
                    border:"1.5px solid var(--outline-v)",
                    borderRadius:10,
                    padding:"10px 12px",
                    fontSize:12,
                    fontFamily:"'Noto Serif',serif",
                    color:"var(--brown)",
                    background:"white",
                    outline:"none",
                    minHeight:70,
                    resize:"vertical",
                    marginBottom:10,
                    transition:"border-color 0.2s"
                  }}
                  onFocus={e => e.target.style.borderColor="var(--orange-m)"}
                  onBlur={e => e.target.style.borderColor="var(--outline-v)"}
                />
                <button
                  onClick={handleRetry}
                  disabled={!clarify.trim()}
                  style={{
                    width:"100%",
                    padding:"10px 12px",
                    borderRadius:10,
                    border:"none",
                    background:"var(--orange)",
                    color:"white",
                    fontFamily:"'Work Sans',sans-serif",
                    fontSize:11,
                    fontWeight:700,
                    cursor:"pointer",
                    transition:"opacity 0.15s",
                    opacity:!clarify.trim() ? 0.5 : 1
                  }}
                  onMouseOver={e => {if(clarify.trim()) e.target.style.opacity="0.9"}}
                  onMouseOut={e => e.target.style.opacity="1"}
                >
                  <img src={wheelIcon} alt="Retry" style={{width:"12px",height:"12px",marginRight:4,display:"inline"}}/>Retry
                </button>
              </div>
            )}
          </>
        )}

        {/* ── STEP: SUCCESS ── */}
        {step==="success" && (
          <>
            <div className="success-card">
              <div className="success-icon"><Check size={22} color="white"/></div>
              <div className="success-title">Plan Added!</div>
              <div className="success-sub">
                {activePlan?.topics?.length || 0} topics · {activePlan?.estimatedHours || 0}h estimated
              </div>
            </div>
            <div className="card" style={{marginTop:12}}>
              <div className="card-title">What was imported</div>
              <div className="divider"/>
              <div className="topic-list">
                {activePlan?.topics?.map(t=>(
                  <div key={t.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 0",borderBottom:"1px solid var(--outline-v)"}}>
                    <span style={{fontFamily:"'Work Sans',sans-serif",fontSize:9,fontWeight:700,padding:"1px 6px",borderRadius:18,background:"rgba(153,71,0,.1)",color:"var(--orange)"}}>{t.tag}</span>
                    <span style={{fontFamily:"'Newsreader',serif",fontSize:13,fontWeight:700,color:"var(--brown)",flex:1}}>{t.title}</span>
                    <span style={{fontFamily:"'Work Sans',sans-serif",fontSize:10,color:"var(--outline)"}}>{t.estimatedHours}h</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-full"
              style={{marginTop:4}}
              onClick={()=>{ setStep("archive"); setFiles([]); setPrompt(""); setDeadline(""); setPlan(null); setError(""); setClarify(""); setShowRetry(false); setPastedText(""); }}
            >
              ← Back to Plans
            </button>
            <button
              className="btn btn-yellow btn-full"
              style={{marginTop:6}}
              onClick={()=>{ setStep("upload"); setFiles([]); setPrompt(""); setDeadline(""); setPlan(null); setError(""); setClarify(""); setShowRetry(false); setPastedText(""); }}
            >
              <Plus size={12}/> Create Another
            </button>
          </>
        )}

        </div>
      </div>
    </>
  );
}
