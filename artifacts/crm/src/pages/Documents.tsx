import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Upload, Search, FileText, FileSpreadsheet, Presentation, File, FolderOpen, Tag, Clock, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { mockDocuments, type MockDocument, type DocumentFolder } from "../lib/enterpriseData";

const FOLDERS: DocumentFolder[] = ["contracts", "proposals", "reports", "invoices", "briefs"];

const fileTypeIcons: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-5 h-5 text-red-500" />,
  docx: <FileText className="w-5 h-5 text-blue-500" />,
  xlsx: <FileSpreadsheet className="w-5 h-5 text-green-500" />,
  pptx: <Presentation className="w-5 h-5 text-orange-500" />,
  image: <File className="w-5 h-5 text-purple-500" />,
  other: <File className="w-5 h-5 text-muted-foreground" />,
};

const folderColors: Record<DocumentFolder, string> = {
  contracts: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
  proposals: "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300",
  reports: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  invoices: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  briefs: "bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300",
};

export default function Documents() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [folderFilter, setFolderFilter] = useState<DocumentFolder | "all">("all");

  const filtered = mockDocuments.filter(doc => {
    const matchSearch = doc.name.toLowerCase().includes(search.toLowerCase()) ||
      (doc.client_name || "").toLowerCase().includes(search.toLowerCase()) ||
      doc.tags.some(tag => tag.includes(search));
    const matchFolder = folderFilter === "all" || doc.folder === folderFilter;
    return matchSearch && matchFolder;
  });

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
  }

  const counts: Record<string, number> = {
    all: mockDocuments.length,
    ...Object.fromEntries(FOLDERS.map(f => [f, mockDocuments.filter(d => d.folder === f).length])),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("documents.title")}</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{t("documents.subtitle")}</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Upload className="w-4 h-4" />
          {t("documents.upload")}
        </button>
      </div>

      {/* Folder tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {FOLDERS.map(folder => (
          <button
            key={folder}
            onClick={() => setFolderFilter(folderFilter === folder ? "all" : folder)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all",
              folderFilter === folder
                ? "border-primary bg-primary/5"
                : "border-border bg-card hover:border-primary/40 hover:bg-muted/30"
            )}
          >
            <FolderOpen className={cn("w-7 h-7",
              folderFilter === folder ? "text-primary" :
              folder === "contracts" ? "text-blue-500" :
              folder === "proposals" ? "text-purple-500" :
              folder === "reports" ? "text-emerald-500" :
              folder === "invoices" ? "text-amber-500" : "text-pink-500"
            )} />
            <span className="text-xs font-medium text-center leading-tight">
              {t(`documents.folders.${folder}`)}
            </span>
            <span className="text-xs text-muted-foreground">{counts[folder] || 0}</span>
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          className="w-full ps-9 pe-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          placeholder={t("documents.search")}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* Documents Grid */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-16 text-center text-muted-foreground">
          {t("documents.noDocuments")}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(doc => (
            <DocumentCard key={doc.id} doc={doc} folderColors={folderColors} formatDate={formatDate} />
          ))}
        </div>
      )}
    </div>
  );
}

function DocumentCard({ doc, folderColors, formatDate }: {
  doc: MockDocument;
  folderColors: Record<DocumentFolder, string>;
  formatDate: (iso: string) => string;
}) {
  const { t } = useTranslation();

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
          {fileTypeIcons[doc.file_type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium leading-snug line-clamp-2 group-hover:text-primary transition-colors">
            {doc.name}
          </p>
          {doc.campaign_name && (
            <p className="text-xs text-muted-foreground mt-0.5 truncate">📋 {doc.campaign_name}</p>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", folderColors[doc.folder])}>
          {t(`documents.folders.${doc.folder}`)}
        </span>
        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full uppercase">
          {doc.file_type}
        </span>
        <span className="text-xs text-muted-foreground">{doc.file_size}</span>
        {doc.version > 1 && (
          <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            v{doc.version}
          </span>
        )}
      </div>

      {doc.tags.length > 0 && (
        <div className="mt-2 flex items-center gap-1 flex-wrap">
          <Tag className="w-3 h-3 text-muted-foreground flex-shrink-0" />
          {doc.tags.map(tag => (
            <span key={tag} className="text-xs text-muted-foreground/70 bg-muted/50 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3 pt-3 border-t border-border flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <User className="w-3 h-3" />
          <span>{doc.uploaded_by}</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{formatDate(doc.uploaded_at)}</span>
        </div>
      </div>

      <button className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-lg border border-border text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground transition-colors">
        {t("documents.download")}
      </button>
    </div>
  );
}
