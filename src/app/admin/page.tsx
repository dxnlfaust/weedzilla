import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  approveSpecies,
  rejectSpecies,
  dismissPostReport,
  hidePostFromReport,
  removePostFromReport,
  dismissCommentReport,
  hideCommentFromReport,
  banUser,
  unbanUser,
  unhidePost,
  processWinners,
} from "./actions";
import { MergeSpeciesForm } from "@/components/admin/MergeSpeciesForm";

// ============================================================
// Types
// ============================================================

interface PendingSpecies {
  id: number;
  scientific_name: string;
  common_names: string[];
  family: string | null;
  created_at: string;
  submitter: { display_name: string } | null;
}

interface PostReport {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { display_name: string } | null;
  post: {
    id: string;
    image_url: string;
    post_type: string;
    caption: string | null;
    site_description: string | null;
    is_hidden: boolean;
    is_removed: boolean;
    author: { id: string; display_name: string; is_banned: boolean } | null;
    species: { scientific_name: string } | null;
  } | null;
}

interface CommentReport {
  id: string;
  reason: string;
  details: string | null;
  created_at: string;
  reporter: { display_name: string } | null;
  comment: {
    id: string;
    content: string;
    is_hidden: boolean;
    author: { id: string; display_name: string; is_banned: boolean } | null;
  } | null;
}

interface HiddenPost {
  id: string;
  image_url: string;
  caption: string | null;
  site_description: string | null;
  report_count: number;
  created_at: string;
  author: { id: string; display_name: string } | null;
  species: { scientific_name: string } | null;
}

// ============================================================
// Page
// ============================================================

export default async function AdminPage() {
  const supabase = createAdminClient();
  const authClient = await createClient();
  const {
    data: { user: adminUser },
  } = await authClient.auth.getUser();

  const [
    { data: speciesRaw },
    { data: postReportsRaw },
    { data: commentReportsRaw },
    { data: hiddenPostsRaw },
    { data: currentWeekData },
  ] = await Promise.all([
    supabase
      .from("species")
      .select("id, scientific_name, common_names, family, created_at, submitter:submitted_by(display_name)")
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("reports")
      .select(`
        id, reason, details, created_at,
        reporter:reporter_id(display_name),
        post:post_id(
          id, image_url, post_type, caption, site_description, is_hidden, is_removed,
          author:user_id(id, display_name, is_banned),
          species:species_id(scientific_name)
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("comment_reports")
      .select(`
        id, reason, details, created_at,
        reporter:reporter_id(display_name),
        comment:comment_id(
          id, content, is_hidden,
          author:user_id(id, display_name, is_banned)
        )
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: true }),
    supabase
      .from("posts")
      .select(`
        id, image_url, caption, site_description, report_count, created_at,
        author:user_id(id, display_name),
        species:species_id(scientific_name)
      `)
      .eq("is_hidden", true)
      .eq("is_removed", false)
      .order("report_count", { ascending: false })
      .limit(20),
    authClient.rpc("current_week_year"),
  ]);

  const pendingSpecies = (speciesRaw || []) as unknown as PendingSpecies[];
  const postReports = (postReportsRaw || []) as unknown as PostReport[];
  const commentReports = (commentReportsRaw || []) as unknown as CommentReport[];
  const hiddenPosts = (hiddenPostsRaw || []) as unknown as HiddenPost[];
  const currentWeek = (currentWeekData as string) || "";

  return (
    <div className="max-w-4xl mx-auto space-y-10">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Pending Species" value={pendingSpecies.length} color="text-eucalypt" />
        <StatCard label="Post Reports" value={postReports.length} color="text-red" />
        <StatCard label="Comment Reports" value={commentReports.length} color="text-red" />
        <StatCard label="Hidden Posts" value={hiddenPosts.length} color="text-gold" />
      </div>

      {/* ── SPECIES QUEUE ── */}
      <section>
        <SectionHeader title="Species Queue" count={pendingSpecies.length} />
        {pendingSpecies.length === 0 ? (
          <Empty text="No pending species." />
        ) : (
          <div className="space-y-3">
            {pendingSpecies.map((s) => (
              <div key={s.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-medium text-carbon italic">{s.scientific_name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      Submitted by {s.submitter?.display_name || "unknown"} ·{" "}
                      {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <form action={approveSpecies} className="space-y-2">
                  <input type="hidden" name="id" value={s.id} />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Scientific name</label>
                      <input
                        name="scientific_name"
                        defaultValue={s.scientific_name}
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none italic"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Family</label>
                      <input
                        name="family"
                        defaultValue={s.family || ""}
                        placeholder="e.g. Verbenaceae"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-gray-500 block mb-1">Common names (comma-sep.)</label>
                      <input
                        name="common_names"
                        defaultValue={s.common_names.join(", ")}
                        placeholder="e.g. Lantana, Wild sage"
                        className="w-full border border-gray-200 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="submit" className="btn-success text-sm px-3 py-1.5">
                      Approve
                    </button>
                  </div>
                </form>
                <div className="flex items-center gap-2 mt-2">
                  <form action={rejectSpecies}>
                    <input type="hidden" name="id" value={s.id} />
                    <button type="submit" className="btn-danger text-sm px-3 py-1.5">
                      Reject
                    </button>
                  </form>
                  <MergeSpeciesForm pendingId={s.id} pendingName={s.scientific_name} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── POST REPORTS ── */}
      <section>
        <SectionHeader title="Post Reports" count={postReports.length} danger />
        {postReports.length === 0 ? (
          <Empty text="No pending post reports." />
        ) : (
          <div className="space-y-3">
            {postReports.map((r) => {
              if (!r.post) return null;
              const post = r.post;
              const author = post.author;
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex gap-4">
                    {/* Thumbnail */}
                    <Link href={`/post/${post.id}`} target="_blank" className="shrink-0">
                      <img
                        src={post.image_url}
                        alt="Reported post"
                        className="h-20 w-20 object-cover rounded border border-gray-100"
                      />
                    </Link>
                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-1">
                        <span>
                          Post by{" "}
                          <span className={`font-medium ${author?.is_banned ? "text-red" : "text-carbon"}`}>
                            {author?.display_name || "unknown"}
                            {author?.is_banned && " (banned)"}
                          </span>
                        </span>
                        <span>
                          Reported by <span className="font-medium text-carbon">{r.reporter?.display_name}</span>
                        </span>
                        <span>
                          Reason: <span className="font-medium text-carbon">{r.reason}</span>
                        </span>
                        <span>{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.details && (
                        <p className="text-sm text-gray-600 mb-2 italic">&ldquo;{r.details}&rdquo;</p>
                      )}
                      {post.is_hidden && (
                        <span className="inline-block text-xs bg-gold/10 text-gold px-2 py-0.5 rounded mb-2">
                          Auto-hidden
                        </span>
                      )}
                      <div className="flex flex-wrap gap-2 mt-2">
                        <ActionForm action={dismissPostReport} reportId={r.id} label="Dismiss" className="btn-ghost" />
                        <ActionForm action={hidePostFromReport} reportId={r.id} postId={post.id} label="Hide Post" className="btn-warning" />
                        <ActionForm action={removePostFromReport} reportId={r.id} postId={post.id} label="Remove Post" className="btn-danger" />
                        {author && !author.is_banned && (
                          <BanForm userId={author.id} defaultReason={`Report: ${r.reason}`} />
                        )}
                        {author && author.is_banned && (
                          <UnbanForm userId={author.id} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── COMMENT REPORTS ── */}
      <section>
        <SectionHeader title="Comment Reports" count={commentReports.length} danger />
        {commentReports.length === 0 ? (
          <Empty text="No pending comment reports." />
        ) : (
          <div className="space-y-3">
            {commentReports.map((r) => {
              if (!r.comment) return null;
              const comment = r.comment;
              const author = comment.author;
              return (
                <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-gray-400 mb-2">
                    <span>
                      Comment by{" "}
                      <span className={`font-medium ${author?.is_banned ? "text-red" : "text-carbon"}`}>
                        {author?.display_name || "unknown"}
                        {author?.is_banned && " (banned)"}
                      </span>
                    </span>
                    <span>
                      Reported by <span className="font-medium text-carbon">{r.reporter?.display_name}</span>
                    </span>
                    <span>
                      Reason: <span className="font-medium text-carbon">{r.reason}</span>
                    </span>
                  </div>
                  <p className="text-sm text-carbon bg-gray-50 rounded px-3 py-2 mb-3 border border-gray-100">
                    {comment.content}
                  </p>
                  {r.details && (
                    <p className="text-xs text-gray-500 italic mb-2">&ldquo;{r.details}&rdquo;</p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    <ActionForm action={dismissCommentReport} reportId={r.id} label="Dismiss" className="btn-ghost" />
                    <ActionForm action={hideCommentFromReport} reportId={r.id} commentId={comment.id} label="Hide Comment" className="btn-warning" />
                    {author && !author.is_banned && (
                      <BanForm userId={author.id} defaultReason={`Comment report: ${r.reason}`} />
                    )}
                    {author && author.is_banned && (
                      <UnbanForm userId={author.id} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ── HIDDEN POSTS ── */}
      <section>
        <SectionHeader title="Hidden Posts" count={hiddenPosts.length} />
        <p className="text-xs text-gray-400 mb-3">Posts auto-hidden after reaching the report threshold. Review and unhide if appropriate, or remove permanently.</p>
        {hiddenPosts.length === 0 ? (
          <Empty text="No hidden posts." />
        ) : (
          <div className="space-y-2">
            {hiddenPosts.map((p) => (
              <div key={p.id} className="bg-white border border-gray-200 rounded-lg p-3 flex gap-3 items-center">
                <Link href={`/post/${p.id}`} target="_blank" className="shrink-0">
                  <img src={p.image_url} alt="" className="h-12 w-12 object-cover rounded border border-gray-100" />
                </Link>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-carbon truncate">
                    {p.species?.scientific_name || p.site_description || p.caption || "Post"}
                  </p>
                  <p className="text-xs text-gray-400">
                    By {p.author?.display_name || "unknown"} · {p.report_count} report{p.report_count !== 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-2 shrink-0">
                  <form action={unhidePost}>
                    <input type="hidden" name="post_id" value={p.id} />
                    <button type="submit" className="btn-ghost text-xs px-2 py-1">Unhide</button>
                  </form>
                  <form action={removePostFromReport}>
                    <input type="hidden" name="report_id" value="" />
                    <input type="hidden" name="post_id" value={p.id} />
                    <button type="submit" className="btn-danger text-xs px-2 py-1">Remove</button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── PROCESS WINNERS ── */}
      <section>
        <SectionHeader title="Process Winners" />
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <p className="text-sm text-gray-500 mb-3">
            Manually trigger winner processing for a specific week. Current week: <span className="font-mono font-medium text-carbon">{currentWeek}</span>
          </p>
          <form action={processWinners} className="flex gap-2 items-end">
            <div>
              <label className="text-xs text-gray-500 block mb-1">Week (YYYY-Www)</label>
              <input
                name="week_year"
                defaultValue={currentWeek}
                placeholder="e.g. 2026-W14"
                pattern="\d{4}-W\d{2}"
                className="border border-gray-200 rounded px-3 py-1.5 text-sm font-mono focus:ring-2 focus:ring-eucalypt focus:border-eucalypt outline-none w-36"
                required
              />
            </div>
            <button type="submit" className="btn-success text-sm px-4 py-1.5">
              Process
            </button>
          </form>
        </div>
      </section>

      {/* Footer note */}
      <p className="text-xs text-gray-300 text-center pb-4">
        Admin session: {adminUser?.email}
      </p>
    </div>
  );
}

// ============================================================
// Sub-components
// ============================================================

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-lg px-4 py-3">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{label}</p>
    </div>
  );
}

function SectionHeader({ title, count, danger }: { title: string; count?: number; danger?: boolean }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <h2 className="text-base font-bold text-carbon">{title}</h2>
      {count !== undefined && count > 0 && (
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${danger ? "bg-red/10 text-red" : "bg-eucalypt/10 text-eucalypt"}`}>
          {count}
        </span>
      )}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="text-sm text-gray-400 bg-gray-50 rounded-lg px-4 py-3 border border-gray-100">{text}</p>;
}

function ActionForm({
  action,
  reportId,
  postId,
  commentId,
  label,
  className,
}: {
  action: (formData: FormData) => Promise<void>;
  reportId: string;
  postId?: string;
  commentId?: string;
  label: string;
  className: string;
}) {
  return (
    <form action={action}>
      <input type="hidden" name="report_id" value={reportId} />
      {postId && <input type="hidden" name="post_id" value={postId} />}
      {commentId && <input type="hidden" name="comment_id" value={commentId} />}
      <button type="submit" className={`${className} text-sm px-3 py-1.5`}>
        {label}
      </button>
    </form>
  );
}

function BanForm({ userId, defaultReason }: { userId: string; defaultReason: string }) {
  return (
    <form action={banUser} className="flex gap-1">
      <input type="hidden" name="user_id" value={userId} />
      <input
        name="ban_reason"
        defaultValue={defaultReason}
        placeholder="Ban reason"
        className="border border-gray-200 rounded px-2 py-1 text-xs w-44 focus:ring-1 focus:ring-red outline-none"
      />
      <button type="submit" className="btn-danger text-sm px-3 py-1.5">Ban User</button>
    </form>
  );
}

function UnbanForm({ userId }: { userId: string }) {
  return (
    <form action={unbanUser}>
      <input type="hidden" name="user_id" value={userId} />
      <button type="submit" className="btn-ghost text-sm px-3 py-1.5">Unban</button>
    </form>
  );
}
